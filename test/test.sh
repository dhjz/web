#!/usr/bin/env bash
# 把仓库内所有文件（本脚本、缓存文件除外）增量上传到 FTP 服务器。
#
# 默认走「快速模式」：本地状态缓存 test/test_cache.json 记录每个文件的
# SHA-256/size，内容没变就跳过；本地无改动时完全不连接服务器、不查远端。
# 用内容摘要而非 mtime 判定，保证工作区重新初始化（git 不保留 mtime）后缓存仍有效。
# VERIFY_REMOTE=1 时才拉远端列表（MLSD，不支持时回退 SIZE + MDTM）做完整比对。
#
# 用法：
#   bash test/test.sh                              # 增量上传（快速模式）
#   VERBOSE=1 bash test/test.sh                   # 打印每个文件的判定/查询明细
#   VERIFY_REMOTE=1 bash test/test.sh             # 强制拉远端列表逐项比对
#   FORCE=1 bash test/test.sh                     # 不做比较，全量重传
#   CHECK_ONLY=1 bash test/test.sh                # 连服务器比对，只列出待上传文件
#   DRY_RUN=1 bash test/test.sh                   # 只列本地文件，不联网
#   REMOTE_ROOT=public_html bash test/test.sh     # 换成其它目录；留空为账号根目录
#
# 默认上传到服务器账号下的 htdocs 目录。
# 环境变量：FTP_HOST / FTP_PORT / FTP_USER / FTP_PASS / REMOTE_ROOT / UPLOAD_GIT
#           DRY_RUN / CHECK_ONLY / FORCE / VERIFY_REMOTE / VERBOSE / SET_MTIME
#           MTIME_TOLERANCE / FTP_TIMEOUT
# 缓存文件：test/test_cache.json，可随仓库提交；删除即等于重置为首次全量上传。
set -euo pipefail

export FTP_HOST="${FTP_HOST:-ftpupload.net}"
export FTP_PORT="${FTP_PORT:-21}"
export FTP_USER="${FTP_USER:-yzzme_43386931}"
export FTP_PASS="${FTP_PASS:-dhj123456}"
export REMOTE_ROOT="${REMOTE_ROOT:-htdocs}"
export UPLOAD_GIT="${UPLOAD_GIT:-0}"
export DRY_RUN="${DRY_RUN:-0}"
export CHECK_ONLY="${CHECK_ONLY:-0}"
export FORCE="${FORCE:-0}"
export VERIFY_REMOTE="${VERIFY_REMOTE:-0}"
export VERBOSE="${VERBOSE:-0}"
export SET_MTIME="${SET_MTIME:-1}"
export MTIME_TOLERANCE="${MTIME_TOLERANCE:-2}"
export FTP_TIMEOUT="${FTP_TIMEOUT:-20}"

export REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
export SELF_REL="test/test.sh"

if ! command -v python3 >/dev/null 2>&1; then
  echo "错误：需要 python3（用于 ftplib 单连接批量上传）" >&2
  exit 1
fi

python3 - <<'PY'
import ftplib
import hashlib
import json
import os
import signal
import sys
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

signal.signal(signal.SIGPIPE, signal.SIG_DFL)

root = Path(os.environ["REPO_ROOT"])
self_rel = os.environ["SELF_REL"]
cache_rel = (Path(self_rel).parent / "test_cache.json").as_posix()
cache_path = root / cache_rel
remote_root = os.environ.get("REMOTE_ROOT", "").strip("/")
upload_git = os.environ.get("UPLOAD_GIT") == "1"
dry_run = os.environ.get("DRY_RUN") == "1"
check_only = os.environ.get("CHECK_ONLY") == "1"
force = os.environ.get("FORCE") == "1"
verify_remote = os.environ.get("VERIFY_REMOTE") == "1" or check_only
verbose = os.environ.get("VERBOSE") == "1"
set_mtime = os.environ.get("SET_MTIME") == "1"
tolerance = int(os.environ.get("MTIME_TOLERANCE", "2"))
timeout = int(os.environ.get("FTP_TIMEOUT", "20"))
errors = ftplib.all_errors + (ValueError, TypeError, KeyError)
target = "%s:%s/%s" % (os.environ["FTP_HOST"], os.environ["FTP_PORT"], remote_root)

# .git 内含 .git-credentials 等敏感信息，默认不上传；UPLOAD_GIT=1 可强制上传
skip_dirs = set() if upload_git else {".git"}
# 脚本与缓存都是本地状态，不属于站点内容，不上传
skip_files = {self_rel, cache_rel}

def remote_path(rel):
    return "/".join(part for part in (remote_root, rel) if part)

def ftp_ts_to_epoch(value):
    return int(datetime.strptime(value.split(".")[0], "%Y%m%d%H%M%S")
               .replace(tzinfo=timezone.utc).timestamp())

def epoch_to_ftp_ts(epoch):
    return datetime.fromtimestamp(int(epoch), timezone.utc).strftime("%Y%m%d%H%M%S")

def fmt_epoch(epoch):
    return datetime.fromtimestamp(epoch, timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

def file_hash(path):
    digest = hashlib.sha256()
    with path.open("rb") as fp:
        for chunk in iter(lambda: fp.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()

def load_cache():
    try:
        with cache_path.open("r", encoding="utf-8") as fp:
            data = json.load(fp)
        if not isinstance(data, dict) or data.get("version") != 2:
            return {}
        if data.get("target") != target:
            print(f"缓存目标（{data.get('target')}）与当前配置（{target}）不符，忽略旧缓存",
                  flush=True)
            return {}
        return data
    except (OSError, ValueError):
        return {}

def save_cache(data):
    text = json.dumps(data, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    try:
        if cache_path.exists() and cache_path.read_text(encoding="utf-8") == text:
            return
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        cache_path.write_text(text, encoding="utf-8")
        print(f"缓存已写入 {cache_rel}", flush=True)
    except OSError as exc:
        print(f"警告：缓存写入失败（{exc}）", file=sys.stderr)

files = []
for dirpath, dirnames, filenames in os.walk(root, followlinks=False):
    dirnames[:] = [d for d in dirnames if d not in skip_dirs]
    for name in filenames:
        path = Path(dirpath) / name
        if path.is_symlink():
            continue
        rel = path.relative_to(root).as_posix()
        if rel in skip_files:
            continue
        files.append((rel, path))
files.sort(key=lambda item: item[0])

cached = load_cache()
total = sum(path.stat().st_size for _, path in files)
print(f"本地 {len(files)} 个文件，共 {total / 1024 / 1024:.2f} MiB", flush=True)
print(f"目标目录：{remote_root or '/（账号根目录）'}", flush=True)
print(f"缓存文件：{cache_rel}"
      + ("" if cache_path.exists() else "（尚不存在，首次运行会创建）"), flush=True)

if dry_run:
    for rel, _ in files:
        print("  " + remote_path(rel))
    print("DRY_RUN=1：仅预览，未连接服务器")
    sys.exit(0)

# ---- 阶段 1/4：本地内容判定（纯本地，无网络） ----
print("[1/4] 读取本地文件并计算 SHA-256 …", flush=True)
t0 = time.monotonic()
stats, counts = [], Counter()
for index, (rel, path) in enumerate(files, 1):
    st = path.stat()
    digest = file_hash(path)
    old = cached.get("files", {}).get(rel)
    if force:
        status = "force"
    elif not isinstance(old, dict):
        status = "new"
    elif old.get("size") == st.st_size and old.get("sha256") == digest:
        status = "hit"
    else:
        status = "changed"
    counts[status] += 1
    stats.append({"rel": rel, "path": path, "st": st, "sha": digest, "status": status})
    if verbose:
        print(f"  [{index}/{len(files)}] {status:7s} {rel} ({st.st_size}B, {digest[:12]})",
              flush=True)
print(f"      完成，耗时 {time.monotonic() - t0:.1f}s：缓存命中 {counts['hit']}，"
      f"内容变更 {counts['changed']}，新增 {counts['new']}，强制 {counts['force']}", flush=True)
if not verbose:
    for item in stats:
        if item["status"] != "hit":
            print(f"      {'C' if item['status'] == 'changed' else 'A'} {item['rel']}", flush=True)

pending = [x for x in stats if x["status"] != "hit"]
skipped = [x for x in stats if x["status"] == "hit"]
known_dirs = set(cached.get("dirs", []))

def finish_cache(successful_rels, merge=False):
    # merge=True 用于 CHECK_ONLY：只读检查只补充结论，不删除已有条目
    entries = dict(cached.get("files", {})) if merge else {}
    for item in stats:
        if item["status"] == "hit" or item["rel"] in successful_rels:
            # 只记内容特征：工作区重建后 mtime 必变，写进缓存会产生无谓的仓库 diff
            entries[item["rel"]] = {
                "size": item["st"].st_size,
                "sha256": item["sha"],
            }
    save_cache({"version": 2, "target": target, "files": entries,
                "dirs": sorted(d for d in known_dirs if d)})

if not verify_remote and not pending:
    print("[2/4] 本地无改动，跳过连接与远端查询（VERIFY_REMOTE=1 可强制校验远端）")
    print("[3/4] 跳过  [4/4] 跳过")
    finish_cache(set())
    sys.exit(0)

# ---- 阶段 2/4：连接 ----
print(f"[2/4] 连接 {os.environ['FTP_HOST']}:{os.environ['FTP_PORT']} …", flush=True)
t0 = time.monotonic()
try:
    ftp = ftplib.FTP()
    ftp.encoding = "utf-8"
    ftp.connect(os.environ["FTP_HOST"], int(os.environ["FTP_PORT"]), timeout=timeout)
    ftp.sock.settimeout(timeout)
    ftp.login(os.environ["FTP_USER"], os.environ["FTP_PASS"])
except Exception as exc:
    print(f"FTP 连接/登录失败：{exc}", file=sys.stderr)
    sys.exit(1)
print(f"      已登录，耗时 {time.monotonic() - t0:.1f}s", flush=True)

ftp.set_pasv(True)
ftp.voidcmd("TYPE I")

def detect_features():
    try:
        resp = ftp.sendcmd("FEAT").upper()
        print(f"      FEAT: {'MLSD' if 'MLSD' in resp else '无 MLSD'} / "
              f"{'MFMT' if 'MFMT' in resp else '无 MFMT'}", flush=True)
        return resp
    except errors:
        print("      FEAT 不可用，改用试探方式判断能力", flush=True)
        return None

features = detect_features()
existing_dirs = set()

# ---- 阶段 3/4：远端查询（仅 VERIFY_REMOTE / CHECK_ONLY 时执行） ----
if verify_remote:
    remotes = [remote_path(x["rel"]) for x in stats]
    parents = {r.rsplit("/", 1)[0] if "/" in r else "" for r in remotes}
    dirs = set(parents)
    for parent in parents:
        parts = [p for p in parent.split("/") if p]
        for i in range(1, len(parts)):
            dirs.add("/".join(parts[:i]))
    dirs = sorted(dirs, key=lambda d: (d.count("/"), d))
    scan_start = time.monotonic()
    print(f"[3/4] 开始查询远端，共 {len(dirs)} 个目录 …", flush=True)

    def mlsd_supported():
        """FEAT 不可用时，用必然存在的登录根目录试探 MLSD。"""
        try:
            list(ftp.mlsd(""))
        except errors:
            return False
        return True

    def scan_mlsd():
        info, existing = {}, set()
        for index, directory in enumerate(dirs, 1):
            t = time.monotonic()
            try:
                entries = list(ftp.mlsd(directory))
            except errors as exc:
                print(f"  [{index}/{len(dirs)}] MLSD {directory or '/'} → 失败 {exc} "
                      f"({time.monotonic() - t:.1f}s)", flush=True)
                if str(exc).startswith("550"):
                    if not directory:
                        return None, set()
                    continue  # 远端目录还不存在
                if str(exc).startswith(("500", "501", "502", "504")):
                    return None, set()
                return None, set()
            existing.add(directory)
            n = 0
            for name, facts in entries:
                if facts.get("type") != "file":
                    continue
                full = "/".join(part for part in (directory, name) if part)
                try:
                    mtime = ftp_ts_to_epoch(facts["modify"]) if facts.get("modify") else None
                except ValueError:
                    mtime = None
                size = facts.get("size")
                info[full] = (mtime, int(size) if size is not None else None)
                n += 1
                if verbose:
                    print(f"      {full}  modify={facts.get('modify')} "
                          f"size={facts.get('size')}", flush=True)
            print(f"  [{index}/{len(dirs)}] MLSD {directory or '/'} → {n} 个文件 "
                  f"({time.monotonic() - t:.1f}s)", flush=True)
        return info, existing

    def scan_probe():
        info = {}
        for index, remote in enumerate(remotes, 1):
            t = time.monotonic()
            try:
                size = int(ftp.sendcmd("SIZE " + remote)[3:].strip())
                mtime = ftp_ts_to_epoch(ftp.sendcmd("MDTM " + remote)[3:].strip())
                info[remote] = (mtime, size)
                result = f"{size}B, {fmt_epoch(mtime)}"
            except errors as exc:
                result = "不存在/不支持（" + str(exc) + "）"
            if verbose or index % 10 == 0 or index == len(remotes):
                print(f"  [{index}/{len(remotes)}] SIZE+MDTM {remote} → {result} "
                      f"({time.monotonic() - t:.1f}s)", flush=True)
        return info

    mlsd_ok = mlsd_supported() if features is None else "MLSD" in features
    remote_state, existing_dirs = scan_mlsd() if mlsd_ok else (None, set())
    if remote_state is not None and not existing_dirs and not remote_state:
        # 所有目录都 550：区分「远端还没有这些目录」和「服务端其实不支持 MLSD」
        if not mlsd_supported():
            remote_state = None
    mode = "MLSD"
    if remote_state is None:
        mode = "MDTM/SIZE"
        print(f"      MLSD 不可用，改用 SIZE+MDTM 逐文件探测 {len(remotes)} 个 …",
              flush=True)
        remote_state = scan_probe()
    # MLSD 会把传输类型切成 ASCII，恢复二进制供 SIZE / STOR 使用
    ftp.voidcmd("TYPE I")
    print(f"      远端查询完成（{mode}，{len(remote_state)} 个文件，"
          f"耗时 {time.monotonic() - scan_start:.1f}s）", flush=True)

    # 远端缺失/大小不同必传；本地内容摘要命中且远端大小一致即视为已同步
    # （checkout 后 mtime 全变，不能拿它当唯一判据）；其余再看远端时间是否早于本地。
    pending, skipped = [], []
    for item in stats:
        st, rel = item["st"], item["rel"]
        local_hit = item["status"] == "hit"
        state = remote_state.get(remote_path(rel))
        if force:
            changed, reason = True, "FORCE"
        elif state is None:
            changed, reason = True, "远端缺失"
        else:
            r_mtime, r_size = state
            if r_size is not None and r_size != st.st_size:
                changed, reason = True, "大小不同"
            elif local_hit:
                changed, reason = False, "内容未变"
            elif r_mtime is not None and r_mtime < int(st.st_mtime) - tolerance:
                changed, reason = True, "本地更新"
            else:
                changed, reason = False, "已同步"
        if verbose:
            print(f"      {'U' if changed else '='} {remote_path(rel)} "
                  f"本地 {fmt_epoch(int(st.st_mtime))}/{st.st_size}B / "
                  f"远端 {fmt_epoch(state[0]) if state and state[0] else '?'} / "
                  f"{state[1] if state else '?'}B → {'上传' if changed else '跳过'}"
                  f"（{reason}）", flush=True)
        item["status"] = "upload" if changed else "hit"
        (pending if changed else skipped).append(item)
else:
    print("[3/4] 快速模式：按本地缓存判定，跳过远端查询", flush=True)

skipped_bytes = sum(x["st"].st_size for x in skipped)
pending_bytes = sum(x["st"].st_size for x in pending)
print(f"      跳过 {len(skipped)} 个（{skipped_bytes / 1024 / 1024:.2f} MiB），"
      f"需上传 {len(pending)} 个（{pending_bytes / 1024 / 1024:.2f} MiB）", flush=True)

def close_ftp():
    try:
        ftp.quit()
    except Exception:
        ftp.close()

if check_only:
    for item in pending:
        print("  U " + remote_path(item["rel"]))
    print("CHECK_ONLY=1：只比对，未上传")
    known_dirs |= existing_dirs
    print(f"      将 {len(skipped)} 个已同步文件、{len(existing_dirs)} 个远端目录写入缓存"
          f"（依据远端 size/mtime，非内容校验；不清除已有条目）", flush=True)
    finish_cache(set(), merge=True)
    close_ftp()
    sys.exit(0)

if not pending:
    print("[4/4] 全部为最新，无需上传")
    known_dirs |= existing_dirs
    finish_cache(set())
    close_ftp()
    sys.exit(0)

# ---- 阶段 4/4：上传 ----
print(f"[4/4] 开始上传 {len(pending)} 个文件 …", flush=True)
created = set(existing_dirs) | known_dirs

def ensure_dir(directory):
    if not directory or directory in created:
        return
    parent = directory.rsplit("/", 1)[0] if "/" in directory else ""
    ensure_dir(parent)
    try:
        ftp.mkd(directory)
    except ftplib.error_perm:
        # 目录已存在时服务端返回 550，用 CWD 确认它确实存在
        current = ftp.pwd()
        try:
            ftp.cwd(directory)
        finally:
            ftp.cwd(current)
    created.add(directory)

# FEAT 明确列出 MFMT 才启用，避免每个文件都白试一次
mfmt_available = set_mtime and (features is None or "MFMT" in features)
ok, failed, succeeded_rels = 0, [], set()
t0 = time.monotonic()
for index, item in enumerate(pending, 1):
    rel, path, st = item["rel"], item["path"], item["st"]
    remote = remote_path(rel)
    parent = remote.rsplit("/", 1)[0] if "/" in remote else ""
    try:
        if parent:
            ensure_dir(parent)
        with path.open("rb") as fp:
            ftp.storbinary("STOR " + remote, fp, blocksize=64 * 1024)
        if mfmt_available:
            try:
                ftp.voidcmd("MFMT " + epoch_to_ftp_ts(st.st_mtime) + " " + remote)
            except ftplib.all_errors:
                mfmt_available = False
                print("      服务端不支持 MFMT：远端时间保持为上传时间，"
                      "若两端时钟偏差较大可调大 MTIME_TOLERANCE", file=sys.stderr)
        ok += 1
        succeeded_rels.add(rel)
        print(f"  [{index}/{len(pending)}] {remote}", flush=True)
    except Exception as exc:
        failed.append((remote, str(exc)))
        print(f"  失败 {remote}: {exc}", file=sys.stderr)

known_dirs = created
close_ftp()
finish_cache(succeeded_rels)

print(f"完成：上传 {ok}/{len(pending)}，跳过 {len(skipped)}，耗时 {time.monotonic() - t0:.1f}s")
if failed:
    print("以下文件上传失败：", file=sys.stderr)
    for remote, err in failed:
        print(f"  {remote}: {err}", file=sys.stderr)
    sys.exit(1)
PY

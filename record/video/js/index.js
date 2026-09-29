import { QUALITY_BITRATES, ScreenRecorder, mixAudioTracks } from './recorder.js';
import {
  deviceLabel,
  micErrorMessage,
  onDeviceChange,
  openMicStream,
  requestMicAccess,
  stopStream,
} from './microphone.js';
import { convertToMp4 } from './mp4.js';
import { withDuration } from './remux.js';
import {
  aspectRatio,
  countdown,
  downloadBlob,
  filename,
  formatBitrate,
  formatDuration,
  formatSize,
  formatTime,
  supportsH264Webm,
} from './utils.js';

const { createApp, computed, reactive, ref, watch, onBeforeUnmount } = Vue;

const THEME_KEY = 'recorder-theme';

createApp({
  setup() {
    const form = reactive({
      surface: 'screen',
      systemAudio: true,
      micAudio: false,
      micDeviceId: '',
      delay: 3,
      format: 'webm',
      quality: 'standard',
      webmCodec: 'auto',
    });

    /** 自定义档位的输入框值（kbps，字符串是为了让用户能把内容删空重打） */
    const customKbps = ref('');

    const captureSurfaces = [
      { value: 'screen', label: '整个屏幕' },
      { value: 'window', label: '指定窗口' },
    ];
    const formats = [
      { value: 'webm', label: 'WebM' },
      { value: 'mp4', label: 'MP4' },
    ];
    const qualities = [
      { value: 'smooth', label: '流畅' },
      { value: 'standard', label: '标准' },
      { value: 'high', label: '最高' },
      { value: 'custom', label: '自定义' },
    ];

    const CUSTOM_MIN_KBPS = 100;
    const CUSTOM_MAX_KBPS = 200_000;
    /** 自定义档位默认值：和「标准」拉开一点，别一进来就撞上预设 */
    const CUSTOM_DEFAULT_KBPS = 4000;
    const webmCodecs = [
      { value: 'auto', label: '自动' },
      { value: 'h264', label: 'H.264' },
    ];

    /** 主题：浅色为准，选了深色才写 localStorage；没有 storage（隐身模式）也不影响切换 */
    const readTheme = () => {
      try {
        return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
      } catch (e) {
        return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
      }
    };
    const theme = ref(readTheme());
    const themes = [
      { value: 'light', label: '白天' },
      { value: 'dark', label: '夜间' },
    ];
    watch(theme, (value) => {
      document.documentElement.dataset.theme = value;
      try {
        localStorage.setItem(THEME_KEY, value);
      } catch (e) {}
    }, { immediate: true });

    const previewVideo = ref(null);
    const running = ref(false);
    const paused = ref(false);
    const counting = ref(false);
    const countdownLeft = ref(0);
    const error = ref('');
    const resolution = ref('');
    const elapsed = ref(0);
    const estimatedSize = ref(0);
    const notice = ref('');
    const history = ref([]);
    const previewItem = ref(null);
    const activeTab = ref('preview');
    const h264Available = ref(supportsH264Webm());
    /** 可选的录音设备，标签里的名字只有拿到权限后才有 */
    const micDevices = ref([]);
    const micState = ref('idle');
    const micDetail = ref('');

    let recorder = null;
    /** 授权用的流，只在拿到权限后保持打开，用来稳定设备名 */
    let micGrant = null;
    const offDeviceChange = onDeviceChange(() => refreshMicDevices());
    let tickTimer = 0;
    let countdownTimer = 0;
    let idSeed = 0;

    const busy = computed(() => running.value || counting.value);
    const hasPreview = computed(() => running.value || counting.value);
    const lastRecording = computed(() => history.value[0] || null);
    const primaryLabel = computed(() => {
      if (counting.value) return `即将开始 ${countdownLeft.value}`;
      if (running.value) return '录制中…';
      return form.delay ? `开始录制（延迟 ${form.delay}s）` : '开始录制';
    });
    const recordingNotice = computed(() =>
      history.value.length ? '记录只保存在当前页面，刷新即清空' : '',
    );
    /** 只认 h264/vp9/av1 这几种，别拿 mime 串做子串匹配 */
    const isH264Active = (codec) => String(codec).toUpperCase() === 'H.264';
    const codecHint = computed(() => {
      if (!h264Available.value) {
        return '当前浏览器不支持 video/webm;codecs=h264，选了也会自动回退到 VP9，体积不变。';
      }
      if (form.webmCodec === 'h264') {
        return 'H.264 进 WebM 是伪 WebM，同画质比 VP9 更大，只有只认 H.264 的剪辑软件才需要。';
      }
      return '自动用 VP9，同等画质比 H.264 更省体积。';
    });
    const bitrate = computed(() =>
      elapsed.value > 0 ? (estimatedSize.value * 8) / (elapsed.value / 1000) : 0,
    );

    /**
     * 自定义档位真正生效的码率（bps）。
     * 输入框允许留空/打半截，这里统一兜底成默认值，避免把 NaN 传给 MediaRecorder。
     */
    const customBps = computed(() => clampKbps(customKbps.value) * 1000);

    const customPerMinute = computed(() => formatSize((customBps.value * 60) / 8));

    /** 当前档位对应的码率：0 表示交给浏览器自己决定 */
    const activeBitrate = computed(() =>
      form.quality === 'custom'
        ? customBps.value
        : QUALITY_BITRATES[form.quality] ?? QUALITY_BITRATES.standard,
    );

    /** 历史记录里显示的名字：自定义档把具体码率带出来，否则事后看不出当时录的多少 */
    const qualityLabel = computed(() => {
      if (form.quality !== 'custom') {
        return qualities.find((q) => q.value === form.quality)?.label || '';
      }
      return `自定义 ${formatBitrate(customBps.value)}`;
    });

    const qualityHint = computed(() => {
      if (form.quality === 'custom') {
        return `手动填 ${CUSTOM_MIN_KBPS}–${CUSTOM_MAX_KBPS} kbps，超出范围会按边界值算。`;
      }
      if (form.quality === 'high') {
        return '最高档只是不设上限，实际上限由分辨率和硬件决定。';
      }
      return '档位决定录制码率，体积 ≈ 码率 × 时长。想要更小就降档或降分辨率。';
    });

    function clampKbps(raw) {
      const n = Math.round(Number(raw));
      if (!Number.isFinite(n) || n <= 0) return CUSTOM_DEFAULT_KBPS;
      return Math.min(CUSTOM_MAX_KBPS, Math.max(CUSTOM_MIN_KBPS, n));
    }

    /** 回车或失焦时把输入框回写成合法值，用户看得到自己被规整成了什么 */
    function applyCustomKbps() {
      customKbps.value = String(clampKbps(customKbps.value));
    }

    /** 切到自定义档时给个默认值，别让输入框空着 */
    watch(() => form.quality, (value) => {
      if (value === 'custom' && !customKbps.value) {
        customKbps.value = String(CUSTOM_DEFAULT_KBPS);
      }
    });

    const micHint = computed(() => {
      if (micState.value === 'requesting') return '正在等待浏览器授权…';
      if (micState.value === 'ready') {
        const current = micDevices.value.find((d) => d.id === form.micDeviceId);
        return current
          ? `已选「${current.label}」，开始录制时直接用这只麦克风。`
          : '未指定设备时用系统默认麦克风。';
      }
      if (micState.value === 'denied') return micDetail.value;
      return '勾选后会向浏览器申请麦克风权限，拿到权限才能显示设备名。';
    });

    const canSelectMic = computed(() => micState.value === 'ready' && !busy.value);

    const micStateLabel = computed(() => ({
      idle: '未授权',
      requesting: '授权中…',
      ready: '已授权',
      denied: '被拒绝',
    }[micState.value]));

    /** 枚举到的设备没一个是用户之前选的那只（换了机器、拔了设备），就回落到默认 */
    function applyDevices(devices) {
      micDevices.value = devices.map((d, i) => ({ id: d.deviceId, label: deviceLabel(d, i) }));
      if (!micDevices.value.some((d) => d.id === form.micDeviceId)) form.micDeviceId = '';
    }

    /** 勾选麦克风即申请权限：拿到权限才有设备名，也顺带把授权弹窗提前到录制之前 */
    async function enableMic() {
      if (micState.value === 'requesting') return;
      micState.value = 'requesting';
      micDetail.value = '';
      try {
        const { stream, devices } = await requestMicAccess();
        // 留着这条流，浏览器才愿意继续把设备名给我们；真正录制时会另开一条
        stopStream(micGrant);
        micGrant = stream;
        applyDevices(devices);
        micState.value = 'ready';
      } catch (e) {
        micState.value = 'denied';
        micDetail.value = micErrorMessage(e);
      }
    }

    /** 重新枚举：用已有的授权流换设备列表，不弹第二次授权 */
    async function refreshMicDevices() {
      if (micState.value !== 'ready') return;
      try {
        applyDevices((await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audioinput'));
      } catch (e) {
        /* 枚举失败就先用旧列表，不值得打扰用户 */
      }
    }

    watch(() => form.micAudio, (on) => {
      if (on) enableMic();
    });

    function refreshStats() {
      if (!recorder) return;
      elapsed.value = recorder.elapsed;
      estimatedSize.value = recorder.size;
    }

    function onResize(width, height) {
      resolution.value = `${width} × ${height}`;
    }

    /** 浏览器不允许直接指定窗口或屏幕，只能由用户在系统弹窗里挑选 */
    function requestDisplay() {
      return navigator.mediaDevices.getDisplayMedia({
        video: form.surface === 'window' ? { displaySurface: 'window' } : { displaySurface: 'monitor' },
        audio: { suppressLocalAudioPlayback: false },
        selfBrowserSurface: 'exclude',
      });
    }

    /**
     * 系统声音随画面一起采集。只有当我们不想要系统声音时，
     * 才需要把它单独申请一次并丢弃，此时该音轨不会写进录制流。
     */
    async function collectAudio(displayStream) {
      const tracks = [];
      const labels = [];
      const errors = [];

      const systemTrack = displayStream.getAudioTracks()[0];
      if (form.systemAudio) {
        if (systemTrack) {
          tracks.push(systemTrack);
          labels.push('电脑声音');
        } else {
          errors.push('未捕获到系统声音：请在共享弹窗里勾选「分享系统音频」');
        }
      } else if (systemTrack) {
        systemTrack.stop();
      }

      if (form.micAudio) {
        try {
          const mic = await openMicStream(form.micDeviceId);
          tracks.push(mic.getAudioTracks()[0]);
          const picked = micDevices.value.find((d) => d.id === form.micDeviceId);
          labels.push(picked ? picked.label : '麦克风');
        } catch (e) {
          errors.push(micErrorMessage(e));
        }
      }

      return { track: mixAudioTracks(tracks), labels, errors };
    }

    async function start() {
      if (busy.value) return;
      error.value = '';
      notice.value = '';
      // 手动切回预览：不然预览区空着，看不到画面也看不到倒计时
      activeTab.value = 'preview';

      let displayStream;
      try {
        displayStream = await requestDisplay();
      } catch (e) {
        // 用户主动取消不需要报错
        if (e.name !== 'NotAllowedError') error.value = `无法获取录制画面：${e.message}`;
        return;
      }

      const audio = await collectAudio(displayStream);
      if (audio.errors.length) error.value = audio.errors.join('；');

      if (form.delay > 0) {
        counting.value = true;
        countdownLeft.value = form.delay;
        countdownTimer = countdown(form.delay, (left) => {
          countdownLeft.value = left;
        });
        await new Promise((r) => setTimeout(r, form.delay * 1000));
        clearInterval(countdownTimer);
        countdownTimer = 0;
        counting.value = false;
      }

      try {
        recorder = new ScreenRecorder({ onResize });
        await recorder.start({
          displayStream,
          audioTrack: audio.track,
          audioLabels: audio.labels,
          videoBitsPerSecond: activeBitrate.value,
          preferH264: form.webmCodec === 'h264' && h264Available.value,
          qualityLabel: qualityLabel.value,
        });
      } catch (e) {
        error.value = `启动录制失败：${e.message}`;
        audio.track?.stop();
        displayStream.getTracks().forEach((t) => t.stop());
        recorder = null;
        return;
      }

      if (form.webmCodec === 'h264' && !isH264Active(recorder.videoCodec)) {
        notice.value = `没能用上 H.264 的 WebM，已回退到 ${recorder.videoCodec}`;
      }
      running.value = true;
      paused.value = false;
      resolution.value = `${recorder.width} × ${recorder.height}`;
      if (previewVideo.value) previewVideo.value.srcObject = recorder.capture.stream;

      tickTimer = setInterval(refreshStats, 200);
      refreshStats();
    }

    async function stop() {
      if (!recorder) return;
      const current = recorder;
      recorder = null;
      running.value = false;
      paused.value = false;
      clearInterval(tickTimer);
      tickTimer = 0;

      const result = await current.stop();
      if (previewVideo.value) previewVideo.value.srcObject = null;
      if (!result || !result.blob.size) {
        error.value = '本次录制没有产生数据';
        return;
      }

      // 浏览器写的 WebM 不带时长，容易让部分播放器算短、吞掉末尾几秒，
      // 落库前统一补上。补的是元数据，不重编码。
      // 同时把真实录制时长传进去兜底：文件里的时间轴常常比实际录制短一截
      // （H.264 尤其明显），只信文件就会又少几秒。
      if (result.blob.type === 'video/webm') {
        try {
          result.blob = await withDuration(result.blob, result.duration);
        } catch (e) {
          console.warn('补写 WebM 时长失败，不影响录制结果', e);
        }
      }

      const item = addToHistory({
        blob: result.blob,
        ext: result.mimeType.includes('mp4') ? 'mp4' : 'webm',
        duration: result.duration,
        width: result.width,
        height: result.height,
        bitrate: result.bitrate,
        audioLabel: result.audioLabels.length ? result.audioLabels.join(' + ') : '静音',
        videoCodec: result.videoCodec,
        qualityLabel: result.qualityLabel,
      });

      // 录完自动落到「本次录制」，手动点开预览 tab 看回放时不会被抢走
      if (activeTab.value === 'preview') activeTab.value = 'result';

      // 导出格式选了 MP4，但浏览器只能录 WebM，停止后自动转一次
      if (form.format === 'mp4' && item.ext === 'webm') await exportAs(item, 'mp4');
    }

    function otherFormat(item) {
      return item.ext === 'webm' ? 'mp4' : 'webm';
    }

    function addToHistory({ blob, ext, duration, width, height, bitrate: bps, audioLabel, videoCodec, qualityLabel }) {
      const item = reactive({
        id: (idSeed += 1),
        blob,
        ext,
        duration,
        width,
        height,
        size: blob.size,
        bitrate: bps,
        resolution: `${width} × ${height}（${aspectRatio(width, height)}）`,
        audioLabel,
        videoCodec: videoCodec || '',
        qualityLabel: qualityLabel || '',
        createdAt: Date.now(),
        url: URL.createObjectURL(blob),
        filename: filename(ext),
        exporting: false,
      });
      history.value.unshift(item);
      return item;
    }

    async function exportAs(item, ext) {
      if (item.exporting || item.ext === ext) return;
      item.exporting = true;
      error.value = '';
      notice.value = '';
      try {
        if (ext === 'webm') {
          error.value = 'MP4 转 WebM 需要转码，未在本工具中实现';
          return;
        }
        const { blob, audioDropped } = await convertToMp4(item.blob, {
          width: item.width,
          height: item.height,
          bitrate: item.bitrate,
        });
        const converted = addToHistory({
          blob,
          ext: 'mp4',
          duration: item.duration,
          width: item.width,
          height: item.height,
          bitrate: (blob.size * 8) / (item.duration / 1000),
          videoCodec: 'H.264',
          qualityLabel: item.qualityLabel,
          // 音轨被丢弃时如实标注，避免用户以为导出的 MP4 有声音
          audioLabel: audioDropped ? `${item.audioLabel}（未编入）` : item.audioLabel,
        });
        if (audioDropped) notice.value = '当前浏览器不支持 AAC 编码，导出的 MP4 不含声音，WebM 版本声音完整';
        downloadBlob(converted.blob, converted.filename);
      } catch (e) {
        error.value = `导出 ${ext.toUpperCase()} 失败：${e.message}`;
      } finally {
        item.exporting = false;
      }
    }

    function download(item) {
      downloadBlob(item.blob, item.filename);
    }

    function togglePause() {
      if (!recorder) return;
      if (paused.value) {
        recorder.resume();
        paused.value = false;
      } else {
        recorder.pause();
        paused.value = true;
      }
      refreshStats();
    }

    function removeHistory(item) {
      const index = history.value.indexOf(item);
      if (index === -1) return;
      URL.revokeObjectURL(item.url);
      history.value.splice(index, 1);
      if (previewItem.value === item) previewItem.value = null;
    }

    function clearHistory() {
      history.value.forEach((item) => URL.revokeObjectURL(item.url));
      history.value = [];
      previewItem.value = null;
    }

    onBeforeUnmount(() => {
      offDeviceChange();
      clearInterval(countdownTimer);
      clearInterval(tickTimer);
      recorder?.teardown();
      history.value.forEach((item) => URL.revokeObjectURL(item.url));
    });

    return {
      form,
      theme,
      themes,
      activeTab,
      captureSurfaces,
      formats,
      qualities,
      webmCodecs,
      codecHint,
      micDevices,
      micState,
      micStateLabel,
      micHint,
      canSelectMic,
      customKbps,
      customPerMinute,
      qualityHint,
      applyCustomKbps,
      previewVideo,
      running,
      paused,
      counting,
      countdownLeft,
      busy,
      hasPreview,
      error,
      resolution,
      elapsed,
      estimatedSize,
      bitrate,
      history,
      lastRecording,
      previewItem,
      notice,
      primaryLabel,
      recordingNotice,
      start,
      stop,
      togglePause,
      exportAs,
      otherFormat,
      download,
      removeHistory,
      clearHistory,
      formatDuration,
      formatSize,
      formatTime,
      formatBitrate,
    };
  },
}).mount('#app');

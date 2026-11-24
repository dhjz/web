(function () {
  'use strict';

  var createApp = Vue.createApp;
  var ref = Vue.ref;
  var computed = Vue.computed;
  var watch = Vue.watch;
  var onMounted = Vue.onMounted;
  var onUnmounted = Vue.onUnmounted;
  var nextTick = Vue.nextTick;

  var PROVINCE_MAP = window.RADIO_PROVINCE_MAP || {};
  var STATIONS = (window.RADIO_STATIONS || []).map(function (s) {
    var key = String(s.p || '').trim().toLowerCase();
    if (PROVINCE_MAP[key]) s.p = PROVINCE_MAP[key];
    return s;
  });
  var FAV_KEY = 'fm-radio-favorites';
  var STATE_KEY = 'fm-radio-state';
  var COUNT_KEY = 'fm-radio-cloud-count';
  var USER_KEY = 'fm-radio-cloud-user';
  var CLOUD_BASE = 'https://x.199311.xyz';

  function unique(list) {
    var seen = {};
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var v = list[i];
      if (v && !seen[v]) { seen[v] = 1; out.push(v); }
    }
    return out;
  }

  function loadFavorites() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]') || []; }
    catch (e) { return []; }
  }

  function loadUser() {
    try { return localStorage.getItem(USER_KEY) || ''; }
    catch (e) { return ''; }
  }

  function loadState() {
    try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  createApp({
    setup: function () {
      var saved = loadState();
      var query = ref(saved.query || '');
      var province = ref(saved.province || '全部');
      var category = ref(saved.category || '全部');
      var onlyMusic = ref(!!saved.onlyMusic);
      var favorites = ref(loadFavorites());
      var favMode = ref(!!saved.favMode);
      var cloudUser = ref(loadUser());
      var cloudStatus = ref('');
      var syncedCount = ref(0);
      var fileInput = ref(null);
      var idx = ref(Number(saved.idx) || 0);
      var playing = ref(false);
      var volume = ref(0.8);
      var status = ref('idle');
      var sleepMin = ref(0);
      var sleepLeft = ref(0);
      var pageSize = ref(Number(saved.pageSize) || 40);
      var audioEl = ref(null);
      var listEl = ref(null);
      var active = ref(null);
      var savedActiveId = saved.activeId || '';

      var hls = null;
      var sleepTimer = null;
      var retries = 0;

      var provinces = computed(function () {
        return ['全部'].concat(unique(STATIONS.map(function (s) { return s.p; })));
      });
      var categories = computed(function () {
        return ['全部'].concat(unique(STATIONS.map(function (s) { return s.c; })));
      });
      var list = computed(function () {
        var kw = query.value.trim().toLowerCase();
        var base = favMode.value
          ? STATIONS.filter(function (s) { return favorites.value.indexOf(s.id) >= 0; })
          : STATIONS;
        return base.filter(function (s) {
          if (province.value !== '全部' && s.p !== province.value) return false;
          if (category.value !== '全部' && s.c !== category.value) return false;
          if (onlyMusic.value && s.c !== '音乐' && s.name.indexOf('音乐') < 0) return false;
          if (kw) {
            var hay = (s.name + ' ' + (s.f || '') + ' ' + (s.p || '')).toLowerCase();
            if (hay.indexOf(kw) < 0) return false;
          }
          return true;
        });
      });
      var visible = computed(function () { return list.value.slice(0, pageSize.value); });
      var maxIdx = computed(function () { return Math.max(0, list.value.length - 1); });
      var current = computed(function () {
        if (!list.value.length) return null;
        if (idx.value > maxIdx.value) idx.value = 0;
        return list.value[idx.value] || null;
      });
      var nowPlaying = computed(function () { return active.value || current.value; });
      var isFav = computed(function () {
        return !!nowPlaying.value && favorites.value.indexOf(nowPlaying.value.id) >= 0;
      });
      var dialAngle = computed(function () {
        var i = active.value ? list.value.findIndex(function (s) { return s.id === active.value.id; }) : -1;
        if (i < 0) i = idx.value;
        return maxIdx.value > 0 ? -60 + (i / maxIdx.value) * 120 : 0;
      });
      var statusText = computed(function () {
        return {
          idle: '按播放键开机', connecting: '正在调谐…', playing: '正在收听',
          paused: '已暂停', failed: '无信号'
        }[status.value] || '按播放键开机';
      });
      var sleepText = computed(function () {
        return sleepLeft.value > 0 ? pad(Math.floor(sleepLeft.value / 60)) + ':' + pad(sleepLeft.value % 60) : '';
      });
      var localCount = computed(function () { return favorites.value.length; });

      function rawName() {
        return (cloudUser.value || '').trim();
      }

      function cloudName() {
        var n = rawName();
        return n.length >= 3 && n.length <= 10 ? n : '';
      }

      function cloudKey() {
        return 'fmradio:' + cloudName() + ':favorites';
      }

      function countKey() {
        return COUNT_KEY + ':' + cloudName();
      }

      function saveCount() {
        try { localStorage.setItem(countKey(), String(syncedCount.value)); } catch (e) {}
      }

      function loadCount() {
        try { return parseInt(localStorage.getItem(countKey()), 10) || 0; }
        catch (e) { return 0; }
      }

      function pushCloud() {
        var name = rawName();
        if (!name) { cloudStatus.value = '请先输入用户名'; return; }
        if (!cloudName()) { cloudStatus.value = '用户名需要 3-10 位'; return; }
        try { localStorage.setItem(USER_KEY, cloudName()); } catch (e) {}
        var value = JSON.stringify({ favorites: favorites.value.slice() });
        fetch(CLOUD_BASE + '/setKV?key=' + encodeURIComponent(cloudKey()) + '&value=' + encodeURIComponent(value))
          .then(function (r) { if (!r.ok) throw new Error('kv'); return r.text(); })
          .then(function () {
            syncedCount.value = favorites.value.length;
            saveCount();
            cloudStatus.value = '已上传到云端';
          })
          .catch(function () { cloudStatus.value = '上传失败'; });
      }

      function pullCloud() {
        var name = rawName();
        if (!name) { cloudStatus.value = '请先输入用户名'; return; }
        if (!cloudName()) { cloudStatus.value = '用户名需要 3-10 位'; return; }
        try { localStorage.setItem(USER_KEY, cloudName()); } catch (e) {}
        fetch(CLOUD_BASE + '/getKV?key=' + encodeURIComponent(cloudKey()))
          .then(function (r) { if (!r.ok) throw new Error('kv'); return r.text(); })
          .then(function (text) {
            if (!text || !text.trim()) { cloudStatus.value = '云端暂无数据'; return; }
            var data = null;
            try { data = JSON.parse(text); } catch (e) {}
            var ids = Array.isArray(data) ? data : data && data.favorites;
            if (!Array.isArray(ids)) { cloudStatus.value = '云端数据格式错误'; return; }
            favorites.value = ids.filter(function (x) { return typeof x === 'string'; });
            try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites.value)); } catch (e) {}
            syncedCount.value = favorites.value.length;
            saveCount();
            if (favMode.value) { onFilterChange(); scrollToActive(); }
            cloudStatus.value = '已从云端拉取';
          })
          .catch(function () { cloudStatus.value = '拉取失败'; });
      }

      function saveFavorites() {
        try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites.value)); } catch (e) {}
        if (cloudName()) {
          syncedCount.value = favorites.value.length;
          saveCount();
          pushCloud();
        }
      }

      function exportJson() {
        var data = JSON.stringify({ favorites: favorites.value.slice(), updatedAt: Date.now() }, null, 2);
        var url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
        var a = document.createElement('a');
        a.href = url;
        a.download = 'fm-favorites.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      }

      function importJson(e) {
        var input = e.target;
        var file = input.files && input.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var data = JSON.parse(String(reader.result));
            var ids = Array.isArray(data) ? data : data && data.favorites;
            if (!Array.isArray(ids)) throw new Error('bad json');
            favorites.value = ids.filter(function (x) { return typeof x === 'string'; });
            saveFavorites();
            if (favMode.value) onFilterChange();
            cloudStatus.value = '导入成功';
          } catch (err) {
            cloudStatus.value = 'JSON 格式不正确';
          }
          input.value = '';
        };
        reader.readAsText(file);
      }

      function pickFile() {
        if (fileInput.value) fileInput.value.click();
      }

      function scrollToActive() {
        nextTick(function () {
          var box = listEl.value;
          if (!box) return;
          var id = active.value && active.value.id;
          var i = id ? list.value.findIndex(function (s) { return s.id === id; }) : -1;
          if (i >= 0 && pageSize.value <= i) {
            pageSize.value = i + 40;
            nextTick(scrollToActive);
            return;
          }
          var item = id ? box.querySelector('[data-id="' + id + '"]') : null;
          if (!item) item = box.querySelector('.station-item.active');
          if (!item) return;
          var title = box.querySelector('.list-title');
          var headH = title ? title.offsetHeight : 0;
          var visibleH = box.clientHeight - headH;
          var itemH = item.offsetHeight;
          var itemTop = item.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
          box.scrollTop = Math.max(0, itemTop - headH - (visibleH - itemH) / 2);
        });
      }

      function toggleFavMode() {
        favMode.value = !favMode.value;
        onFilterChange();
      }

      function destroyHls() {
        if (hls) { try { hls.destroy(); } catch (e) {} hls = null; }
      }

      function doPlay(a) {
        a.volume = volume.value;
        var p = a.play();
        if (p && p.then) {
          p.then(function () { playing.value = true; status.value = 'playing'; })
           .catch(function () { playing.value = false; status.value = 'failed'; });
        } else {
          playing.value = true;
          status.value = 'playing';
        }
      }

      function handleError() {
        status.value = 'failed';
        playing.value = false;
        retries++;
        if (retries <= 3) {
          var timer = setTimeout(function () { clearTimeout(timer); step(1); }, 1500);
        }
      }

      function attach(s) {
        if (!s || !audioEl.value) return;
        active.value = s;
        destroyHls();
        retries = 0;
        var a = audioEl.value;
        var useHls = !!s.hls || /\.m3u8(\?|$)/i.test(s.url);
        status.value = 'connecting';
        if (useHls && typeof Hls !== 'undefined') {
          if (Hls.isSupported()) {
            hls = new Hls({ enableWorker: true });
            hls.loadSource(s.url);
            hls.attachMedia(a);
            hls.on(Hls.Events.MANIFEST_PARSED, function () { doPlay(a); });
            hls.on(Hls.Events.ERROR, function (e, data) {
              if (data && data.fatal) handleError();
            });
          } else if (a.canPlayType('application/vnd.apple.mpegurl')) {
            a.src = s.url;
            doPlay(a);
          } else {
            handleError();
          }
        } else {
          a.src = s.url;
          doPlay(a);
        }
      }

      function step(delta) {
        if (!list.value.length) return;
        idx.value = (idx.value + delta + list.value.length) % list.value.length;
        attach(list.value[idx.value]);
      }

      function select(i) {
        idx.value = i;
        attach(list.value[i]);
      }

      function prev() { step(-1); }
      function next() { step(1); }

      function randomPlay() {
        var pool = onlyMusic.value
          ? list.value.filter(function (s) { return s.c === '音乐' || s.name.indexOf('音乐') >= 0; })
          : list.value;
        if (!pool.length) return;
        var target = pool[Math.floor(Math.random() * pool.length)];
        var i = list.value.indexOf(target);
        if (i >= 0) select(i);
      }

      function toggle() {
        if (!nowPlaying.value) return;
        if (playing.value) {
          audioEl.value.pause();
          playing.value = false;
          status.value = 'paused';
        } else if (audioEl.value && audioEl.value.src) {
          doPlay(audioEl.value);
        } else {
          attach(nowPlaying.value);
        }
      }

      function pause() {
        if (audioEl.value) audioEl.value.pause();
        playing.value = false;
        status.value = 'paused';
      }

      function toggleFav() {
        if (!nowPlaying.value) return;
        var i = favorites.value.indexOf(nowPlaying.value.id);
        if (i >= 0) favorites.value.splice(i, 1);
        else favorites.value.push(nowPlaying.value.id);
        saveFavorites();
      }

      function applySleep() {
        clearInterval(sleepTimer);
        if (sleepMin.value > 0) {
          sleepLeft.value = sleepMin.value * 60;
          sleepTimer = setInterval(function () {
            sleepLeft.value--;
            if (sleepLeft.value <= 0) {
              clearInterval(sleepTimer);
              sleepMin.value = 0;
              sleepLeft.value = 0;
              pause();
            }
          }, 1000);
        } else {
          sleepLeft.value = 0;
        }
      }

      function onDialClick(e) {
        var rect = e.currentTarget.getBoundingClientRect();
        step(e.clientX - rect.left < rect.width / 2 ? -1 : 1);
      }

      function saveState() {
        try {
          localStorage.setItem(STATE_KEY, JSON.stringify({
            favMode: favMode.value,
            query: query.value,
            province: province.value,
            category: category.value,
            onlyMusic: onlyMusic.value,
            idx: idx.value,
            pageSize: pageSize.value,
            activeId: active.value && active.value.id
          }));
        } catch (e) {}
      }

      function onFilterChange() {
        pageSize.value = 40;
        var id = active.value && active.value.id;
        var i = id ? list.value.findIndex(function (s) { return s.id === id; }) : -1;
        idx.value = i >= 0 ? i : 0;
        if (i >= 0 && pageSize.value <= i) pageSize.value = i + 40;
        scrollToActive();
      }

      function onKeydown(e) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        var t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        var key = e.key;
        if (key === 'ArrowLeft') { e.preventDefault(); prev(); }
        else if (key === 'ArrowRight') { e.preventDefault(); next(); }
        else if (key === 'ArrowUp' || key === 'ArrowDown') { e.preventDefault(); randomPlay(); }
        else if (key === ' ' || key === 'Spacebar') { e.preventDefault(); toggle(); }
      }

      watch(volume, function (v) { if (audioEl.value) audioEl.value.volume = v; });
      watch([query, province, category, onlyMusic], onFilterChange);
      watch([favMode, query, province, category, onlyMusic, idx, pageSize, active], saveState);

      onMounted(function () {
        var restore = null;
        if (savedActiveId) {
          for (var i = 0; i < STATIONS.length; i++) {
            if (STATIONS[i].id === savedActiveId) { restore = STATIONS[i]; break; }
          }
        }
        if (!restore) restore = current.value;
        if (restore) {
          var pos = list.value.findIndex(function (s) { return s.id === restore.id; });
          if (pos >= 0) idx.value = pos;
          attach(restore);
        }
        window.addEventListener('keydown', onKeydown);
        syncedCount.value = loadCount();
        nextTick(scrollToActive);
      });
      onUnmounted(function () {
        window.removeEventListener('keydown', onKeydown);
        destroyHls();
        clearInterval(sleepTimer);
      });

      return {
        query: query, province: province, category: category, onlyMusic: onlyMusic,
        favorites: favorites, favMode: favMode, cloudUser: cloudUser, cloudStatus: cloudStatus,
        syncedCount: syncedCount, fileInput: fileInput, idx: idx, playing: playing, volume: volume,
        status: status, sleepMin: sleepMin, sleepLeft: sleepLeft,
        pageSize: pageSize, audioEl: audioEl, listEl: listEl,
        provinces: provinces, categories: categories, list: list, visible: visible,
        maxIdx: maxIdx, current: current, nowPlaying: nowPlaying, isFav: isFav, dialAngle: dialAngle,
        statusText: statusText, sleepText: sleepText, localCount: localCount,
        select: select, prev: prev, next: next, randomPlay: randomPlay,
        toggle: toggle, pause: pause, toggleFav: toggleFav, applySleep: applySleep,
        toggleFavMode: toggleFavMode, pushCloud: pushCloud, pullCloud: pullCloud,
        exportJson: exportJson, importJson: importJson, pickFile: pickFile,
        onDialClick: onDialClick, onFilterChange: onFilterChange, scrollToActive: scrollToActive,
        handleError: handleError
      };
    }
  }).mount('#root');
})();

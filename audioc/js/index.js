/**
 * 将 FFmpeg 时间字符串（HH:MM:SS.ms）转换为秒。
 * @param {string} timeStr - 时间字符串。
 * @returns {number} 总秒数。
 */
function timeToSeconds(timeStr) {
  const parts = timeStr.split(':')
  const h = parts.length > 2 ? parseFloat(parts[0]) : 0
  const m = parseFloat(parts[parts.length - 2]) || 0
  const sParts = (parts[parts.length - 1] || '0').split('.')
  const s = parseFloat(sParts[0]) || 0
  const ms = parseFloat(sParts[1]) || 0
  return h * 3600 + m * 60 + s + ms / 1000
}

/**
 * 封装 Web Worker 以执行 FFmpeg 命令。
 * @param {object} params - 参数对象。
 * @param {Uint8Array} params.fileData - 输入文件的二进制数据。
 * @param {object} params.options - 转换选项。
 * @param {string} params.originalFileName - 原始文件名，用于获取扩展名。
 * @param {function} params.onProgress - 进度回调函数，接收一个百分比数字。
 * @param {function} params.onComplete - 完成回调函数，接收 (outputData, statusMessage)。
 */
function audio_convert({ fileData, options, originalFileName, onProgress, onComplete }) {
  let totalDuration
  const worker = new Worker('js/auido_worker.js')
  worker.onmessage = (e) => {
    const { type, data } = e.data
    switch (type) {
      case 'stdout':
        console.log('stdout', data)
      case 'stderr':
        console.log(data)
        const durationMatch = /Duration: (.*?), /.exec(data)
        if (durationMatch) {
          totalDuration = timeToSeconds(durationMatch[1])
        }
        const timeMatch = /time=(.*?) /.exec(data)
        if (timeMatch && totalDuration) {
          const progress = Math.min(100, Math.floor((timeToSeconds(timeMatch[1]) / totalDuration) * 100))
          onProgress(progress)
        }
        break
      case 'done':
        const { code, outputFiles } = data
        const outputFileName = Object.keys(outputFiles)[0]
        if (code === 0 && outputFileName && outputFiles[outputFileName].byteLength > 0) {
          onComplete(outputFiles[outputFileName], '转换成功')
        } else {
          onComplete(null, '转换失败')
        }
        worker.terminate() // 清理 worker
        break
    }
  }

  const inputExtension = originalFileName.split('.').pop()
  const inputFileName = `input.${inputExtension}`
  const outputFileName = `output.${options.format.toLowerCase()}`

  const args = ['-i', inputFileName]
  if (options.bitrate) args.push('-ab', options.bitrate)
  if (options.sampleRate) args.push('-ar', options.sampleRate)
  if (options.channels) args.push('-ac', options.channels)
  args.push('-vn') // 无视频

  const format = options.format.toLowerCase()
  const encoder = options.encoder

  if (format === 'mp3') args.push('-acodec', encoder || 'libmp3lame')
  else if (format === 'ogg') {
    args.push('-acodec', encoder || 'flac')
    if (encoder === 'vorbis') args.push('-strict', '-2')
  } else if (format === 'aac') args.push('-acodec', encoder || 'aac', '-f', 'mp4')
  else if (format === 'wma') args.push('-acodec', encoder || 'wmav1', '-f', 'asf')
  else if (format === 'm4a') args.push('-acodec', encoder || 'aac')
  else if (format === 'm4r') args.push('-acodec', 'aac', '-f', 'ipod')
  else if (format === 'flac') args.push('-acodec', 'flac')
  else if (format === 'opus') args.push('-acodec', 'libopus')
  else if (format === 'aiff') args.push('-acodec', 'pcm_s16be')
  else if (format === 'mmf') args.push('-acodec', 'adpcm_yamaha', '-strict', '-2')

  args.push(outputFileName)

  worker.postMessage({
    type: 'command',
    arguments: args,
    files: [{ name: inputFileName, data: fileData }]
  })
}

function audio_info({ fileData, originalFileName, onProgress, onComplete }) {
  let info = {}
  const worker = new Worker('js/auido_worker.js')
  worker.onmessage = (e) => {
    const { type, data } = e.data
    switch (type) {
      case 'stdout':
        console.log('stdout', data)
      case 'stderr':
        console.log(data)
        const durationMatch = /Duration: (.*?), /.exec(data)
        if (durationMatch) {
          info.duration = timeToSeconds(durationMatch[1])
          info.bitrate = data.match(/bitrate: (\d+)\s+kb\/s/i)?.[1] || null
        }
        const streamMatch = data.match(/Stream #0:0.*?Audio: (.*)/); // 使用 s 标志让 . 匹配换行符
        if (streamMatch) {
          const streamInfo = streamMatch[1];
          info.codec = streamInfo.match(/^(\w+)/)?.[1] || null
          info.sampleRate = streamInfo.match(/(\d+)\s+Hz/)?.[1] || null
          info.channels = streamInfo.match(/Hz, (\w+(?:\s*\(\w+\))?)/)?.[1] || null // 匹配 "stereo (c)" 这样的格式
        }
        if (data.match(/title\s*:\s*(.*)/i) && !info.title) info.title = data.match(/title\s*:\s*(.*)/i)[1] || null
        if (data.match(/artist\s*:\s*(.*)/i) && !info.artist) info.artist = data.match(/artist\s*:\s*(.*)/i)[1] || null
        if (data.match(/album\s*:\s*(.*)/i) && !info.album) info.album = data.match(/album\s*:\s*(.*)/i)[1] || null
        break
      case 'done':
        console.log('done', data)
        onComplete && onComplete(info)
        worker.terminate() // 清理 worker
        break
    }
  }

  const inputExtension = originalFileName.split('.').pop()
  const inputFileName = `input.${inputExtension}`
  const outputFileName = `output.${inputExtension}`

  const args = ['-i', inputFileName]
  args.push('-vn') // 无视频
  args.push('-f', 'null') // 只获取音频信息，不输出文件

  // args.push(outputFileName)
  args.push('-')

  worker.postMessage({
    type: 'command',
    arguments: args,
    files: [{ name: inputFileName, data: fileData }]
  })
}

// 将格式化选项配置数据化，替代庞大的 switch 语句
const formatConfig = {
  MP3: { encoders: [{ text: 'libmp3lame', value: 'libmp3lame' }], defaultEncoder: 'libmp3lame' },
  AAC: {
    encoders: [
      { text: 'aac', value: 'aac' },
      { text: 'libfdk_aac', value: 'libfdk_aac' }
    ],
    defaultEncoder: 'aac'
  },
  OGG: {
    encoders: [
      { text: 'flac', value: 'flac' },
      { text: 'vorbis', value: 'vorbis' }
    ],
    defaultEncoder: 'flac'
  },
  WAV: { encoders: [{ text: 'pcm_s16le', value: 'pcm_s16le' }], defaultEncoder: 'pcm_s16le' },
  M4A: {
    encoders: [
      { text: 'alac', value: 'alac' },
      { text: 'libfdk_aac', value: 'libfdk_aac' },
      { text: 'aac', value: 'aac' }
    ],
    defaultEncoder: 'alac'
  },
  M4R: {
    encoders: [
      { text: 'aac', value: 'aac' },
      { text: 'libfdk_aac', value: 'libfdk_aac' }
    ],
    defaultEncoder: 'aac'
  },
  FLAC: { encoders: [{ text: 'flac', value: 'flac' }], defaultEncoder: 'flac' },
  WMA: {
    encoders: [
      { text: 'wmav2', value: 'wmav2' },
      { text: 'wmav1', value: 'wmav1' }
    ],
    defaultEncoder: 'wmav2'
  },
  OPUS: { encoders: [{ text: 'libopus', value: 'libopus' }], sampleRates: [8000, 12000, 16000, 48000], defaultSampleRate: '16000', defaultEncoder: 'libopus' },
  AIFF: { encoders: [{ text: 'pcm_s16be', value: 'pcm_s16be' }], defaultEncoder: 'pcm_s16be' },
  MMF: {
    encoders: [{ text: 'adpcm_yamaha', value: 'adpcm_yamaha' }],
    sampleRates: [44100, 22050, 11025, 8000, 4000],
    defaultSampleRate: '44100',
    defaultEncoder: 'adpcm_yamaha'
  }
}

var app = Vue.createApp({
  data() {
    return {
      inputFiles: [],
      outFiles: [],
      isDragging: false,
      singleFileMode: false,
      isConverting: false,
      isPackaging: false,
      convertMsg: '待转换', // 使用单一字符串管理状态显示
      available: {
        formats: ['MP3', 'WAV', 'OGG', 'AAC', 'M4A', 'M4R', 'FLAC', 'WMA', 'OPUS', 'AIFF', 'MMF'],
        bitrates: ['48k', '64k', '80k', '96k', '128k', '160k', '192k', '256k', '320k'],
        channels: [
          { text: '单声道', value: '1' },
          { text: '立体', value: '2' }
        ],
        encoders: [],
        sampleRates: []
      },
      options: {
        format: 'MP3',
        encoder: '',
        bitrate: localStorage.getItem('audio-bitrate') || '128k',
        sampleRate: '44100',
        channels: '2'
      },
      info: null,
    }
  },
  computed: {
    canConvert() {
      return this.inputFiles && this.inputFiles.length > 0 && !this.isConverting
    }
  },
  watch: {
    'options.format'(val) {
      this.updateOptionsForFormat(val)
    },
    'options.bitrate'(val) {
      localStorage.setItem('audio-bitrate', val)

    }
  },
  mounted() {
    this.singleFileMode = localStorage.getItem('singleFileMode') === 'true'
    this.updateOptionsForFormat(this.options.format)

    // 全局拖拽事件监听，用于更新UI视觉效果
    document.body.addEventListener('dragover', (e) => {
      e.preventDefault()
      this.isDragging = true
    })
    document.body.addEventListener('dragleave', () => {
      this.isDragging = false
    })
    document.body.addEventListener('drop', (e) => {
      e.preventDefault()
      this.isDragging = false
      this.addFiles(e.dataTransfer.files)
    })
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleFileDrop(e) {
      this.isDragging = false
      this.addFiles(e.dataTransfer.files)
    },
    handleFileSelect(e) {
      this.addFiles(e.target.files)
      e.target.value = ''
    },
    addFiles(files) {
      if (this.singleFileMode) {
        this.inputFiles = []
        this.outFiles = []
        this.convertMsg = '待转换'
      }
      if (files.length === 1) this.showInfo(files[0])
      this.inputFiles.push(...Array.from(files).filter((f) => f.type.startsWith('audio/')))
    },
    removeFile(index) {
      this.inputFiles.splice(index, 1)
    },
    removeOutFile(index) {
      this.outFiles.splice(index, 1)
    },
    showInfo(file) {
      this.info = null
      const reader = new FileReader();
      reader.onload = (e) => {
        // let buffer = e.target.result
        // new window.AudioContext().decodeAudioData(buffer).then((data) => {
        //   console.log(data);
        //   temp.duration = (new Date(data.duration * 1000)).toISOString().substr(14, 5);
        //   temp.sampleRate = data.sampleRate;
        //   temp.bitrate = Math.floor(file.size * 8 / data.duration / 1000)
        //   temp.isDouble = data.numberOfChannels === 2
        //   this.info = temp
        //   jsmediatags.read(file, { onSuccess: (tag) => {
        //     console.log(tag);
        //     if (tag.tags.album) this.info.album = tag.tags.album
        //     if (tag.tags.artist) this.info.artist = tag.tags.artist
        //     if (tag.tags.title) this.info.title = tag.tags.title
        //   }})
        // })
        audio_info({
          fileData: new Uint8Array(e.target.result),
          originalFileName: file.name,
          onComplete: (info) => {
            console.log('audio_info', info);
            this.info = {
              ...info,
              title: info.title || file.name,
              duration: (new Date(info.duration * 1000)).toISOString().substr(14, 5),
              size: this.formatBytes(file.size, 2)
            }
          }
        })
      };
      reader.readAsArrayBuffer(file);
    },
    toggleSingleFileMode() {
      this.singleFileMode = !this.singleFileMode
      localStorage.setItem('singleFileMode', this.singleFileMode)
    },
    formatBytes(bytes, decimals = 1) {
      if (!bytes) return '0 B'
      const sizes = ['B', 'KB', 'M', 'G', 'T']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(decimals < 0 ? 0 : decimals))} ${sizes[i]}`
    },
    stripExtension(filename) {
      return filename.substring(0, filename.lastIndexOf('.')) || filename
    },
    async startConversion() {
      if (!this.canConvert) return

      this.isConverting = true
      this.convertMsg = '初始化中...'
      // if (this.singleFileMode) this.outFiles = [];

      const filesToProcess = [...this.inputFiles]
      if (!this.singleFileMode) this.inputFiles = []

      for (const file of filesToProcess) {
        try {
          await this.convertFile(file)
        } catch (error) {
          this.convertMsg = `转换失败`
          console.error(error)
        }
      }

      this.isConverting = false
      this.convertMsg = '转换完成！'
    },
    convertFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          audio_convert({
            fileData: new Uint8Array(e.target.result),
            options: this.options,
            originalFileName: file.name,
            onProgress: (progress) => {
              this.convertMsg = `${progress}%` // 处理中: ${file.name}
            },
            onComplete: (outputData, statusMessage) => {
              if (outputData) {
                const newFileName = `${this.stripExtension(file.name)}.${this.options.format.toLowerCase()}`
                const blob = new Blob([outputData])
                const url = URL.createObjectURL(blob)
                this.outFiles.push({ name: newFileName, size: outputData.byteLength, url, blob })
                resolve()
              } else {
                reject(statusMessage)
              }
            }
          })
        }
        reader.onerror = () => reject('读取文件失败')
        reader.readAsArrayBuffer(file)
      })
    },
    updateOptionsForFormat(format) {
      const config = formatConfig[format.toUpperCase()] || {}
      const defaultSampleRates = [8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000]

      this.available.encoders = config.encoders || [{ text: 'Default', value: '' }]
      this.available.sampleRates = (config.sampleRates || defaultSampleRates).map(String)

      this.options.encoder = config.defaultEncoder || ''
      const defaultSampleRate = config.defaultSampleRate || '44100'
      if (!this.available.sampleRates.includes(this.options.sampleRate)) {
        this.options.sampleRate = defaultSampleRate
      }
    },
    downloadAllAsZip() {
      if (this.isPackaging || this.outFiles.length < 1) return
      this.isPackaging = true
      const zip = new JSZip()
      const fileCounts = new Map()
      this.outFiles.forEach((file) => {
        const oname = file.name
        let newName = oname
        let counter = fileCounts.get(oname) || 0
        if (counter > 0) {
          const dotIndex = oname.lastIndexOf('.')
          newName = `${oname.substring(0, dotIndex)}(${counter})${oname.substring(dotIndex)}`
        }
        fileCounts.set(oname, counter + 1)
        zip.file(newName, file.blob)
      })
      // this.outFiles.forEach(file => zip.file(file.name, file.blob));
      zip
        .generateAsync({ type: 'blob' })
        .then((data) => saveAs(data, '音频文件.zip'))
        .catch((err) => console.error('打包文件时出错:', err))
        .finally(() => (this.isPackaging = false))
    },
    playAudio(file) {
      playMusic(file)
      // URL.revokeObjectURL(url)
    }
  }
})

app.mount('#app')

var currMusic = { audio: null, url: null, size: 0, playing: false }
function playMusic(file) {
  console.log('playMusic', file);
  if (!currMusic.audio) {
    currMusic.audio = new Audio()
    currMusic.audio.addEventListener('ended', () => currMusic.playing = false);
  }
  if (currMusic.size === file.name + file.size) {
    if (currMusic.playing) {
      currMusic.audio.pause()
      currMusic.playing = false
    } else {
      currMusic.audio.play()
      currMusic.playing = true
    }
    return
  }
  if (currMusic.url) URL.revokeObjectURL(currMusic.url)
  currMusic.url = URL.createObjectURL(file.blob || file)
  currMusic.audio.src = currMusic.url
  currMusic.size = file.name + file.size
  currMusic.playing = true
  currMusic.audio.play()
}
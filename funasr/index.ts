// ========================================================================
// 统一 ASR 入口 —— 根据 type 返回对应的 hook 实例
// 用法:
//   import { useASR } from '@/hooks'
//   const asr = useASR('funasr', { wsUrl: 'ws://127.0.0.1:10095' })
//   // asr 的形状与 useASR/useFunASR 完全一致
// ========================================================================

import { useAzureASR, type UseAzureASRConfig, type UseAzureASRReturn } from './useVoice';
import { useFunASR, type UseFunASRConfig, type UseFunASRReturn } from './useVoiceFunAsr';
import { useVad, type UseVadOptions, type UseVadReturn } from './useVad';

/** 当前支持的 ASR 类型 */
export type ASRType = 'default' | 'funasr';

/**
 * VAD 桥接配置: 仅"拿到麦克风流后启动 VAD + 检测到说话结束转调业务回调",
 * <p>不复制 blob, 不接管 ASR.stop / MediaRecorder; 业务方继续用原链路发音频.</p>
 * <p>典型用法: vad.enabled=true, vad.onSpeechEnd=stopASRAndSend(原函数).</p>
 * <p>模型/资源 URL 工厂内置默认值, 业务方不用关心; 阈值参数可通过 params 覆盖.</p>
 */
export interface VADBridgeConfig {
  /** 默认 false, 不破坏现有调用 */
  enabled?: boolean
  /** VAD 阈值参数, 直接透给 useVad.params */
  params?: UseVadOptions['params']
  /**
   * 检测到说话结束的回调(VAD 只负责"通知", 不 stop 不复制 blob).
   * <p>业务方在该回调里调 asr.stop() + 走原发送链路即可.</p>
   */
  onSpeechEnd?: (info: { durationSec: number; prob: number }) => void | Promise<void>
  /** 其他 VAD 回调透传 */
  onSpeechStart?: UseVadOptions['onSpeechStart']
  onProbability?: UseVadOptions['onProbability']
  onLog?: UseVadOptions['onLog']
  onError?: UseVadOptions['onError']
}

/**
 * 工厂返回类型：两个 hook 出参完全一致(同 UseASRReturn), 这里直接合并成最宽的那个
 * <p>vad 字段: 当 config.vad.enabled=true 时返回 useVad 句柄, 否则 undefined.</p>
 * <p>stopVad: 业务方调一次即可释放 VAD 麦克风副本; vad 未启用时是 noop.</p>
 */
export type ASRReturn = (UseAzureASRReturn & UseFunASRReturn) & {
  vad?: UseVadReturn
  /** 释放 VAD 副本流(可在 asr.stop() 之后调, vad 未启用时是 noop) */
  stopVad: () => Promise<void>
}

/**
 * 工厂 config：联合两种 config, 运行时只取对应类型识别的字段
 */
export type ASRConfig = (UseAzureASRConfig & UseFunASRConfig) & {
  vad?: VADBridgeConfig
};

/**
 * 根据 type 选择具体 ASR 实现, 返回与 useAzureASR/useFunASR 同型的实例
 *
 * @param type 'default' | 'funasr'
 *   - 'default': 自建 ws 服务(useVoice.ts 中 useAzureASR)
 *   - 'funasr' : FunASR runtime websocket(默认 ws://127.0.0.1:10095)
 * @param config 各实现自己的配置项; config.vad.enabled=true 时, 工厂会
 *   在 ASR 拿到 micStream 后自动 clone 一份给 VAD, 并把 onSpeechEnd 转调给业务方
 */
export function useASR(
  type: ASRType = 'default',
  config: ASRConfig = {}
): ASRReturn {
  const { vad: vadCfg, ...asrCfg } = config
  const innerCfg: UseAzureASRConfig & UseFunASRConfig = { ...asrCfg } as any
  let asrRef: ASRReturn
  let vadRef: UseVadReturn | undefined

  if (vadCfg?.enabled) {
    // 工厂只做"桥": 拿 micStream → clone 给 VAD; onSpeechEnd → 转调业务方回调.
    // VAD 不 stop 不复制 blob, 音频链路完全由业务方按原方式处理.
    // 模型 URL 工厂内置默认值, 业务方不用写.
    const vad = useVad({
      moduleUrl: '/vad/index.js',
      weightsBinUrl: '/vad/silero_vad_v5.bin',
      weightsManifestUrl: '/vad/silero_vad_v5.manifest.json',
      workletUrl: '/vad/vad_processor.js',
      params: vadCfg.params,
      onSpeechStart: vadCfg.onSpeechStart,
      onProbability: vadCfg.onProbability,
      onLog: vadCfg.onLog,
      onError: vadCfg.onError,
      onSpeechEnd: (info: { durationSec: number }) => {
        if (vadCfg.onSpeechEnd) vadCfg.onSpeechEnd({ durationSec: info.durationSec, prob: 0 })
      },
    })
    vadRef = vad
    innerCfg.onStreamReady = (stream: MediaStream) => {
      vad.start(stream).catch((e: any) => console.warn('[useASR/vad] start 失败, 已退化为无 VAD 模式:', e))
    }
  }

  if (type === 'funasr') {
    asrRef = useFunASR(innerCfg as UseFunASRConfig) as unknown as ASRReturn
  } else {
    // 'default' / 其它 → 走 useAzureASR
    asrRef = useAzureASR(innerCfg as UseAzureASRConfig) as unknown as ASRReturn
  }

  if (vadRef) {
    ;(asrRef as any).vad = vadRef
  }
  // 统一收口: 业务方调 asr.stopVad() 即可, vad 未启用时是 noop
  ;(asrRef as any).stopVad = () => {
    if (!vadRef) return Promise.resolve()
    return vadRef.stop().catch(() => { /* ignore */ })
  }
  return asrRef
}

// 顺便把两个 hook 也透出, 调用方仍可单独 import
export { useAzureASR, useFunASR, useVad };
// 以下两个兼容导出, 旧调用方可直接继续用
export type { UseAzureASRConfig, UseAzureASRReturn, UseFunASRConfig, UseFunASRReturn };

// ========================================================================
// 使用示例(不参与运行, 仅供复制参考)
// ========================================================================

/*
【示例 1】Vue 组件内, 通过 type 切换 ASR 后端(最常用)
----------------------------------------------------------
<template>
  <div>
    <div>连接状态: {{ asr.connected.value ? '已连接' : '未连接' }}</div>
    <div>音量: {{ asr.volume.value }}</div>
    <div>实时识别: {{ asr.result.value }}</div>
    <div>已确认: {{ asr.finalText.value }}</div>
    <button @click="onConnect">连接</button>
    <button @click="onStart">开始</button>
    <button @click="onStop">停止</button>
    <button @click="asr.reset()">重置</button>
  </div>
</template>

<script setup lang="ts">
import { useASR, type ASRType } from '@/hooks'

// 切到 funasr, url 默认 ws://127.0.0.1:10095, 可省略
const ASR_TYPE: ASRType = 'funasr'

const asr = useASR(ASR_TYPE, {
  wsUrl: 'ws://127.0.0.1:10095',
  // 切到 'default' 时, 这些字段才生效:
  // token: 'my-local-secret-token',
  // lang: 'zh-CN',
})

// 切到 funasr 时可加 FunASR 专属配置:
// useASR('funasr', { mode: '2pass', itn: true, chunkSize: [5,10,5] })

const onConnect = () => asr.connect()
const onStart = async () => { await asr.startASR() }
const onStop = () => asr.stop()

// 录音产出的音频(给后端落盘)
const sendAudio = () => {
  if (!asr.lastBlobBase64.value) return
  fetch('/api/upload', {
    method: 'POST',
    body: JSON.stringify({
      audioBase64: asr.lastBlobBase64.value,
      durationSec: asr.lastAudio.value?.durationSec,
      mimeType: asr.lastAudio.value?.mimeType,
      ext: asr.lastAudio.value?.ext,
      text: asr.finalText.value,
    }),
  }).then(() => asr.reset())
}
</script>


【示例 2】根据环境变量 / 配置项动态选择
----------------------------------------------------------
import { useASR } from '@/hooks'

// 由 vite .env / 后端下发的配置决定
const type = import.meta.env.VITE_ASR_TYPE === 'funasr' ? 'funasr' : 'default'

const asr = useASR(type, {
  wsUrl: import.meta.env.VITE_ASR_WS_URL,
})


【示例 3】老代码最小迁移(只想换后端, 其它不动)
----------------------------------------------------------
// 改一行 import 即可, 下游代码完全不变
// import { useASR } from '@/hooks/useVoice'
import { useASR as useASR } from '@/hooks'

const asr = useASR('funasr', { wsUrl: 'ws://127.0.0.1:10095' })
asr.connect()
asr.startASR()


【示例 4】在同一组件里同时跑两路(罕见, 仅示意)
----------------------------------------------------------
import { useASR } from '@/hooks'

const a = useASR('default', { wsUrl: 'wss://primary/ws/asr' })
const b = useASR('funasr', { wsUrl: 'ws://127.0.0.1:10095' })
// a / b 互相独立, 各自的 volume / result / lastBlob 都分开维护
*/
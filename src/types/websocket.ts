// WebSocket 消息类型定义

export interface ActivityMessage {
  user_id: string;
  label: string;
  label_id: number;
  probs?: Record<string, number>;
  win: number;
  hop: number;
  fs_hz: number;
  ts: number;
}

export interface AlarmMessage {
  user_id: string;
  type: string;
  code: string;
  threshold_s: number;
  duration_s: number;
  ts: number;
}

export interface EcgStreamMessage {
  user_id: string;
  fs_hz: number;
  t: number;
  easi_ai: number;
  easi_es: number;
  easi_as: number;
}

export interface EcgUpdateMessage {
  user_id: string;
  fs_hz: number;
  rpeak_count: number;
  hr_mean_bpm: number;
  sdnn_ms: number;
  rmssd_ms: number;
  resp_rate_bpm: number;
  win_samples: number;
  ts: number;
}

export interface TempUpdateMessage {
  user_id: string;
  object_c: number;
  ambient_c: number;
  smoothed_object_c: number;
  alarm: any; // 可以根据需要定义更具体的类型
  ts: number;
}

export interface ErrorMessage {
  where: string;
  msg: string;
}

export type WebSocketMessage =
  | { type: 'activity'; data: ActivityMessage }
  | { type: 'alarm'; data: AlarmMessage }
  | { type: 'alarm_clear'; data: AlarmMessage }
  | { type: 'ecg_stream'; data: EcgStreamMessage }
  | { type: 'ecg_update'; data: EcgUpdateMessage }
  | { type: 'temp_update'; data: TempUpdateMessage }
  | { type: 'error'; data: ErrorMessage };
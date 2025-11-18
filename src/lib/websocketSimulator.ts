import type { WebSocketMessage } from '../types/websocket';
import { ref } from 'vue'
export const userInfo = ref('')
// 模拟WebSocket的类
export class WebSocketSimulator {
  private listeners: Map<string, Array<(message: WebSocketMessage) => void>> = new Map();
  private intervalId: number | null = null;
  private isConnected = false;

  // 连接模拟WebSocket
  connect(): void {
    if (this.isConnected) return;
    this.isConnected = true;
    // 开始模拟消息推送，每2秒发送一个随机消息
    this.intervalId = window.setInterval(() => {
      this.sendRandomMessage({
        type: 'ecg_stream',
        data: {
          user_id: 'u1',
          fs_hz: 100,
          t: Date.now(),
          easi_ai: Math.random() * 0.001 + 0.001 * Math.random(),
          easi_es: Math.random() * 0.002,
          easi_as: Math.random() * 0.002
        }
      },);
    }, 100);

    window.setInterval(() => {
      this.sendRandomMessage({
        type: 'activity',
        data: {
          user_id: 'u1',
          label: 'sit',
          label_id: Math.floor(Math.random() * 8),
          probs: { sit: 0.92, stand: 0.05, lie: 0.03 },
          win: 200,
          hop: 50,
          fs_hz: 100,
          ts: Date.now()
        }
      },);
    }, 2500);

    window.setInterval(() => {
      this.sendRandomMessage({
        type: 'ecg_update',
        data: {
          user_id: 'u1',
          fs_hz: 100,
          rpeak_count: Math.floor(Math.random() * 10) + 120,
          hr_mean_bpm: Math.random() * 20 + 60,
          sdnn_ms: Math.random() * 20 + 30,
          rmssd_ms: Math.random() * 20 + 30,
          resp_rate_bpm: Math.random() * 5 + 10,
          win_samples: 2000,
          ts: Date.now()
        }
      },);
      this.sendRandomMessage(
        {
          type: 'temp_update',
          data: {
            user_id: 'u1',
            object_c: Math.random() * 5 + 30,
            ambient_c: Math.random() * 5 + 25,
            smoothed_object_c: Math.random() * 5 + 30,
            alarm: null,
            ts: Date.now()
          }
        });
    }, 1000);
  }

  // 断开模拟WebSocket
  disconnect(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isConnected = false;
  }

  // 监听消息类型
  on(type: string, callback: (message: WebSocketMessage) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }

  // 移除监听器
  off(type: string, callback?: (message: WebSocketMessage) => void): void {
    if (callback) {
      const callbacks = this.listeners.get(type);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
          this.listeners.delete(type);
        }
      }
    } else {
      this.listeners.delete(type);
    }
  }

  // 发送随机消息（用于模拟）
  private sendRandomMessage(message: any): void {
    if(message.data && message.data.user_id){
      userInfo.value = message.data.user_id
    }
    // 触发对应的监听器
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(listener => listener(message));
    }
  }

  // 手动发送特定消息（可选，用于测试）
  sendMessage(message: WebSocketMessage): void {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(listener => listener(message));
    }
  }
}

// 导出单例实例
export const websocketSimulator = new WebSocketSimulator();
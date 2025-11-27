// websocketSimulator.ts —— 使用 Socket.IO 代替原生 WebSocket

import type { WebSocketMessage } from '../types/websocket';
import { ref } from 'vue';
import { io, Socket } from 'socket.io-client';

export const userInfo = ref('');

// Socket.IO 连接管理类
export class WebSocketSimulator {
  private listeners: Map<string, Array<(message: WebSocketMessage) => void>> = new Map();
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectInterval = 5000; // 重连间隔，毫秒
  private reconnectTimer: number | null = null;
  private messageCount = 0; // 消息计数器
  private readonly maxMessageLogs = 50; // 最大打印消息数量

  // 连接到 Socket.IO 服务器
  connect(): void {
    if (this.isConnected || this.socket) return;

    try {
      // 优先用 VITE_SOCKETIO_URL，其次兼容原来的 VITE_WEBSOCKET_URL
      const url =
        (import.meta as any).env.VITE_SOCKETIO_URL ||
        (import.meta as any).env.VITE_WEBSOCKET_URL ||
        'http://localhost:5050';

      this.socket = io(url, {
        transports: ['websocket'], // 强制使用 websocket 传输（可选）
      });

      this.socket.on('connect', () => {
        console.log('[socket.io] 连接已建立, id =', this.socket?.id);
        this.isConnected = true;
      });

      this.socket.on('disconnect', (reason: string) => {
        console.log('[socket.io] 连接断开:', reason);
        this.isConnected = false;
        this.socket = null;
        this.scheduleReconnect();
      });

      this.socket.on('connect_error', (err: unknown) => {
        console.error('[socket.io] 连接错误:', err);
        this.isConnected = false;
        this.socket = null;
        this.scheduleReconnect();
      });

      // === 注册后端会发的事件，并统一转成 WebSocketMessage 格式 ===
      const forwardEvents = [
        'activity',
        'ecg_stream',
        'ecg_update',
        'temp_update',
        'alarm',
        'alarm_clear',
        'error',
      ];

      forwardEvents.forEach((eventName) => {
        this.socket!.on(eventName, (data: any) => {
          // 控制打印次数，最多 50 条消息
          if (this.messageCount < this.maxMessageLogs) {
            console.log(`[socket.io] 收到事件 ${eventName}:`, data);
            this.messageCount++;
          }

          // 只有非 error 消息才更新 user_id
          if (eventName !== 'error' && data && 'user_id' in data) {
            userInfo.value = data.user_id;
          }

          const message: WebSocketMessage = {
            type: eventName,
            data,
          };

          const listeners = this.listeners.get(eventName);
          if (listeners) {
            listeners.forEach((listener) => listener(message));
          }
        });
      });
    } catch (error) {
      console.error('创建 Socket.IO 连接失败:', error);
      this.isConnected = false;
      this.socket = null;
      this.scheduleReconnect();
    }
  }

  // 断开连接
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  // 安排重连
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = window.setTimeout(() => {
      console.log('尝试重连 Socket.IO...');
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectInterval);
  }

  // 从前端发送消息到后端（如果有需要）
  // 约定：message.type 作为事件名，message.data 作为内容
  send(message: WebSocketMessage): void {
    if (this.socket && this.isConnected) {
      try {
        this.socket.emit(message.type, message.data ?? {});
      } catch (error) {
        console.error('发送 Socket.IO 消息失败:', error);
      }
    } else {
      console.warn('Socket.IO 未连接，无法发送消息');
    }
  }

  // 手动发送特定消息（仅本地触发监听器，用于测试）
  sendMessage(message: WebSocketMessage): void {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach((listener) => listener(message));
    }
  }

  // 监听消息
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
}

// 导出单例实例
export const websocketSimulator = new WebSocketSimulator();

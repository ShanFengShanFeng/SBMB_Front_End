import type { WebSocketMessage } from '../types/websocket';
import { ref } from 'vue'
export const userInfo = ref('')
// WebSocket连接管理类
export class WebSocketSimulator {
  private listeners: Map<string, Array<(message: WebSocketMessage) => void>> = new Map();
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectInterval = 5000; // 重连间隔，毫秒
  private reconnectTimer: number | null = null;
  private messageCount = 0; // 消息计数器
  private readonly maxMessageLogs = 50; // 最大打印消息数量

  // 连接到WebSocket服务器
  connect(): void {
    if (this.isConnected || this.ws?.readyState === WebSocket.OPEN) return;
    
    try {
      const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080';
      this.ws = new WebSocket(websocketUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket连接已建立');
        this.isConnected = true;
      };
      
      this.ws.onmessage = (event) => {
       try {
         const message: WebSocketMessage = JSON.parse(event.data);
         // 控制打印次数，最多50条消息
         if (this.messageCount < this.maxMessageLogs) {
           console.log('收到WebSocket消息:', message);
           this.messageCount++;
         }
         // 只有非错误消息才包含 user_id
          if(message.type !== 'error' && message.data && 'user_id' in message.data){
            userInfo.value = message.data.user_id;
          }
          // 触发对应的监听器
          const listeners = this.listeners.get(message.type);
          if (listeners) {
            listeners.forEach(listener => listener(message));
          }
        } catch (error) {
          console.error('解析WebSocket消息失败:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
        this.isConnected = false;
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket连接已关闭');
        this.isConnected = false;
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('创建WebSocket连接失败:', error);
      this.scheduleReconnect();
    }
  }

  // 断开WebSocket连接
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  // 安排重连
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    
    this.reconnectTimer = window.setTimeout(() => {
      console.log('尝试重连WebSocket...');
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectInterval);
  }

  // 发送消息到WebSocket服务器
  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('发送WebSocket消息失败:', error);
      }
    } else {
      console.warn('WebSocket未连接，无法发送消息');
    }
  }

  // 手动发送特定消息（可选，用于测试）
  // 注意：这个方法不会通过WebSocket发送，而是直接触发本地监听器
  sendMessage(message: WebSocketMessage): void {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(listener => listener(message));
    }
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

}

// 导出单例实例
export const websocketSimulator = new WebSocketSimulator();
import { ref, onMounted } from 'vue';
import { websocketSimulator } from '../lib/websocketSimulator';
import type { WebSocketMessage } from '../types/websocket';

export function useWebSocketSimulator() {
  const messages = ref<WebSocketMessage[]>([]);
  const isConnected = ref(false);
  const connect = () => {
    websocketSimulator.connect();
    isConnected.value = true;
  };

  const disconnect = () => {
    websocketSimulator.disconnect();
    isConnected.value = false;
  };

  const onMessage = (type: string, callback: (message: WebSocketMessage) => void) => {
    websocketSimulator.on(type, (message) => {
      messages.value.push(message);
      callback(message);
    });
  };

  const clearMessages = () => {
    messages.value = [];
  };

  onMounted(() => {
    // 组件挂载时自动连接（可选）
    // connect();
  });

  return {
    messages,
    isConnected,
    connect,
    disconnect,
    onMessage,
    clearMessages
  };
}
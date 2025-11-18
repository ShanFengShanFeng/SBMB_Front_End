# WebSocket 模拟器

这个模块提供了一个模拟WebSocket的功能，用于处理特定类型的消息。

## 消息类型

1. **activity**: 活动识别结果（实时）
2. **alarm / alarm_clear**: 姿态异常告警与清除
3. **ecg_stream**: 去噪后EASI三导ECG数据流
4. **ecg_update**: ECG指标更新
5. **temp_update**: 实时温度信息与告警
6. **error**: 错误信息

## 使用方法

### 1. 在Vue组件中使用

```vue
<script setup>
import { useWebSocketSimulator } from '@/composables/useWebSocketSimulator';

const { messages, isConnected, connect, disconnect, onMessage, clearMessages } = useWebSocketSimulator();

// 监听特定消息类型
onMessage('activity', (msg) => {
  console.log('收到活动消息:', msg);
});

// 连接WebSocket
connect();

// 断开WebSocket
disconnect();

// 清空消息
clearMessages();
</script>
```

### 2. 直接使用模拟器类

```typescript
import { websocketSimulator } from '@/lib/websocketSimulator';

// 连接
websocketSimulator.connect();

// 监听消息
websocketSimulator.on('activity', (message) => {
  console.log('Activity message:', message);
});

// 断开
websocketSimulator.disconnect();
```

## 功能特点

- 自动模拟随机消息推送（每2秒一个消息）
- 支持监听特定消息类型
- 提供连接状态管理
- 消息历史记录
- TypeScript类型安全

## 注意事项

- 这是一个模拟器，用于开发和测试目的
- 消息数据是随机生成的
- 可以手动发送特定消息用于测试
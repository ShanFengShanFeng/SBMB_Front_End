# WebSocket 连接器使用说明

## 概述

`websocketSimulator.ts` 已从模拟WebSocket改为真实WebSocket连接器，可以连接到本地运行的WebSocket服务器。

## 使用方法

### 1. 启动WebSocket服务器

首先需要启动WebSocket模拟服务器：

```bash
# 启动WebSocket服务器
pnpm websocket

# 或者使用启动脚本
pnpm websocket:start
```

服务器默认运行在 `ws://localhost:8080` 端口。

### 2. 在Vue组件中使用

```typescript
import { websocketSimulator } from '@/lib/websocketSimulator';

// 连接到WebSocket服务器
websocketSimulator.connect();

// 监听消息
websocketSimulator.on('ecg_stream', (message) => {
  console.log('收到ECG数据:', message);
});

websocketSimulator.on('activity', (message) => {
  console.log('收到活动数据:', message);
});

websocketSimulator.on('ecg_update', (message) => {
  console.log('收到ECG更新:', message);
});

websocketSimulator.on('temp_update', (message) => {
  console.log('收到体温数据:', message);
});

// 发送消息到服务器
websocketSimulator.send({
  type: 'subscribe',
  data: {
    channels: ['ecg_stream', 'activity']
  }
});

// 断开连接
websocketSimulator.disconnect();
```

### 3. 可用的方法

- `connect()`: 连接到WebSocket服务器
- `disconnect()`: 断开WebSocket连接
- `on(type, callback)`: 监听特定类型的消息
- `off(type, callback?)`: 移除监听器
- `send(message)`: 发送消息到WebSocket服务器
- `sendMessage(message)`: 本地测试方法，直接触发监听器

## 消息类型

支持的消息类型包括：

- `ecg_stream`: ECG心电图流数据
- `activity`: 活动识别数据
- `ecg_update`: ECG统计更新数据
- `temp_update`: 体温监测数据
- `error`: 错误消息

## 错误处理

连接器包含自动重连机制，当连接断开时会自动尝试重连。重连间隔默认为5秒。

## 注意事项

1. 确保WebSocket服务器正在运行
2. 连接器会自动处理重连逻辑
3. 所有消息都使用JSON格式传输
4. 支持多个监听器同时监听同一种消息类型

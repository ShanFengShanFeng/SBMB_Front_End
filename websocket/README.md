# WebSocket 模拟服务器

这是一个基于Node.js的WebSocket模拟服务器，用于模拟医疗监测设备的数据流。

## 功能特性

- 模拟真实医疗设备的WebSocket数据流
- 支持多种数据类型：
  - ECG心电图流数据
  - 活动识别数据
  - ECG统计更新数据
  - 体温监测数据
- 支持多个客户端同时连接
- 可配置的数据生成频率

## 安装依赖

在项目根目录运行：

```bash
pnpm install
```

## 启动服务器

### 方法一：直接启动（推荐）

```bash
pnpm websocket
```

### 方法二：使用启动脚本

```bash
pnpm websocket:start
```

### 方法三：手动启动

```bash
tsx websocket/index.ts
```

## 测试客户端

服务器提供了一个测试客户端，用于验证WebSocket连接和数据接收：

### 启动测试客户端

```bash
pnpm websocket:test
```

### 配置测试客户端

可以通过环境变量配置测试客户端：

```bash
# 指定服务器地址
WS_URL=ws://localhost:9000 pnpm websocket:test

# 指定客户端数量
CLIENT_COUNT=3 pnpm websocket:test

# 同时配置
CLIENT_COUNT=2 WS_URL=ws://localhost:9000 pnpm websocket:test
```

### 测试客户端功能

- 显示实时接收到的数据
- 支持多个并发客户端连接
- 统计连接数和消息数
- 格式化显示不同类型的数据
- 支持优雅关闭

## 服务器配置

- **默认端口**: 8080
- **可配置端口**: 通过环境变量 `WS_PORT` 设置

```bash
WS_PORT=9000 pnpm websocket
```

## 数据类型

### ECG流数据 (ecg_stream)

每100ms发送一次，包含实时心电图数据

### 活动识别数据 (activity)

每2.5秒发送一次，包含用户活动状态识别结果

### ECG统计更新 (ecg_update)

每1秒发送一次，包含心率变异性等统计信息

### 体温监测数据 (temp_update)

每1秒发送一次，包含体温和环境温度数据

## 客户端连接示例

```javascript
// 创建WebSocket连接
const ws = new WebSocket('ws://localhost:8080');

// 连接建立
ws.onopen = () => {
  console.log('WebSocket连接已建立');
  
  // 可以发送订阅消息
  ws.send(JSON.stringify({
    type: 'subscribe',
    data: {
      channels: ['ecg_stream', 'activity']
    }
  }));
};

// 接收消息
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('收到消息:', message);
};

// 处理错误
ws.onerror = (error) => {
  console.error('WebSocket错误:', error);
};

// 连接关闭
ws.onclose = () => {
  console.log('WebSocket连接已关闭');
};
```

## 与现有Vue组件集成

服务器与项目中的`websocketSimulator.ts`模拟器具有相同的数据格式，可以无缝替换使用。

### 使用真实WebSocket服务器

```javascript
// 替换src/lib/websocketSimulator.ts中的模拟实现
import { ref } from 'vue';

export class WebSocketSimulator {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Array<(message: any) => void>> = new Map();

  connect(): void {
    this.ws = new WebSocket('ws://localhost:8080');
    
    this.ws.onopen = () => {
      console.log('连接到WebSocket服务器');
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const listeners = this.listeners.get(message.type);
      if (listeners) {
        listeners.forEach(listener => listener(message));
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket错误:', error);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket连接已关闭');
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  on(type: string, callback: (message: any) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }

  off(type: string, callback?: (message: any) => void): void {
    // 实现移除监听器逻辑
  }
}
```

## 开发说明

- 服务器使用TypeScript编写，需要tsx运行时支持
- 数据生成使用随机算法模拟真实设备行为
- 支持优雅关闭，会正确处理SIGINT和SIGTERM信号
- 所有连接的客户端都会收到相同的数据流

## 故障排除

### 端口被占用

如果默认端口8080被占用，可以使用环境变量指定其他端口：

```bash
WS_PORT=9000 pnpm websocket
```

### 依赖问题

如果遇到依赖问题，请重新安装：

```bash
pnpm install
```

### 权限问题

确保有执行权限：

```bash
chmod +x websocket/server.js

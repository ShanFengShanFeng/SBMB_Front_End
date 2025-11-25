import WebSocket, { WebSocketServer } from 'ws';
import { createServer } from 'http';
import type { WebSocketMessage, ActivityMessage, EcgStreamMessage, EcgUpdateMessage, TempUpdateMessage } from '../src/types/websocket';

// WebSocket服务器配置
const PORT = process.env.WS_PORT || 8080;

// 创建HTTP服务器
const server = createServer();

// 创建WebSocket服务器
const wss = new WebSocketServer({ server });

// 存储连接的客户端
const clients = new Set<WebSocket>();

// 模拟数据生成函数
function generateEcgStreamData(): EcgStreamMessage {
  return {
    user_id: 'u1',
    fs_hz: 100,
    t: Date.now(),
    easi_ai: Math.random() * 0.001 + 0.001 * Math.random(),
    easi_es: Math.random() * 0.002,
    easi_as: Math.random() * 0.002
  };
}

function generateActivityData(): ActivityMessage {
  const activities = ['sit', 'stand', 'lie', 'walk', 'run', 'climb_stairs', 'descend_stairs', 'jump'];
  const selectedActivity = activities[Math.floor(Math.random() * activities.length)];
  
  const probs: Record<string, number> = {};
  activities.forEach(activity => {
    probs[activity] = Math.random() * 0.3;
  });
  
  // 确保选中活动的概率最高
  probs[selectedActivity] = Math.max(...Object.values(probs)) + 0.4;
  
  // 归一化概率
  const sum = Object.values(probs).reduce((acc, val) => acc + val, 0);
  Object.keys(probs).forEach(key => {
    probs[key] /= sum;
  });

  return {
    user_id: 'u1',
    label: selectedActivity,
    label_id: Math.floor(Math.random() * 8),
    probs,
    win: 200,
    hop: 50,
    fs_hz: 100,
    ts: Date.now()
  };
}

function generateEcgUpdateData(): EcgUpdateMessage {
  return {
    user_id: 'u1',
    fs_hz: 100,
    rpeak_count: Math.floor(Math.random() * 10) + 120,
    hr_mean_bpm: Math.random() * 20 + 60,
    sdnn_ms: Math.random() * 20 + 30,
    rmssd_ms: Math.random() * 20 + 30,
    resp_rate_bpm: Math.random() * 5 + 10,
    win_samples: 2000,
    ts: Date.now()
  };
}

function generateTempUpdateData(): TempUpdateMessage {
  return {
    user_id: 'u1',
    object_c: Math.random() * 5 + 30,
    ambient_c: Math.random() * 5 + 25,
    smoothed_object_c: Math.random() * 5 + 30,
    alarm: null,
    ts: Date.now()
  };
}

// 向所有连接的客户端发送消息
function broadcast(message: WebSocketMessage): void {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// 启动数据模拟
function startDataSimulation(): void {
  // 模拟ECG流数据，每100ms发送一次
  setInterval(() => {
    broadcast({
      type: 'ecg_stream',
      data: generateEcgStreamData()
    });
  }, 2000);

  // 模拟活动数据，每2.5秒发送一次
  setInterval(() => {
    broadcast({
      type: 'activity',
      data: generateActivityData()
    });
  }, 2500);

  // 模拟ECG更新和温度更新，每1秒发送一次
  setInterval(() => {
    broadcast({
      type: 'ecg_update',
      data: generateEcgUpdateData()
    });

    broadcast({
      type: 'temp_update',
      data: generateTempUpdateData()
    });
  }, 4000);
}

// WebSocket连接处理
wss.on('connection', (ws: WebSocket) => {
  console.log('新客户端连接:', new Date().toISOString());
  clients.add(ws);

  // 发送连接确认消息
  ws.send(JSON.stringify({
    type: 'connected',
    data: {
      message: 'WebSocket连接已建立',
      timestamp: Date.now()
    }
  }));

  // 处理客户端消息
  ws.on('message', (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('收到客户端消息:', message);
      
      // 可以根据客户端消息类型进行不同处理
      if (message.type === 'subscribe') {
        ws.send(JSON.stringify({
          type: 'subscribed',
          data: {
            channels: message.data.channels || [],
            timestamp: Date.now()
          }
        }));
      }
    } catch (error) {
      console.error('解析客户端消息失败:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: {
          where: 'server',
          msg: '消息解析失败'
        }
      }));
    }
  });

  // 处理连接关闭
  ws.on('close', () => {
    console.log('客户端断开连接:', new Date().toISOString());
    clients.delete(ws);
  });

  // 处理错误
  ws.on('error', (error) => {
    console.error('WebSocket错误:', error);
  });
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`WebSocket服务器运行在端口 ${PORT}`);
  console.log(`服务器启动时间: ${new Date().toISOString()}`);
  startDataSimulation();
  console.log('数据模拟已启动');
});

// 优雅关闭处理
process.on('SIGINT', () => {
  console.log('\n正在关闭WebSocket服务器...');
  
  // 关闭所有客户端连接
  clients.forEach(client => {
    client.close(1000, '服务器关闭');
  });
  
  // 关闭WebSocket服务器
  wss.close(() => {
    console.log('WebSocket服务器已关闭');
    process.exit(0);
  });
});

export { server, wss, broadcast };
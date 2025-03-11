interface WebSocketMessage {
  type: 'think' | 'tool' | 'act' | 'error' | 'complete';
  content: string;
  metadata?: {
    step?: number;
    toolName?: string;
    status?: string;
  };
}

class OpenManusSocket {
  private socket: WebSocket | null = null;
  private messageHandlers: ((data: any) => void)[] = [];
  private heartbeatInterval: NodeJS.Timer | null = null;

  connect(taskId: string) {
    this.socket = new WebSocket(`ws://localhost:8000/ws/tasks/${taskId}`);
    
    this.socket.onmessage = (event) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      if (data.type === 'error') {
        logger.error(data.content);
      } else {
        logger.info(`${data.type}: ${data.content}`);
      }
      this.messageHandlers.forEach(handler => handler(data));
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.messageHandlers.forEach(handler => 
        handler({ type: 'error', content: 'WebSocket connection error' })
      );
    };

    // Add heartbeat
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000);

    this.socket.onclose = () => {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
    };
  }

  subscribe(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  execute(code: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'execute', code }));
    }
  }

  sendToolResult(result: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'tool_result',
        content: result
      }));
    }
  }
}

export const openManusSocket = new OpenManusSocket();

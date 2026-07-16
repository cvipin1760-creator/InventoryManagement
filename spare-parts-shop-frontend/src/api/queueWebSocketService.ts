export class QueueWebSocketService {
  private ws: WebSocket | null = null;
  private businessId: number;
  private onUpdate: (data: any) => void;

  constructor(businessId: number, onUpdate: (data: any) => void) {
    this.businessId = businessId;
    this.onUpdate = onUpdate;
  }

  connect() {
    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    // Convert to ws://
    let wsUrl = baseUrl.replace('http', 'ws');
    if (wsUrl.endsWith('/api')) {
      wsUrl = wsUrl.substring(0, wsUrl.length - 4);
    }
    wsUrl += '/ws/queue';

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Queue WebSocket Connected');
      this.ws?.send(JSON.stringify({
        action: 'subscribe',
        businessId: this.businessId
      }));
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onUpdate(data);
      } catch (e) {
        console.error('Error parsing queue websocket message', e);
      }
    };

    this.ws.onclose = () => {
      console.log('Queue WebSocket Disconnected. Reconnecting in 5s...');
      setTimeout(() => this.connect(), 5000);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

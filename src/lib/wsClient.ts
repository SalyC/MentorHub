export type ConnectionStatus = "connecting" | "open" | "closed" | "reconnecting";

export interface WsChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

type MessageHandler = (message: WsChatMessage) => void;
type StatusHandler = (status: ConnectionStatus) => void;

interface WsClient {
  send: (text: string) => void;
  onMessage: (handler: MessageHandler) => () => void;
  onStatus: (handler: StatusHandler) => () => void;
  close: () => void;
}

const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;

export function createWsClient(url: string): WsClient {
  let socket: WebSocket | null = null;
  let reconnectAttempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let manuallyClosed = false;
  const messageHandlers = new Set<MessageHandler>();
  const statusHandlers = new Set<StatusHandler>();

  const setStatus = (status: ConnectionStatus) => {
    statusHandlers.forEach((handler) => handler(status));
  };

  const connect = () => {
    if (manuallyClosed) return;
    setStatus(reconnectAttempt > 0 ? "reconnecting" : "connecting");
    socket = new WebSocket(url);

    socket.onopen = () => {
      reconnectAttempt = 0;
      setStatus("open");
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      try {
        const message = JSON.parse(event.data) as WsChatMessage;
        if (message.id && message.senderId && message.senderName && message.text) {
          messageHandlers.forEach((handler) => handler(message));
        }
      } catch {
        // Ignore malformed frames.
      }
    };

    socket.onclose = () => {
      socket = null;
      if (manuallyClosed) {
        setStatus("closed");
        return;
      }

      setStatus("closed");
      const delay = Math.min(
        INITIAL_RECONNECT_DELAY_MS * 2 ** reconnectAttempt,
        MAX_RECONNECT_DELAY_MS,
      );
      reconnectAttempt += 1;
      reconnectTimer = setTimeout(connect, delay);
    };

    socket.onerror = () => socket?.close();
  };

  connect();

  return {
    send: (text) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ text }));
      }
    },
    onMessage: (handler) => {
      messageHandlers.add(handler);
      return () => messageHandlers.delete(handler);
    },
    onStatus: (handler) => {
      statusHandlers.add(handler);
      return () => statusHandlers.delete(handler);
    },
    close: () => {
      manuallyClosed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
      socket = null;
      setStatus("closed");
    },
  };
}

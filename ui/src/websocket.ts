import {
  WebSocketClient,
  type WebSocketClient as WazoWebSocketClient,
} from '@wazo/sdk';

let ws: WazoWebSocketClient;

export const initWazoSocket = ({ host, token }: { host: string, token: string }) => {
  if(ws) {
    return ws;
  }

  ws = new WebSocketClient({
    host,
    token,
    events: [''], // List of events you want to receive (use `['*']` as wildcard).
    version: 2, // Use version 2 of the Wazo WebSocket protocol to be informed when the token will expire.
  }, {
    // debug: true,
    // see https://github.com/pladaria/reconnecting-websocket#available-options
  });

  ws.connect();

  ws.on('foo', ({ enabled }) => {
    console.log(enabled);
  });
  return ws;
}

export const getWazoSocket = () => ws;

export const closeWazoSocket = () => {
  ws.close();
}

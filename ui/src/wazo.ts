import {
  ApiRequester,
  WebSocketClient,
  type WebSocketClient as WazoWebSocketClient,
} from '@wazo/sdk';

let ws: WazoWebSocketClient;
let requester: typeof ApiRequester;
const CLIENT_ID = 'emergency-check-plugin';

type InitOpts = { host: string, token: string };

export const initWazoSocket = ({ host, token }: InitOpts) => {
  if(ws) {
    return ws;
  }

  ws = new WebSocketClient({
    host,
    token,
    events: ['*'], // List of events you want to receive (use `['*']` as wildcard).
    version: 2, // Use version 2 of the Wazo WebSocket protocol to be informed when the token will expire.
  }, {
    // debug: true,
    // see https://github.com/pladaria/reconnecting-websocket#available-options
  });

  ws.connect();

  ws.on('*', (args) => {
    // @todo
    store.dispatch();
  });
  return ws;
}

export const getWazoSocket = () => ws;

export const closeWazoSocket = () => {
  ws.close();
}

export const initWazoRequester = ({ host, token }: InitOpts) => {
  if(requester) {
    return requester;
  }

  requester = new ApiRequester({
    server: host,
    clientId: CLIENT_ID,
  });
  requester.setToken(token);

  return requester;
}

export const getWazoRequester = () => requester;

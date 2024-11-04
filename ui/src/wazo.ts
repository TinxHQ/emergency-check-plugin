import {
  ApiRequester,
  WebSocketClient,
  type WebSocketClient as WazoWebSocketClient,
} from '@wazo/sdk';
import store from './store';
import { alertNotSafe, alertSafe } from './store/alertSlice';

let ws: WazoWebSocketClient;
let requester: typeof ApiRequester;
const CLIENT_ID = 'emergency-check-plugin';

type InitOpts = {
  host: string;
  token: string;
  tenant: string;
};

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

  // Plugin events
  // emergency_check_user_confirmed_safe
  // emergency_check_user_reached
  // emergency_check_user_confirmed_unsafe
  // emergency_check_initiated
  // emergency_check_concluded

  ws.on('emergency_check_user_confirmed_safe', (args: Record<string, any>) => {
    store.dispatch(alertSafe({ uuid: args.data.user_uuid }))
  });

  ws.on('emergency_check_user_confirmed_unsafe', (args: Record<string, any>) => {
    store.dispatch(alertNotSafe({ uuid: args.data.user_uuid }))
  });

  return ws;
}

export const getWazoSocket = () => ws;

export const closeWazoSocket = () => {
  ws.close();
}

export const initWazoRequester = ({ host, token, tenant }: InitOpts) => {
  if(requester) {
    return requester;
  }

  requester = new ApiRequester({
    server: host,
    clientId: CLIENT_ID,
  });
  requester.setToken(token);
  requester.setTenant(tenant)

  return requester;
}

export const getWazoRequester = () => requester;

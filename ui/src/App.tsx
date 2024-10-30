import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { App as AppPlugin } from '@wazo/euc-plugins-sdk';
import routes from './routes'
import { closeWazoSocket, initWazoSocket } from './websocket';
import { Provider } from 'react-redux';
import store from './store';
import { useEffect } from 'react';

const router = createBrowserRouter(routes);
const wazoApp = new AppPlugin();

wazoApp.onPluginUnLoaded = () => {
  closeWazoSocket();
}

(async () => {
  await wazoApp.initialize();
  const context = wazoApp.getContext();

  initWazoSocket({
    host: context.app.extra.stack.host,
    token: context.app.extra.stack.session.token
  })
})();


const App = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App

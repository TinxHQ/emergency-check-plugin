import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { App as AppPlugin } from '@wazo/euc-plugins-sdk';
import routes from './routes'
import { initWazoSocket } from './websocket';

const router = createBrowserRouter(routes);
const wazoApp = new AppPlugin();

wazoApp.onPluginUnLoaded = () => {
  console.log('allo');
}

(async () => {
  await wazoApp.initialize();
  const context = wazoApp.getContext();

  initWazoSocket({
    host: context.app.extra.stack.host,
    token: context.app.extra.stack.session.token
  })
})();


const App = () => (
  <RouterProvider router={router} />
);

export default App

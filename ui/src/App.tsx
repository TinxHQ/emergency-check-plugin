import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { App as AppPlugin } from '@wazo/euc-plugins-sdk';
import routes from './routes'
import { closeWazoSocket, initWazoRequester, initWazoSocket } from './wazo';
import { Provider } from 'react-redux';
import store from './store';
import devMode from './devMode';

const router = createBrowserRouter(routes);
const wazoApp = new AppPlugin();

wazoApp.onPluginUnLoaded = () => {
  closeWazoSocket();
}

(async () => {
  await wazoApp.initialize();
  const context: any = wazoApp.getContext();

  // @todo move to sdk
  devMode();

  const authInfo = {
    host: context.app.extra.stack.host,
    token: context.app.extra.stack.session.token,
    tenant: context.app.extra.stack.currentTenant
  };

  initWazoSocket(authInfo)
  initWazoRequester(authInfo);
})();


const App = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App

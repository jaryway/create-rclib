import { Suspense, lazy, FC } from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { UseAPIProvider } from '@ahooksjs/use-request';
import { ConfigProvider, Spin } from 'antd';
import { request4useRequest } from '@fregata/utils';
import { ConfigProvider as FregataConfigProvider } from '@fregata/ui';
import { OidcProvider, BaseAppProvider } from '@fregata/utils';
import zhCN from 'antd/lib/locale/zh_CN';
import 'moment/locale/zh-cn'; // 引入 moment 的中文语言包
import 'assets/less/console.less'; // 按需引入本项目所需的样式

const isMicro = process.env.REACT_APP_RUN_MODE === 'micro';

if (process.env.NODE_ENV === 'development') {
  (window as any).___mockUserData = {
    grant_type: 'password',
    username: '',
    password: '',
  };
}

const App = lazy(() => import(`./App`));

const RootComponent: FC<any> = (props) => {
  return (
    <ConfigProvider locale={zhCN}>
      <UseAPIProvider value={{ requestMethod: request4useRequest }}>
        <FregataConfigProvider requestMethod={request4useRequest}>
          <Router basename={isMicro ? '/xxxx' : undefined}>
            <OidcProvider>
              <BaseAppProvider onGlobalStateChange={props?.onGlobalStateChange}>
                <Suspense fallback={<Spin spinning={true} />}>
                  <Route path='/' component={App} />
                </Suspense>
              </BaseAppProvider>
            </OidcProvider>
          </Router>
        </FregataConfigProvider>
      </UseAPIProvider>
    </ConfigProvider>
  );
};

export default RootComponent;

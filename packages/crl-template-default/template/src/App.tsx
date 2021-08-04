import { FC, lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Spin } from 'antd';

const isMicro = process.env.REACT_APP_RUN_MODE === 'micro';
const Home = lazy(() => import('./pages'));
const BasicLayout = lazy(() => import(`./layouts/BasicLayout${isMicro ? '.micro' : ''}`));

const App: FC<any> = () => {
  return (
    <BasicLayout>
      <Suspense fallback={<Spin />}>
        <Switch>
          <Route component={Home} />
        </Switch>
      </Suspense>
    </BasicLayout>
  );
};

export default App;

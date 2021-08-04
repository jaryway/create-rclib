import React, { FC, Suspense, lazy } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import { Spin } from 'antd';
import { MainContainer } from '@fregata/ui';

const Test1 = lazy(() => import('./test/index1'));
const Test2 = lazy(() => import('./test/index2'));

const Pages: FC<any> = () => {
  return (
    <MainContainer className='bg-white' isBody={true}>
      <Suspense fallback={<Spin />}>
        <Switch>
          <Route path={`/test/1`} component={Test1} />
          <Route path={`/test/2`} component={Test2} />
          <Redirect to={`/test/1`} />
        </Switch>
      </Suspense>
    </MainContainer>
  );
};

export default Pages;

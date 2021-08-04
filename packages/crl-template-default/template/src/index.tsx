import React from 'react';
import ReactDOM from 'react-dom';
import RootComponent from './root.component';

// console.log('homepage-app', window.__POWERED_BY_QIANKUN__);

function render(props: any) {
  const { container, ...rest } = props;
  ReactDOM.render(
    <RootComponent {...rest} />,
    container ? container.querySelector('#root') : document.querySelector('#root')
  );
}

if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

export async function bootstrap() {
  console.log('[react16] react app bootstraped');
}

export async function mount(props: any) {
  console.log('[react16] props from main framework', props);
  render(props);
}

export async function unmount(props: any) {
  const { container } = props;
  ReactDOM.unmountComponentAtNode(
    container ? container.querySelector('#root') : document.querySelector('#root')
  );
}

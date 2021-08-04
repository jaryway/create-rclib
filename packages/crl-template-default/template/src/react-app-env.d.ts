/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test' | 'xcxcxc';
    readonly REACT_APP_RUN_MODE?: 'micro';
    readonly PUBLIC_URL: string;
  }
}

interface ICONFIG {
  API_BASE_URL: string;
}

interface Window {
  CONFIG: ICONFIG;
  __POWERED_BY_QIANKUN__?: boolean;
}

declare let CONFIG: ICONFIG;

declare module 'crypto-js/md5';

import React, { FC, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { AppstoreOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import classNames from 'classnames';

import menuData from '../mock/menuData';

import './BasicLayout.less';

const { SubMenu } = Menu;
const { Sider, Content, Header } = Layout;

function loop2Tree(source: any, parentId: any = undefined, level = 0) {
  const nextLevel = level + 1;
  return source
    .filter((m: any) => (parentId ? m.parentId === parentId : !m.parentId))
    .map((m: any) => {
      return {
        id: m.id,
        icon: level === 0 && (m.icon || 'appstore'),
        level: level || 0,
        title: m.title,
        href: m.href,
        children: loop2Tree(source, m.id, nextLevel),
      };
    });
}

function renderMenu(menus: any) {
  return menus.map((item: any) => {
    const { children, ...dataRef } = item;
    if (item.level > 1) return null;

    if (children && children.length && item.level === 0) {
      return (
        <SubMenu
          key={dataRef.id}
          title={
            <span>
              {item.level === 0 && <AppstoreOutlined />}
              <span>{dataRef.title}</span>
            </span>
          }
        >
          {renderMenu(children)}
        </SubMenu>
      );
    }

    return (
      <Menu.Item key={dataRef.id} {...{ dataRef }}>
        {item.level === 0 && <AppstoreOutlined />}
        <span>{dataRef.title}</span>
      </Menu.Item>
    );
  });
}

const BasicLayout: FC<any> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const history = useHistory();

  const toggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);

  const onMenuClick = useCallback(({ domEvent, item }) => {
    console.log('onMenuClick', domEvent, item);
    const { href } = item.props?.dataRef || {};
    history.push(href);
  }, [history]);

  return (
    <Layout id='components-layout-demo-custom-trigger'>
      <Sider trigger={null} collapsible collapsed={collapsed} theme='light' className='components-layout-sider'>
        <div className='logo' />
        <div className='sider-menu-wrapper'>
          <Menu
            theme='light'
            mode='inline'
            defaultOpenKeys={['k1']}
            onClick={onMenuClick}
            style={{ minHeight: 'calc(100vh - 64px)' }}
          >
            {renderMenu(loop2Tree(menuData))}
          </Menu>
        </div>
      </Sider>
      <Layout className={classNames('layout-main', { 'layout-main-mini': collapsed })}>
        <Header className='bg-white'>
          {collapsed ? <MenuUnfoldOutlined onClick={toggle} /> : <MenuFoldOutlined onClick={toggle} />}
        </Header>
        <Content id='maincontent' style={{ minHeight: 'calc(100vh - 64px)', position: 'relative' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;

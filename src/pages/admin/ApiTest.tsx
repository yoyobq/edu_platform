import Footer from '@/components/Footer';

// import {
//   // AlipayCircleOutlined,
//   LockOutlined,
//   // TaobaoCircleOutlined,
//   UserOutlined,
// } from '@ant-design/icons';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { request } from '@umijs/max';
// import { FormattedMessage, Helmet, history, SelectLang, useIntl, useModel } from '@umijs/max';
import { Button } from 'antd';
import React from 'react';
// import { useState } from 'react';
// import Settings from '../../../../config/defaultSettings';

const ApiTest: React.FC = () => {
  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      // backgroundImage:
      //   "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });

  // 一个通用的前后台通讯触发函数，可以作为新 api 的起手式
  async function commonTrigger() {
    console.log('The common trigger is activated.');
    const body = null;
    // JSON.stringify({});

    try {
      // let res = await request<any>('/api/chat', {
      let res = await request<any>('/api/testLogin', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      });
      console.log(res);
    } catch (error) {
      console.error('error msg:', error);
    }
  }

  async function testChat() {
    console.log('The common trigger is activated.');
    const body = null;
    // JSON.stringify({});

    try {
      let res = await request<any>('/api/chat', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      });
      console.log(res);
    } catch (error) {
      console.error('error msg:', error);
    }
  }

  async function testLogin() {
    console.log('The common trigger is activated.');
    const body = null;
    // JSON.stringify({});

    try {
      // let res = await request<any>('/api/chat', {
      let res = await request<any>('/api/testLogin', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      });
      console.log(res);
    } catch (error) {
      console.error('error msg:', error);
    }
  }

  return (
    <div className={containerClassName}>
      <section>API test</section>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        {/* commonTrigger 按钮代码开始 */}
        <Button onClick={commonTrigger} type="primary">
          我是一个通用扳机（commonTrigger）
        </Button>
        {/* commonTrigger 按钮代码结束 */}
        <Button onClick={testChat}>测试 /chat</Button>
        <Button onClick={testLogin}>测试 /testLogin</Button>
      </div>
      <Footer />
    </div>
  );
};

export default ApiTest;

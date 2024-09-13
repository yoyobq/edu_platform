import Footer from '@/components/Footer';
import { updateAccount } from '@/services/ant-design-pro/login';

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

  async function pythonHi() {
    console.log('The PythonHi trigger is activated.');
    const body = null;
    // JSON.stringify({});

    try {
      let res = await request<any>('/api/pythonHi', {
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

  // 重置 guest 密码
  const handleUpdateEmail = async () => {
    try {
      // 更新账户邮箱
      const res: any = await updateAccount({
        id: 3, // 用户的 id
        loginEmail: 'guest@example.com', // 新的邮箱地址
        loginPassword: 'guest',
      });
      console.log('账户邮箱更新成功：', res);
      // 在这里可以做一些成功更新后的操作，例如提示用户更新成功、重新加载数据等
    } catch (error) {
      console.error('更新账户邮箱失败：', error);
      // 在这里可以做一些更新失败后的操作，例如提示用户更新失败、记录错误日志等
    }
  };

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
        <Button onClick={pythonHi}>测试 /pythonHi</Button>
        <Button onClick={handleUpdateEmail}>测试 /handleUpdateEmail</Button>
      </div>
      <Footer />
    </div>
  );
};

export default ApiTest;

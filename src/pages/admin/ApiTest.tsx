import Footer from '@/components/Footer';
import { login, updateAccount } from '@/services/ant-design-pro/login';

// import {
//   // AlipayCircleOutlined,
//   LockOutlined,
//   // TaobaoCircleOutlined,
//   UserOutlined,
// } from '@ant-design/icons';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { request } from '@umijs/max';
// import { FormattedMessage, Helmet, history, SelectLang, useIntl, useModel } from '@umijs/max';
import { Button, message } from 'antd';
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

  // 新增：测试远程 /nest 的 GraphQL mutation
  const testRemoteNestGraphQL = async () => {
    console.log('🚀 测试远程 GraphQL /nest 被触发');

    const query = `
      mutation UpdateCat($updateCatInput: UpdateCatInput!) {
        updateCat(updateCatInput: $updateCatInput) {
          id
          name
          status
        }
      }
    `;

    const variables = {
      updateCatInput: {
        id: 29,
        status: 'LOST',
      },
    };

    try {
      const res = await request<any>('/nest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-apollo-operation-name': 'test',
        },
        data: {
          query,
          variables,
        },
      });
      console.log(res);
    } catch (error) {
      console.error(error);
    }
  };

  const fakeLogin = async () => {
    const values = {
      loginName: 'yoyobq@hotmail.com',
      loginPassword: '123456',
      type: 'account',
    };
    try {
      // 登录
      const res: any = await login({ ...values, type: 'account' });
      // res = {id: 2, status: 1} 旧数据， status 是数值常量
      // res = {id: 2, status: 'ACTIVE'} 新数据，改动了数据库中存储的 status 为枚举类型
      // TODO：根据不同的 status 做不同的处理
      const { id, status } = res;
      if (id !== null && status === 'ACTIVE') {
        message.success('登录成功');
        console.log(res);
      }
    } catch (error: any) {
      console.log(error);
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
        <Button onClick={testRemoteNestGraphQL} type="dashed" style={{ marginTop: 16 }}>
          测试远程 /nest GraphQL（UpdateCat）
        </Button>
        <Button onClick={fakeLogin} type="dashed" style={{ marginTop: 16 }}>
          测试登录
        </Button>
      </div>
      <Footer />
    </div>
  );
};

export default ApiTest;

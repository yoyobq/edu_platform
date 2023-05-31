import Footer from '@/components/Footer';

// import {
//   // AlipayCircleOutlined,
//   LockOutlined,
//   // TaobaoCircleOutlined,
//   UserOutlined,
// } from '@ant-design/icons';
import { useEmotionCss } from '@ant-design/use-emotion-css';
// import { FormattedMessage, Helmet, history, SelectLang, useIntl, useModel } from '@umijs/max';
// import { Alert, message, Tabs } from 'antd';
import React from 'react';
// import { useState } from 'react';
// import Settings from '../../../../config/defaultSettings';
import { request } from '@umijs/max';

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

  async function test() {
    // console.log(options);
    // const body = JSON.stringify(options);

    return request<Record<string, any>>('/api/getSession', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // data: body,
    });
  }

  const showRes = async () => {
    console.log(await test());
  };

  showRes();
  return (
    <div className={containerClassName}>
      <section>API test</section>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      ></div>
      <Footer />
    </div>
  );
};

export default ApiTest;

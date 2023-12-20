import Footer from '@/components/Footer';
import { getQuestions } from '@/services/ant-design-pro/questions';
// import {
//   // AlipayCircleOutlined,
//   LockOutlined,
//   // TaobaoCircleOutlined,
//   UserOutlined,
// } from '@ant-design/icons';
import { useEmotionCss } from '@ant-design/use-emotion-css';
// import { FormattedMessage, Helmet, history, SelectLang, useIntl, useModel } from '@umijs/max';
import { useModel } from '@umijs/max';
// import { Alert, message, Tabs } from 'antd';
import React from 'react';
// import { useState } from 'react';
import { flushSync } from 'react-dom';
// import Settings from '../../../../config/defaultSettings';

const SelfTest: React.FC = () => {
  // 从 @@initialState 读取默认设置的全局初始数据并存放到 state 变量 initialState 中去。
  const { initialState, setInitialState } = useModel('@@initialState');
  console.log(initialState);

  const getData = async () => {
    const res: any = await getQuestions();
    // 成功获取试题数据
    console.log(res);
  };

  getData();

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

  // 引入 i18n 国际化
  // const intl = useIntl();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const exmaple: any = () => {
    // flushSync 是 React DOM 中的一个函数，它的作用是在调用它的时候，
    // 强制同步更新所有的挂起更新，而不是等待浏览器空闲时再执行更新，以提高更新性能
    // 在这个示例中，其实什么都没做
    flushSync(() => {
      setInitialState((s) => ({
        ...s,
        currentUser: initialState?.currentUser,
      }));
    });
  };

  return (
    <div className={containerClassName}>
      <section>这是一个空白的模板文档，用于快速创建 Edu Platform 的新页面</section>
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

export default SelfTest;

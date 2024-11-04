import Footer from '@/components/Footer'; // 导入底部组件，用于页面底部展示
import { useModel } from '@umijs/max'; // 用于访问全局状态管理的钩子
import React from 'react';
import { flushSync } from 'react-dom'; // React DOM 的同步刷新函数
import './style.less'; // 引入样式文件，包含页面整体布局的样式

/**
 * LogAutoMate 组件：用于 Edu Platform 的新页面模板，结构清晰，方便快速创建和定制
 */
const BlankPage: React.FC = () => {
  // 使用 useModel 钩子访问 initialState，包含全局的初始化数据
  const { initialState, setInitialState } = useModel('@@initialState');

  /**
   * 示例函数 exampleUpdate: 使用 flushSync 来强制同步更新 initialState 中的 currentUser 数据
   * flushSync 是 React 的同步刷新函数，确保更新立即生效
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const exampleUpdate: any = () => {
    flushSync(() => {
      setInitialState((s) => ({
        ...s,
        currentUser: initialState?.currentUser,
      }));
    });
  };

  return (
    <div className="container">
      {/* 页面内容区域 */}
      <section>这是一个空白的模板文档，用于快速创建 Edu Platform 的新页面</section>
      <div className="content-padding"></div>
      {/* 页面底部组件 */}
      <Footer />
    </div>
  );
};

export default BlankPage;

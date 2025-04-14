import Footer from '@/components/Footer'; // 导入底部组件，用于页面底部展示
import React from 'react';
import './style.less'; // 引入样式文件，包含页面整体布局的样式

const WorkloadForecastPage: React.FC = () => {
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

export default WorkloadForecastPage;

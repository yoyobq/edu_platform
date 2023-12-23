import React from 'react';
import styles from '../index.less';

interface topicProps {
  No: number;
  content: string;
  selectTag?: string;
}

const Topic: React.FC<topicProps> = ({ No, content, selectTag }) => {
  // 解决把用户答案写到括号里问题的临时办法
  let finalContent = '';

  // 用户提交答案后，把空格替换成字符
  const reg = /\(\s+\)/;
  finalContent = content.replace(reg, `( ${selectTag} )`);

  finalContent = `${No}、${finalContent}`;
  return <span className={styles[`qu-content`]}>{finalContent}</span>;
};

const areEqual = (prevProps: topicProps, nextProps: topicProps) => {
  if (prevProps.selectTag !== nextProps.selectTag) {
    return false;
  }

  if (prevProps.content !== nextProps.content) {
    return false;
  }

  // 没有变化，不重新渲染
  return true;
};

// memo是高阶组件，用于性能优化，详见 areEqual函数
export default React.memo(Topic, areEqual);

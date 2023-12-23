import type { QuestionProps } from '@/pages/ExSingleSelection/data';
import React from 'react';
import styles from '../index.less';
import OptionList from './JugOptionList';
import QuestionImage from './QuestionImage';
import Topic from './Topic';

// routes 名字与文件名一致
const Question: React.FC<QuestionProps> = ({
  No,
  topic,
  options,
  currentAnswer,
  onChange,
  pic_path,
}) => {
  // 为适配统一的Topic，格式化输出
  let selectChoice = '';
  switch (currentAnswer) {
    case '1':
      selectChoice = 'True ';
      break;
    case '0':
      selectChoice = 'False';
      break;
    default:
      selectChoice = '';
  }

  return (
    <div className={styles.question}>
      <Topic No={No + 1} content={topic} selectTag={selectChoice} />
      <div>
        <QuestionImage picPath={pic_path} />
      </div>
      <div>
        <OptionList No={No} optList={options} currentAnswer={currentAnswer} onChange={onChange} />
      </div>
    </div>
  );
};

const areEqual = (prevProps: QuestionProps, nextProps: QuestionProps) => {
  if (prevProps.currentAnswer === nextProps.currentAnswer) {
    // 没有变化，就不要重新渲染
    return true;
  }

  // 有变化，需要重新渲染
  return false;
};

export default React.memo(Question, areEqual);

import React from 'react';
// import ResultBoard from '../components/ResultBoard';
import styles from '../index.less';
import OptionList from './MulOptionList';
import QuestionImage from './QuestionImage';
import Topic from './Topic';

// routes 名字与文件名一致
const Question: React.FC<SelfTest.QuestionProps> = ({
  No,
  topic,
  options,
  currentAnswer,
  orderedTag,
  onChange,
  pic_path,
}) => {
  // 暂不打乱多选题顺序
  return (
    <div className={styles.question}>
      <Topic No={No + 1} content={topic} selectTag={currentAnswer} />
      <div>
        <QuestionImage picPath={pic_path} />
      </div>
      <div>
        <OptionList
          No={No}
          optList={options}
          currentAnswer={currentAnswer}
          onChange={onChange}
          // ! 表示运行到此时，orderedTag 一定有值，不会是 undifined
          orderedTag={orderedTag!}
        />
      </div>
    </div>
  );
};

export default Question;

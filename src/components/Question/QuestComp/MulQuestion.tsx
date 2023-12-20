import React from 'react';
// import ResultBoard from '../components/ResultBoard';
import type { QuestionProps } from '../data';
import styles from '../index.less';
import OptionList from './MulOptionList';
import QuestionImage from './QuestionImage';
import Topic from './Topic';

// routes 名字与文件名一致
const Question: React.FC<QuestionProps> = ({
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

// 性能优化用于比较组件的Props是否没有变化，也就是说要不要重新渲染
// 与 class 组件中 shouldComponentUpdate() 方法不同的是，
// 如果 props 相等，areEqual 会返回 true；如果 props 不相等，则返回 false。
// 这与 shouldComponentUpdate 方法的返回值相反
const areEqual = (prevProps: QuestionProps, nextProps: QuestionProps) => {
  /*
  如果把 nextProps 传入 render 方法的返回结果与
  将 prevProps 传入 render 方法的返回结果一致则返回 true，
  否则返回 false
  */
  if (prevProps.topic !== nextProps.topic) {
    return false;
  }

  // 从这个选择题组件的逻辑上说，题目，选项都是一样的，
  // 会引起更动的唯一触发点，就是学生对A,B,C,D做出了选择。也就是currentAnswer变了。
  if (prevProps.currentAnswer !== nextProps.currentAnswer) {
    // 有变化，要重新渲染
    return false;
  }

  // 没有上述变化，不重新渲染
  return true;
};

// memo是高阶组件，用于性能优化，详见 areEqual函数
export default React.memo(Question, areEqual);

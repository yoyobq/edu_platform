import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import React from 'react';
import styles from '../index.less';

interface resBdProps {
  isCorrect?: boolean;
  realAnswer: string;
}

const ResultBoard: React.FC<resBdProps> = ({ isCorrect, realAnswer }) => {
  if (isCorrect === undefined) {
    return <span />;
  }

  return isCorrect ? (
    <span className={styles[`result-correct`]}>
      {/* {realAnswer} */}
      <CheckOutlined />
    </span>
  ) : (
    <span className={styles[`result-wrong`]}>
      <CloseOutlined /> {realAnswer}
    </span>
  );
};

export default ResultBoard;

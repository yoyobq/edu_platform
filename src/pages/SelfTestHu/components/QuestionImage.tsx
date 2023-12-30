import { Image } from 'antd';
import React from 'react';
// import styles from '../index.less';

interface QuestionImageProps {
  picPath?: string;
}

const QuestionImage: React.FC<QuestionImageProps> = ({ picPath }) => {
  if (picPath) {
    return <Image width={400} src={picPath} />;
  }

  return <></>;
};

export default QuestionImage;

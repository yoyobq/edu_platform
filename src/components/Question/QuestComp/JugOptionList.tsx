import { Radio } from 'antd';
// import { RadioChangeEvent } from 'antd/lib/radio';
import React from 'react';
import styles from '../index.less';

interface OptionListProps {
  No: number;
  optList: Array<string>;
  // realAnswer: string;
  currentAnswer?: string;
  // onChange 函数期望接受一个事件对象和两个字符串参数
  onChange: (value: string, No: number, additionalParam: string) => void;
}

// 利用React List的知识，将option数组重新组合，变成页面上的ABCD选项列表
const OptionList: React.FC<OptionListProps> = ({ No, onChange, currentAnswer }) => {
  return (
    <Radio.Group
      onChange={(event) => onChange(event.target.value, No, 'jug')}
      defaultValue={currentAnswer}
      className={styles[`qu-option`]}
      value={currentAnswer}
    >
      <Radio value={'1'} className={styles[`option-line`]}>
        正确
      </Radio>
      <Radio value={'0'} className={styles[`option-line`]}>
        错误
      </Radio>
    </Radio.Group>
  );
};

export default OptionList;

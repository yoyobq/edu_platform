import { Radio } from 'antd';
import { RadioProps } from 'antd/lib/radio';
import React from 'react';
import styles from '../index.less';

interface OptionProps extends RadioProps {
  tag: string;
  optionContents: string;
}

interface SglOptionListProps {
  No: number;
  optList: Array<string>;
  // realAnswer: string;
  currentAnswer?: string;
  // onChange 函数期望接受一个事件对象和两个字符串参数
  onChange: (value: string, No: number, additionalParam: string) => void;
  orderedTag: Array<string>;
}

// 选项组里的一条
const Option: React.FC<OptionProps> = ({ tag, value, optionContents }) => {
  return (
    <div>
      <Radio value={value} className={styles[`option-line`]}>
        {tag}、{optionContents}
      </Radio>
    </div>
  );
};

// 利用React List的知识，将option数组重新组合，变成页面上的ABCD选项列表
const SglOptionList: React.FC<SglOptionListProps> = ({
  No,
  onChange,
  optList,
  currentAnswer,
  orderedTag,
}) => {
  // 不打乱选项顺序情况下

  const listItems = optList.map((item, index) => (
    <Option
      key={'sin' + No + index}
      // A 的 ascii 码是65 转换，
      tag={String.fromCharCode(65 + index)}
      optionContents={item}
      value={orderedTag[index]}
      checked={false}
    />
  ));

  return (
    <Radio.Group
      onChange={(event) => onChange(event.target.value, No, 'sgl')}
      defaultValue={currentAnswer}
      className={styles[`qu-option`]}
      value={currentAnswer}
    >
      {listItems}
    </Radio.Group>
  );
};

export default SglOptionList;

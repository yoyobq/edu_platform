import { Checkbox } from 'antd';
import { CheckboxProps } from 'antd/lib/checkbox';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import React from 'react';
import styles from '../index.less';

interface OptionProps extends CheckboxProps {
  tag: string;
  optionContents: string;
}

interface OptionListProps {
  No: number;
  optList: Array<string>;
  // realAnswer: string;
  currentAnswer?: string;
  onChange: (event: CheckboxValueType[], No: number, additionalParam: string) => void;
  // onChange: (value: string, No: number, additionalParam: string) => void;
  orderedTag: Array<string>;
}

// 选项组里的一条
const Option: React.FC<OptionProps> = ({ tag, value, optionContents }) => {
  return (
    <div>
      <Checkbox value={value} className={styles[`option-line`]}>
        {tag}、{optionContents}
      </Checkbox>
    </div>
  );
};

// 利用React List的知识，将option数组重新组合，变成页面上的ABCD选项列表
const OptionList: React.FC<OptionListProps> = ({
  No,
  onChange,
  optList,
  currentAnswer,
  orderedTag,
}) => {
  // 不打乱选项顺序情况下
  const listItems = optList.map((item, index) => (
    <Option
      key={'mul' + No + index}
      // A 的 ascii 码是65 转换，
      tag={String.fromCharCode(65 + index)}
      optionContents={item}
      value={orderedTag[index]}
      checked={false}
    />
  ));

  let answerArr: string[] | undefined = [];
  // 由于currentAnswer在state中是以字符串形式存在的，
  // 而在做题过程中 value 是数组，所以必须进行转换
  // 此处的转换是保证刷新页面时，默认选项能够清空
  if (!Array.isArray(currentAnswer)) {
    answerArr = currentAnswer?.split('');
  } else {
    answerArr = currentAnswer;
  }

  return (
    <Checkbox.Group
      onChange={(event) => onChange(event, No, 'mul')}
      defaultValue={answerArr}
      className={styles[`qu-option`]}
      value={answerArr}
    >
      {listItems}
    </Checkbox.Group>
  );
};

export default OptionList;

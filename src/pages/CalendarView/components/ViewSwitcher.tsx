// @/pages/CalendarView/components/ViewSwitcher.tsx
import { Radio } from 'antd';
import React from 'react';
import styles from './ViewSwitcher.less';

type ViewSwitcherProps = {
  onViewChange: (view: 'day' | 'week' | 'semester') => void; // 只保留 day、week、semester
};

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ onViewChange }) => {
  return (
    <div className={styles.viewSwitcher}>
      <Radio.Group
        defaultValue="day"
        buttonStyle="solid"
        onChange={(e) => onViewChange(e.target.value)}
        className={styles.radioGroup}
      >
        <Radio.Button value="day" className={styles.radioButton}>
          日
        </Radio.Button>
        <Radio.Button value="week" className={styles.radioButton}>
          周
        </Radio.Button>
        <Radio.Button value="semester" className={styles.radioButton}>
          学期
        </Radio.Button>
      </Radio.Group>
    </div>
  );
};

export default ViewSwitcher;

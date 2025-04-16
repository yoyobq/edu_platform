import { Tabs } from 'antd';
import React, { useCallback, useMemo } from 'react';

interface TeacherTabsProps {
  onTabChange: (activeKey: string) => void;
  defaultActiveKey?: string;
}

const TeacherTabs: React.FC<TeacherTabsProps> = React.memo(
  ({ onTabChange, defaultActiveKey = 'all' }) => {
    const handleTabChange = useCallback(
      (activeKey: string) => {
        onTabChange(activeKey);
      },
      [onTabChange],
    );

    const tabItems = useMemo(
      () => [
        { key: 'all', label: '全部教师' },
        { key: 'fullTime', label: '专任教师' },
        { key: 'admin', label: '行政兼课' },
        { key: 'publicWelfare', label: '公益性岗位' },
      ],
      [],
    );

    return (
      <Tabs defaultActiveKey={defaultActiveKey} onChange={handleTabChange}>
        {tabItems.map((item) => (
          <Tabs.TabPane key={item.key} tab={item.label} />
        ))}
      </Tabs>
    );
  },
);

export default TeacherTabs;

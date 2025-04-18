import { Tabs } from 'antd';
import React, { useCallback } from 'react';

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

    // 在 TeacherTabs 组件中添加外聘教师标签
    const tabItems = [
      {
        key: 'all',
        label: '全部教师',
      },
      {
        key: 'fullTime',
        label: '专任教师',
      },
      {
        key: 'admin',
        label: '行政兼课',
      },
      {
        key: 'publicWelfare',
        label: '公益性岗位',
      },
      {
        key: 'specific',
        label: '外聘教师',
      },
    ];

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

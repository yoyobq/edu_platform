// @/pages/CalendarView/components/MultiDayView.tsx
import { Space } from 'antd';
import React, { useState } from 'react';
import DayView from './DayView';

type MultiDayViewProps = {
  view: 'day' | 'week' | 'semester';
};

// 生成模拟事件数据
const generateMockData = (days: number) => {
  return Array.from({ length: days }, (_, i) => ({
    date: `2025-03-${String(i + 1).padStart(2, '0')}`,
    events: [
      { time: '08:00 - 09:30', title: '计算机基础', location: 'A101', type: '课程' },
      { time: '10:00 - 11:30', title: '教学会议', location: 'B201', type: '会议' },
    ],
  }));
};

const MultiDayView: React.FC<MultiDayViewProps> = ({ view }) => {
  const [data] = useState(generateMockData(120)); // 生成 120 天的模拟数据

  // 视图模式决定显示的天数和布局
  const daysToShow = view === 'day' ? 1 : view === 'week' ? 7 : 120;
  const compact = view === 'semester'; // 学期视图使用紧凑模式
  const layout = view === 'week' ? 'horizontal' : view === 'semester' ? 'grid' : 'column'; // 关键修正

  // 截取所需的日期数据
  const filteredData = data.slice(0, daysToShow);

  return (
    <Space
      direction={layout === 'column' ? 'vertical' : 'horizontal'}
      wrap={layout === 'grid'} // 让学期视图自动换行，week 仍然是横向排列
      style={{
        display: layout === 'grid' ? 'grid' : 'flex',
        gap: '10px',
        gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fill, minmax(250px, 1fr))' : 'none',
      }}
    >
      {filteredData.map((dayData, index) => (
        <DayView
          key={index}
          date={dayData.date}
          events={dayData.events}
          compact={compact}
          viewMode={view}
        />
      ))}
    </Space>
  );
};

export default MultiDayView;

// @/pages/CalendarView/components/EventView.tsx
import { Space, Tag } from 'antd';
import React from 'react';

type Event = {
  time: string;
  title: string;
  location: string;
  type: string;
};

type EventViewProps = {
  events: Event[];
  compact?: boolean; // 是否是紧凑模式（学期视图适用）
};

const EventView: React.FC<EventViewProps> = ({ events, compact = false }) => {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {events.map((event, index) => (
        <div key={index}>
          {!compact && (
            <Space>
              <Tag color="blue">{event.type}</Tag>
              <span>{event.time}</span>
            </Space>
          )}
          <h4>{event.title}</h4>
          {!compact && <span>地点：{event.location}</span>}
        </div>
      ))}
    </Space>
  );
};

export default EventView;

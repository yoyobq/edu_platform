import { Card, List } from 'antd';
import React from 'react';

interface ScheduleEvent {
  time: string;
  course: string;
  location: string;
}

const mockEvents: ScheduleEvent[] = [
  { time: '08:00-09:30', course: '计算机基础', location: 'A101' },
  { time: '10:00-11:30', course: '高等数学', location: 'C302' },
];

const ScheduleList: React.FC<{ date: string }> = ({ date }) => {
  console.log(date);
  return (
    <Card title="当日课表">
      <List
        dataSource={mockEvents}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta title={item.course} description={item.time} />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ScheduleList;

// DayView.tsx
import { Button, Card, Col, Row } from 'antd';
import React from 'react';
import BasicInfo from './BasicInfo';
import ScheduleList from './ScheduleList';
import TodoList from './TodoList';

interface DayViewProps {
  date: string;
  onBackToSemester?: () => void;
}

const DayView: React.FC<DayViewProps> = ({ date, onBackToSemester }) => {
  return (
    <>
      <Button onClick={onBackToSemester} style={{ marginBottom: 16 }}>
        返回学期视图
      </Button>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <BasicInfo date={date} />
        </Col>
        <Col span={12}>
          <ScheduleList date={date} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <TodoList date={date} />
        </Col>
        <Col span={12}>
          <Card>预留模块</Card>
        </Col>
      </Row>
    </>
  );
};

export default DayView;

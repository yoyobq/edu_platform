// src/pages/CalendarView/components/DayView/DayView.tsx

import { Button, Card, Col, Row } from 'antd';
import React from 'react';
import BasicInfo from './BasicInfo';
import ScheduleList from './ScheduleList';
import TodoList from './TodoList';

interface DayViewProps {
  date: string;
  staffId?: number;
  onBackToSemester?: () => void;
}

const DayView: React.FC<DayViewProps> = ({ date, onBackToSemester }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [loading, setLoading] = useState<boolean>(true);

  return (
    <Card
      title={
        <Button onClick={onBackToSemester} style={{ marginBottom: 16 }}>
          返回学期视图
        </Button>
      }
      // loading={loading}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <BasicInfo date={date} />
        </Col>
        <Col xs={24} md={12}>
          <ScheduleList date={date} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <TodoList date={date} />
        </Col>
        <Col xs={24} md={12}>
          <Card>预留模块</Card>
        </Col>
      </Row>
    </Card>
  );
};

export default DayView;

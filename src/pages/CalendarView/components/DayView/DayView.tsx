// src/pages/CalendarView/components/DayView/DayView.tsx

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Col, FloatButton, Row } from 'antd';
import React from 'react';
import BasicInfo from './BasicInfo';
import styles from './DayView.less';
import ScheduleList from './ScheduleList';
// import TodoList from './TodoList';

interface DayViewProps {
  date: string;
  staffId?: number;
  onBackToSemester?: () => void;
}

const DayView: React.FC<DayViewProps> = ({ date, onBackToSemester }) => {
  return (
    <>
      <div className={styles.backNavigation}>
        <Button icon={<ArrowLeftOutlined />} onClick={onBackToSemester} type="link">
          返回学期视图
        </Button>
      </div>

      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <BasicInfo date={date} />
          </Col>
          <Col xs={24} md={12}>
            <ScheduleList date={date} />
          </Col>
        </Row>

        {/* <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <TodoList date={date} />
          </Col>
          <Col xs={24} md={12}>
            <Card>预留模块</Card>
          </Col>
        </Row> */}
      </Card>

      <FloatButton
        icon={<ArrowLeftOutlined />}
        type="primary"
        onClick={onBackToSemester}
        tooltip="返回学期视图"
        className={styles.floatBackButton}
        description="Back"
      />
    </>
  );
};

export default DayView;

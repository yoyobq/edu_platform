import { getDailySchedule } from '@/services/plan/courseScheduleManager';
import { useModel } from '@umijs/max';
import { Card, List, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './DayView.less';

interface ScheduleListProps {
  date: string;
}

interface FlatCourseSchedule {
  scheduleId: number;
  courseName: string;
  staffId: number;
  staffName: string;
  teachingClassName: string;
  classroomName?: string;
  semesterId: number;
  courseCategory: string;
  credits?: number;
  weekCount?: number;
  weeklyHours?: number;
  coefficient: string;
  weekNumberString?: string;
  slotId: number;
  dayOfWeek: number;
  periodStart: number;
  periodEnd: number;
  weekType: string;
}

const ScheduleList: React.FC<ScheduleListProps> = ({ date }) => {
  const { initialState } = useModel('@@initialState');
  const staffId = initialState?.currentUser?.id;
  const [loading, setLoading] = useState<boolean>(true);
  const [dailySchedule, setDailySchedule] = useState<FlatCourseSchedule[]>([]);

  console.log('staffId:', staffId);
  console.log('date:', date);
  useEffect(() => {
    setLoading(true);
    if (!staffId) {
      console.error('未获取到有效用户ID');
      return;
    }
    getDailySchedule(staffId, date)
      .then((res) => {
        setDailySchedule(res.sort((a, b) => a.periodStart - b.periodStart));
        setDailySchedule(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [date, staffId]);

  return (
    <Card
      title={`${date} 课表`}
      loading={loading}
      className={styles.scheduleListCard}
      bordered={false}
    >
      <List
        dataSource={dailySchedule}
        locale={{ emptyText: '今日无课程安排' }}
        renderItem={(item) => (
          <List.Item>
            <div className="course-header">
              <Tag color="blue" className="period-tag">
                {`${item.periodStart}-${item.periodEnd}节`}
              </Tag>
              <div className="course-title">
                {item.courseName ? item.courseName.substring(8) : '未命名课程'}
              </div>
            </div>
            <div className="course-info">
              <span className="class-name">班级: {item.teachingClassName}</span>
              <span>教室: {item.classroomName || '未安排'}</span>
            </div>
            <div className="course-type-watermark">{item.courseCategory}</div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ScheduleList;

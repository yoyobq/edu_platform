import type { CancelledDate, StaffCancelledCourses } from '@/services/plan/types';
import { Col, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';

const weekMap = ['一', '二', '三', '四', '五', '六', '日'];

interface CancelledDatesInfoProps {
  cancelledCourses: StaffCancelledCourses[];
  weekRange: [number, number];
}

const CancelledDatesInfo: React.FC<CancelledDatesInfoProps> = ({ cancelledCourses, weekRange }) => {
  // 用 useMemo 收集和排序日期信息，避免每次渲染都重复计算
  const sortedDates = useMemo(() => {
    if (cancelledCourses.length === 0) return [];

    const dateInfoMap = new Map<
      string,
      {
        date: string;
        weekNumber: number | string;
        weekOfDay: number;
        note?: string;
      }
    >();

    cancelledCourses.forEach((staff) => {
      const datesList = staff.cancelledCourses || staff.cancelledDates;
      if (!datesList) {
        console.error('找不到有效的扣课日期数据:', staff);
        return;
      }
      datesList
        .filter((date: CancelledDate) => {
          const weekNum = Number(date.weekNumber);
          return weekNum >= weekRange[0] && weekNum <= weekRange[1];
        })
        .forEach((date: CancelledDate) => {
          dateInfoMap.set(date.date, {
            date: date.date,
            weekNumber: date.weekNumber,
            weekOfDay: date.weekOfDay,
            note: date.note,
          });
        });
    });

    return Array.from(dateInfoMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [cancelledCourses, weekRange]);

  if (sortedDates.length === 0) {
    return null;
  }

  return (
    <Col span={24} className="cancelled-dates-container">
      <div>
        <Typography.Text strong>选定周数内存在扣课记录：</Typography.Text>
        <div className="dates-list">
          {sortedDates.map((dateInfo) => {
            const formattedDate = dayjs(dateInfo.date).format('M月D日');
            if (dateInfo.note) {
              return (
                <Typography.Text key={dateInfo.date} className="date-item date-with-note">
                  第{dateInfo.weekNumber}周，{formattedDate}（周{weekMap[dateInfo.weekOfDay - 1]}）
                  <span className="date-note-text">：{dateInfo.note}</span>
                </Typography.Text>
              );
            }
            return (
              <Typography.Text key={dateInfo.date} className="date-item">
                第{dateInfo.weekNumber}周，{formattedDate}（周{weekMap[dateInfo.weekOfDay - 1]}）
              </Typography.Text>
            );
          })}
        </div>
      </div>
    </Col>
  );
};

export default CancelledDatesInfo;

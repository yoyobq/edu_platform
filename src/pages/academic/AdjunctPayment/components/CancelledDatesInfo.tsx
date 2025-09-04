import type { CancelledDate, StaffCancelledCourses } from '@/services/plan/types';
import { Col, Tag, Tooltip, Typography } from 'antd';
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
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <Typography.Text strong style={{ marginRight: 8 }}>
          增（蓝）减（橙）课日期记录:
        </Typography.Text>
        <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '8px' }}>
          {sortedDates.map((dateInfo) => {
            const formattedDate = dayjs(dateInfo.date).format('MM/DD');
            const weekDay = `周${weekMap[dateInfo.weekOfDay - 1]}`;
            const tooltipTitle = `第${dateInfo.weekNumber}周，${weekDay}，${dayjs(dateInfo.date).format('YYYY-MM-DD')}${
              dateInfo.note ? `，${dateInfo.note}` : ''
            }`;

            return (
              <Tooltip key={dateInfo.date} title={tooltipTitle}>
                <Tag className="date-tag" color={dateInfo.note ? 'orange' : 'blue'}>
                  {formattedDate}（{weekDay}）
                </Tag>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </Col>
  );
};

export default CancelledDatesInfo;

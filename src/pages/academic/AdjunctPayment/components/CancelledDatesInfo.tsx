import React from 'react';
import { Col, Typography } from 'antd';
import dayjs from 'dayjs';
import type { CancelledDate, StaffCancelledCourses } from '@/services/plan/types';

interface CancelledDatesInfoProps {
  cancelledCourses: StaffCancelledCourses[];
  weekRange: [number, number];
}

const CancelledDatesInfo: React.FC<CancelledDatesInfoProps> = React.memo(
  ({ cancelledCourses, weekRange }) => {
    if (cancelledCourses.length === 0) {
      return null;
    }

    // 收集所有符合条件的日期信息并去重
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
      // 检查数据结构，优先使用 cancelledCourses
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
          // 将所有日期信息收集到一个Map中，包括带note的日期
          dateInfoMap.set(date.date, {
            date: date.date,
            weekNumber: date.weekNumber,
            weekOfDay: date.weekOfDay,
            note: date.note, // 如果有note，保存note信息
          });
        });
    });

    // 按日期排序显示所有日期信息
    const sortedDates = Array.from(dateInfoMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    if (sortedDates.length === 0) {
      return null;
    }

    // 渲染日期信息
    const weekMap = ['一', '二', '三', '四', '五', '六', '日'];

    return (
      <Col span={24} className="cancelled-dates-container">
        <div>
          <Typography.Text strong>选定周数内存在扣课记录：</Typography.Text>
          <div className="dates-list">
            {sortedDates.map((dateInfo) => {
              const formattedDate = dayjs(dateInfo.date).format('M月D日');

              // 如果有note，显示日期和note
              if (dateInfo.note) {
                return (
                  <Typography.Text key={dateInfo.date} className="date-item date-with-note">
                    第{dateInfo.weekNumber}周，{formattedDate}（周{weekMap[dateInfo.weekOfDay - 1]}
                    ）<span className="date-note-text">：{dateInfo.note}</span>
                  </Typography.Text>
                );
              }

              // 没有note，只显示日期
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
  },
);

export default CancelledDatesInfo;

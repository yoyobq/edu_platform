import { getStaffCancelledCourses } from '@/services/plan/courseScheduleManager';
import type { StaffCancelledCourses } from '@/services/plan/types';
import { Card, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import styles from '../style.less';

// StaffInfo 接口定义
interface StaffInfo {
  id: number;
  jobId: number;
  name: string;
  age: number;
  departmentId: number;
}

interface DateInfo {
  date: string;
  formattedDate: string;
  weekNumber: number | string;
  weekDay: number;
}

interface CancelledCoursesTableProps {
  semesterId: number | null;
  staffInfo: StaffInfo;
  scheduleData?: any[]; // 可选属性，但在新接口下不再需要
}

interface DeductionItem {
  scheduleId: number;
  courseName: string;
  className: string;
  deductions: Record<string, number | null>;
  totalDeduction: number;
}

const CancelledCoursesTable: React.FC<CancelledCoursesTableProps> = ({ semesterId, staffInfo }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [deductionData, setDeductionData] = useState<DeductionItem[]>([]);
  const [totalDeduction, setTotalDeduction] = useState<number>(0);
  const [dates, setDates] = useState<DateInfo[]>([]);

  // 处理班级名称，去掉逗号并添加HTML换行标签
  const formatClassName = (className: string): string => {
    if (!className) return '';
    return className.replace(/,/g, '<br>');
  };

  // 将数字星期转换为中文
  const getWeekDayText = (weekDay: number): string => {
    const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return weekDays[weekDay - 1] || '';
  };

  // 格式化日期
  const formatDate = (dateStr: string): string => {
    return dayjs(dateStr).format('M月D日');
  };

  // 处理扣课时数据
  const processDeductionData = (
    staffCancelledCourses: StaffCancelledCourses,
  ): {
    items: DeductionItem[];
    dates: DateInfo[];
    total: number;
  } => {
    // 提取所有日期
    const allDatesSet = new Set<string>();
    const dateInfoMap = new Map<string, { weekNumber: number | string; weekDay: number }>();

    staffCancelledCourses.cancelledDates.forEach((date) => {
      allDatesSet.add(date.date);
      dateInfoMap.set(date.date, {
        weekNumber: date.weekNumber,
        weekDay: date.weekOfDay,
      });
    });

    // 按日期排序
    const sortedDates = Array.from(allDatesSet).sort();
    const allDates = sortedDates.map((date) => ({
      date,
      formattedDate: formatDate(date),
      weekNumber: dateInfoMap.get(date)?.weekNumber || '',
      weekDay: dateInfoMap.get(date)?.weekDay || 1,
    }));

    // 创建课程扣课时数映射
    const courseDeductionMap = new Map<number, DeductionItem>();

    // 使用 flatSchedules 获取所有课程信息
    const allCourses = staffCancelledCourses.flatSchedules || [];

    // 先处理有课表信息的课程
    allCourses.forEach((course) => {
      const scheduleId = course.scheduleId;

      const courseItem: DeductionItem = {
        scheduleId,
        courseName: course.courseName.includes('-')
          ? course.courseName.split('-')[1].trim()
          : course.courseName,
        className: course.teachingClassName || '',
        deductions: {},
        totalDeduction: 0,
      };

      // 初始化所有日期的扣课数据为null
      allDates.forEach((dateInfo) => {
        courseItem.deductions[dateInfo.date] = null;
      });

      courseDeductionMap.set(scheduleId, courseItem);
    });

    // 填充扣课记录
    let total = 0;
    staffCancelledCourses.cancelledDates.forEach((date) => {
      date.courses.forEach((course) => {
        const scheduleId = course.scheduleId;

        // 如果课程不在映射中，创建新条目
        if (!courseDeductionMap.has(scheduleId)) {
          const courseItem: DeductionItem = {
            scheduleId,
            courseName: course.courseName.includes('-')
              ? course.courseName.split('-')[1].trim()
              : course.courseName,
            className: '未知班级',
            deductions: {},
            totalDeduction: 0,
          };

          // 初始化所有日期的扣课数据为null
          allDates.forEach((dateInfo) => {
            courseItem.deductions[dateInfo.date] = null;
          });

          courseDeductionMap.set(scheduleId, courseItem);
        }

        // 更新扣课时数
        const courseItem = courseDeductionMap.get(scheduleId)!;
        const cancelledHours = course.cancelledHours || 0;

        // 更新该日期的扣课数据
        courseItem.deductions[date.date] = -cancelledHours;
        // 更新总扣课时数
        courseItem.totalDeduction -= cancelledHours;

        total += cancelledHours;
      });
    });

    // 转换为数组并排序
    const items = Array.from(courseDeductionMap.values()).sort((a, b) => {
      // 按班级名称排序
      return a.className.localeCompare(b.className);
    });

    return {
      items,
      dates: allDates,
      total: -total,
    };
  };

  useEffect(() => {
    if (!semesterId || !staffInfo) return;

    setLoading(true);

    getStaffCancelledCourses({
      staffId: staffInfo.id,
      semesterId: semesterId,
    })
      .then((res) => {
        const processedData = processDeductionData(res!);
        setDeductionData(processedData.items);
        setDates(processedData.dates);
        setTotalDeduction(processedData.total);
      })
      .catch((error) => console.error('获取扣课时数据失败:', error))
      .finally(() => setLoading(false));
  }, [semesterId, staffInfo]);

  return (
    <Card
      title={
        <Typography.Title level={5} style={{ margin: 0 }}>
          节假日扣课时统计表
          <span className={styles.workloadNoteText}>(扣课课时已乘以课时系数)</span>
        </Typography.Title>
      }
      loading={loading}
      style={{ marginTop: 16 }}
    >
      <div className={styles.workloadTable}>
        <table>
          <colgroup>
            <col style={{ width: '6%' }} /> {/* 工号 */}
            <col style={{ width: '8%' }} /> {/* 姓名 */}
            <col style={{ width: '12%' }} /> {/* 任课班级 */}
            <col style={{ width: '20%' }} /> {/* 课程 */}
            {dates.map((date, index) => (
              <col key={index} style={{ width: `${54 / dates.length}%` }} />
            ))}
            <col style={{ width: '10%' }} /> {/* 小计 */}
          </colgroup>
          <thead>
            <tr>
              <th>工号</th>
              <th>姓名</th>
              <th>任课班级</th>
              <th>课程</th>
              {dates.map((date, index) => (
                <th key={index}>
                  {date.formattedDate}
                  <br />第{date.weekNumber}周<br />
                  {getWeekDayText(date.weekDay)}
                </th>
              ))}
              <th>小计</th>
            </tr>
          </thead>
          <tbody>
            {deductionData.map((item, index) => (
              <tr key={index} className={index % 2 === 1 ? styles.oddRow : ''}>
                {index === 0 ? (
                  <td rowSpan={deductionData.length}>{staffInfo?.jobId || ''}</td>
                ) : null}
                {index === 0 ? (
                  <td rowSpan={deductionData.length}>{staffInfo?.name || ''}</td>
                ) : null}
                <td
                  className={styles.alignCenter}
                  dangerouslySetInnerHTML={{ __html: formatClassName(item.className) || '' }}
                ></td>
                <td className={styles.alignLeft}>{item.courseName}</td>
                {dates.map((date, dateIndex) => (
                  <td key={dateIndex} className={styles.alignCenter}>
                    {item.deductions[date.date] !== null
                      ? Number.isInteger(item.deductions[date.date])
                        ? item.deductions[date.date]
                        : item.deductions[date.date]!.toFixed(1)
                      : ''}
                  </td>
                ))}
                <td className={styles.alignCenter}>
                  {Number.isInteger(item.totalDeduction)
                    ? item.totalDeduction
                    : item.totalDeduction.toFixed(1)}
                </td>
              </tr>
            ))}
            {deductionData.length === 0 && (
              <tr>
                <td colSpan={5 + dates.length} className={styles.noData}>
                  暂无数据
                </td>
              </tr>
            )}
            {deductionData.length > 0 && (
              <tr>
                <td colSpan={4 + dates.length} className={styles.alignRight}>
                  <strong>合计</strong>
                </td>
                <td className={styles.alignCenter}>
                  <strong>
                    {Number.isInteger(totalDeduction) ? totalDeduction : totalDeduction.toFixed(2)}
                  </strong>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default CancelledCoursesTable;

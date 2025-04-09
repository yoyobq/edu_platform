import { getCancelledCourses } from '@/services/plan/courseScheduleManager';
import type { CancelledTeachingDate, FlatCourseSchedule } from '@/services/plan/types';
import { Card, Typography } from 'antd';
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
  weekNumber: number;
  weekDay: number;
}

interface HolidayDeductionTableProps {
  semesterId: number | null;
  staffInfo: StaffInfo;
  scheduleData?: FlatCourseSchedule[]; // 添加课表数据作为可选属性
}

interface DeductionItem {
  deductions: Record<string, number | null>;
  totalDeduction: number;
  className: string;
  courseName: string;
}

const HolidayDeductionTable: React.FC<HolidayDeductionTableProps> = ({
  semesterId,
  staffInfo,
  scheduleData = [], // 设置默认值为空数组
}) => {
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
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 处理节假日扣课时数据
  const processDeductionData = (
    cancelledData: CancelledTeachingDate[],
  ): {
    items: DeductionItem[];
    dates: DateInfo[];
    total: number;
  } => {
    // 提取所有日期
    const allDates = cancelledData.map((day) => ({
      date: day.date,
      formattedDate: formatDate(day.date),
      weekNumber: day.weekNumber,
      weekDay: day.weekOfDay,
    }));

    // 按课程和班级分组，使用复合键
    const courseMap = new Map<string, DeductionItem>();
    let total = 0;

    // 首先从课表数据中获取所有课程
    if (scheduleData && scheduleData.length > 0) {
      // 按课程名称和班级分组
      scheduleData.forEach((schedule) => {
        if (!schedule.teachingClassName) return;

        // 使用课程名称+班级名作为键
        const key = `${schedule.courseName}-${schedule.teachingClassName}`;

        if (!courseMap.has(key)) {
          // 创建新课程条目
          const courseData: DeductionItem = {
            courseName: schedule.courseName.substring(8), // 提取课程名称，去掉前8个字符的课程代码
            className: schedule.teachingClassName, // 单个班级
            deductions: {},
            totalDeduction: 0,
          };

          // 初始化所有日期的扣课数据为null
          allDates.forEach((dateInfo) => {
            courseData.deductions[dateInfo.date] = null;
          });

          courseMap.set(key, courseData);
        }
      });
    }

    // 然后从取消的课程数据中初始化课程
    cancelledData.forEach((day) => {
      if (!day.courses || day.courses.length === 0) return;

      day.courses.forEach((course: { courseName: string; scheduleId?: number }) => {
        // 尝试从scheduleData中找到对应的班级信息
        let className = '';
        if (course.scheduleId && scheduleData) {
          const matchedSchedule = scheduleData.find((s) => s.scheduleId === course.scheduleId);
          if (matchedSchedule) {
            className = matchedSchedule.teachingClassName || '';
          }
        }

        // 使用课程名称+班级名作为键
        const key = `${course.courseName}-${className}`;

        if (!courseMap.has(key)) {
          // 创建新课程条目
          const courseData: DeductionItem = {
            courseName: course.courseName.substring(8), // 提取课程名称，去掉前8个字符的课程代码
            className: className, // 班级信息
            deductions: {},
            totalDeduction: 0,
          };

          // 初始化所有日期的扣课数据为null
          allDates.forEach((dateInfo) => {
            courseData.deductions[dateInfo.date] = null;
          });

          courseMap.set(key, courseData);
        }
      });
    });

    // 填充扣课数据
    cancelledData.forEach((day) => {
      if (!day.courses || day.courses.length === 0) return;

      // 创建一个临时Map来累计同一天同一门课程的扣课时数
      const dailyDeductionMap = new Map<string, number>();

      day.courses.forEach(
        (course: {
          courseName: any;
          periodEnd: number;
          periodStart: number;
          coefficient: any;
          scheduleId?: number;
        }) => {
          // 尝试从scheduleData中找到对应的班级信息
          let className = '';
          if (course.scheduleId && scheduleData) {
            const matchedSchedule = scheduleData.find((s) => s.scheduleId === course.scheduleId);
            if (matchedSchedule) {
              className = matchedSchedule.teachingClassName || '';
            }
          }

          // 使用课程名称+班级名作为键
          const key = `${course.courseName}-${className}`;

          // 计算扣课时数
          const periodsCount = course.periodEnd - course.periodStart + 1;
          const deductionHours = periodsCount * (course.coefficient || 1);

          // 累计同一天同一门课程的扣课时数
          if (dailyDeductionMap.has(key)) {
            dailyDeductionMap.set(key, dailyDeductionMap.get(key)! + deductionHours);
          } else {
            dailyDeductionMap.set(key, deductionHours);
          }

          total += deductionHours;
        },
      );

      // 将累计后的扣课时数更新到课程数据中
      dailyDeductionMap.forEach((deductionHours, key) => {
        const courseData = courseMap.get(key);
        if (courseData) {
          // 更新该日期的扣课数据
          courseData.deductions[day.date] = -deductionHours;
          // 更新总扣课时数
          courseData.totalDeduction -= deductionHours;
        }
      });
    });

    return {
      items: Array.from(courseMap.values()),
      dates: allDates,
      total: -total,
    };
  };

  useEffect(() => {
    if (!semesterId || !staffInfo) return;

    setLoading(true);

    getCancelledCourses({
      staffId: staffInfo.id,
      semesterId: semesterId!,
    })
      .then((res) => {
        const processedData = processDeductionData(res);
        setDeductionData(processedData.items);
        // 保存日期信息
        setDates(processedData.dates);
        setTotalDeduction(processedData.total);
      })
      .catch((error) => console.error('获取节假日扣课时数据失败:', error))
      .finally(() => setLoading(false));
  }, [semesterId, staffInfo, scheduleData]); // 添加 scheduleData 作为依赖项

  // 修改表格渲染部分
  return (
    <Card
      title={
        <Typography.Title level={4} style={{ margin: 0 }}>
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
                    {item.deductions[date.date] !== null ? item.deductions[date.date] : ''}
                  </td>
                ))}
                <td className={styles.alignCenter}>{item.totalDeduction}</td>
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
                  <strong>{totalDeduction}</strong>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default HolidayDeductionTable;

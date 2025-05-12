import { getFullScheduleByStaff } from '@/services/plan/courseScheduleManager';
import type { FlatCourseSchedule, Semester } from '@/services/plan/types';
import { Card, message, Switch, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './style.less';

interface CourseTableProps {
  semesterId: number | null;
  semester: Semester | null;
  staffId?: number | null;
  jobId?: number | null | undefined;
  scheduleData?: FlatCourseSchedule[]; // 添加课表数据作为可选属性
}

const CourseTable: React.FC<CourseTableProps> = ({
  semesterId,
  semester,
  staffId,
  jobId,
  scheduleData = [], // 设置默认值为空数组
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [courseTable, setCourseTable] = useState<any[][]>([]);
  // 删除未使用的状态变量
  // const [internalScheduleData, setInternalScheduleData] = useState<FlatCourseSchedule[]>([]);
  // 在组件顶部添加状态初始化逻辑
  const [splitMode, setSplitMode] = useState<boolean>(() => {
    // 从localStorage读取用户之前的选择，如果没有则默认为true（不合并）
    const savedMode = localStorage.getItem('courseTableSplitMode');
    return savedMode === null ? true : savedMode === 'true';
  });

  // 解析周次字符串，生成实际的上课周次范围
  const parseWeekNumberString = (weekNumberString: string, weekCount: number): string => {
    if (!weekNumberString) return '';

    // 将字符串转换为数组
    const weekArray = weekNumberString.split(',').map((w) => w.trim());

    // 找出所有上课周的索引
    const teachingWeeks: number[] = [];
    for (let i = 0; i < weekArray.length; i++) {
      if (weekArray[i] === '1') {
        teachingWeeks.push(i + 1); // 周次从1开始
      }
    }

    // 验证实际上课周数与 weekCount 是否一致
    if (teachingWeeks.length !== weekCount) {
      message.warning(
        '部分课程登记上课周数 ${weekCount} 与实际上课周数 ${teachingWeeks.length} 不一致，请去校园网核对',
      );
    }

    // 查找连续的上课周次
    const ranges: string[] = [];
    let start: number | null = null;

    for (let i = 0; i < teachingWeeks.length; i++) {
      const week = teachingWeeks[i];

      if (start === null) {
        // 开始一个新的范围
        start = week;
      } else if (week !== teachingWeeks[i - 1] + 1) {
        // 不连续，结束上一个范围
        const end = teachingWeeks[i - 1];
        if (start === end) {
          ranges.push(`${start}`);
        } else {
          ranges.push(`${start}-${end}`);
        }
        start = week; // 开始新范围
      }
    }

    // 处理最后一个范围
    if (start !== null && teachingWeeks.length > 0) {
      const end = teachingWeeks[teachingWeeks.length - 1];
      if (start === end) {
        ranges.push(`${start}`);
      } else {
        ranges.push(`${start}-${end}`);
      }
    }

    return ranges.length > 0 ? `(${ranges.join(', ')})` : '';
  };

  // 处理课程数据，转换为表格格式
  const processCourseData = (courses: FlatCourseSchedule[]) => {
    // 初始化一个8行5列的二维数组（8个时间段，5个工作日）
    const table: any[][] = Array(8)
      .fill(null)
      .map(() => Array(5).fill(null));

    courses.forEach((course) => {
      const dayIndex = course.dayOfWeek - 1; // 转换为数组索引 (1-5 -> 0-4)
      const startPeriod = course.periodStart - 1; // 转换为数组索引
      const endPeriod = course.periodEnd - 1; // 转换为数组索引

      // 解析周次字符串，生成实际的上课周次范围
      const weekRangeText = parseWeekNumberString(course.weekNumberString!, course.weekCount!);

      // 课程信息格式化
      const courseInfo = {
        name: course.courseName.substring(8),
        className: course.teachingClassName,
        classroom: course.classroomName,
        weekRange: weekRangeText,
        rowSpan: endPeriod - startPeriod + 1, // 计算跨行数
        courseCategory: course.courseCategory, // 添加课程类型
      };

      // 将课程信息放入对应的单元格
      table[startPeriod][dayIndex] = courseInfo;

      // 对于跨行的课程，将后续单元格标记为已占用
      for (let i = startPeriod + 1; i <= endPeriod; i++) {
        table[i][dayIndex] = { ...courseInfo, isOccupied: true };
      }
    });

    return table;
  };

  // 渲染课程单元格
  const renderCourseCell = (course: any) => {
    if (!course) return null;

    // 在拆分模式下，即使是被占用的单元格也显示课程信息
    if (course.isOccupied && !splitMode) return null;

    // 根据课程类型确定水印样式类
    let courseTypeClass = '';
    if (course.courseCategory) {
      switch (course.courseCategory) {
        case 'INTEGRATED':
          courseTypeClass = styles.integratedCourse;
          break;
        case 'THEORY':
        case 'PRACTICE':
          courseTypeClass = styles.theoryPracticeCourse;
          break;
        default:
          courseTypeClass = styles.otherCourse;
          break;
      }
    }

    // 获取课程类型的中文名称
    const getCategoryText = (category: string) => {
      switch (category) {
        case 'THEORY':
          return '理论课';
        case 'PRACTICE':
          return '实践课';
        case 'INTEGRATED':
          return '一体化';
        case 'CLUB':
          return '社团课';
        case 'CLASS_MEETING':
          return '班会课';
        case 'OTHER':
          return '其他';
        default:
          return '';
      }
    };

    return (
      <div className={`${styles.courseCell} ${courseTypeClass}`}>
        <div className={styles.courseName}>{course.name}</div>
        <div className={styles.courseClass}>
          {course.className} {course.weekRange}
        </div>
        {course.classroom !== '未记录' && (
          <div className={styles.courseRoom}>{course.classroom}</div>
        )}
        {course.courseCategory && (
          <div className={styles.courseWatermark}>{getCategoryText(course.courseCategory)}</div>
        )}
      </div>
    );
  };

  // 获取课表数据
  useEffect(() => {
    if (!semesterId) return;

    // 重置状态，确保每次 staffId 变化时都会清除旧数据
    setLoading(true);

    // 如果传入了 scheduleData 且不为空数组，则直接使用
    if (scheduleData && scheduleData.length > 0) {
      try {
        setCourseTable(processCourseData(scheduleData));
      } catch (error) {
        console.error('处理课表数据失败:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 处理 staffId 和 jobId，确保类型正确
    // 如果 staffId 为 null 或 undefined，则转换为 undefined
    // 如果 jobId 为 null 或 undefined，则转换为 undefined
    const effectiveStaffId = staffId === null ? undefined : staffId;
    const effectiveJobId = jobId === null ? undefined : jobId;

    // 否则从后台获取数据
    getFullScheduleByStaff({
      staffId: effectiveStaffId,
      jobId: effectiveJobId,
      semesterId,
    })
      .then((res) => {
        setCourseTable(processCourseData(res));
      })
      .catch((error) => {
        console.error('获取课表数据失败:', error);
        message.error('获取课表数据失败，请稍后重试');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [semesterId, staffId, jobId, scheduleData]); // 添加 jobId 作为依赖项

  // 在组件内添加一个函数来检查特定时间段是否有课程
  const hasCourseInPeriod = (period: number) => {
    // 检查该时间段的所有天是否有课程
    return [0, 1, 2, 3, 4].some((day) => {
      const course = courseTable[period - 1]?.[day];
      return course && !course.isOccupied;
    });
  };

  return (
    <Card
      title={
        <Typography.Title level={5} style={{ margin: 0 }}>
          {semester?.name}课表
        </Typography.Title>
      }
      loading={loading}
      // 修改Switch的onChange处理函数
      extra={
        <>
          <span style={{ marginRight: 8 }}>合并连堂课</span>
          <Switch
            defaultChecked={false}
            checked={!splitMode}
            onChange={(checked) => {
              setSplitMode(!checked);
              // 将选择保存到localStorage
              localStorage.setItem('courseTableSplitMode', (!checked).toString());
            }}
          />
        </>
      }
    >
      <div className={styles.scheduleTable}>
        <table>
          <colgroup>
            <col style={{ width: '8%' }} />
            {/* 第一列 */}
            <col style={{ width: '18.4%' }} />
            {/* 周一 */}
            <col style={{ width: '18.4%' }} />
            {/* 周二 */}
            <col style={{ width: '18.4%' }} />
            {/* 周三 */}
            <col style={{ width: '18.4%' }} />
            {/* 周四 */}
            <col style={{ width: '18.4%' }} />
            {/* 周五 */}
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th>周一</th>
              <th>周二</th>
              <th>周三</th>
              <th>周四</th>
              <th>周五</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => {
              // 如果是7或8节课，且没有课程，则添加hiddenRow类
              const isHidden = (period === 7 || period === 8) && !hasCourseInPeriod(period);
              // 添加双线样式类
              const isAfterFourth = period === 4;

              return (
                <tr
                  key={period}
                  className={`${isHidden ? styles.hiddenRow : ''} ${isAfterFourth ? styles.afterFourthPeriod : ''}`}
                >
                  <td className={styles.periodCell}>{period}</td>
                  {[0, 1, 2, 3, 4].map((day) => {
                    const course = courseTable[period - 1]?.[day];

                    // 在拆分模式下，不使用rowSpan，每个单元格都显示内容
                    if (splitMode) {
                      // 如果是被占用的单元格，在拆分模式下也显示课程信息
                      if (course) {
                        return (
                          <td key={day} className={styles.courseContent}>
                            {renderCourseCell(course)}
                          </td>
                        );
                      } else {
                        return <td key={day} className={styles.emptyCell}></td>;
                      }
                    } else {
                      // 合并模式下的原有逻辑
                      if (!course) {
                        return <td key={day} className={styles.emptyCell}></td>;
                      }
                      if (course.isOccupied) {
                        return null;
                      }
                      return (
                        <td key={day} rowSpan={course.rowSpan} className={styles.courseContent}>
                          {renderCourseCell(course)}
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default CourseTable;

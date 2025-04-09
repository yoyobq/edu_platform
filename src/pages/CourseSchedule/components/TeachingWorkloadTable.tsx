import type { FlatCourseSchedule } from '@/services/plan/types';
import { Card, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from '../style.less';

// 添加 StaffInfo 接口定义
interface StaffInfo {
  id: number;
  jobId: number;
  name: string;
  age: number;
  departmentId: number;
}

// 添加 WorkloadItem 接口定义
interface WorkloadItem {
  className: string;
  courseName: string;
  weeklyHours: number;
  totalWeeks: number;
  coefficient: number;
  totalHours: number;
}

interface TeachingWorkloadTableProps {
  semesterId: number | null;
  staffInfo: StaffInfo;
  scheduleData?: FlatCourseSchedule[]; // 添加课表数据作为可选属性
}

const TeachingWorkloadTable: React.FC<TeachingWorkloadTableProps> = ({
  semesterId,
  staffInfo,
  scheduleData = [], // 设置默认值为空数组
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [workloadData, setWorkloadData] = useState<WorkloadItem[]>([]);
  const [totalWorkload, setTotalWorkload] = useState<number>(0);

  // 处理班级名称，去掉逗号并添加HTML换行标签
  const formatClassName = (className: string): string => {
    if (!className) return '';
    // 替换逗号为HTML换行标签
    return className.replace(/,/g, '<br>');
  };

  // 处理工作量数据
  const processWorkloadData = (courses: FlatCourseSchedule[]) => {
    // 按课程名和班级分组
    const courseMap = new Map<string, FlatCourseSchedule[]>();

    courses.forEach((course) => {
      const key = `${course.courseName}-${course.teachingClassName}`;
      if (!courseMap.has(key)) {
        courseMap.set(key, []);
      }
      courseMap.get(key)?.push(course);
    });

    // 计算每门课程的工作量
    const items: WorkloadItem[] = [];

    courseMap.forEach((coursesGroup) => {
      // 取第一个课程获取基本信息
      const course = coursesGroup[0];

      // 计算每周课时数（周课时）
      const weeklyHours = coursesGroup.reduce((sum, c) => {
        // 计算单次课程的课时数
        const periodsCount = c.periodEnd - c.periodStart + 1;
        return sum + periodsCount;
      }, 0);

      // 计算上课总周数
      const totalWeeks = course.weekCount || 0;

      // 系数默认为1
      const coefficient = 1;

      // 计算总课时
      const totalHours = weeklyHours * totalWeeks * coefficient;

      items.push({
        className: course.teachingClassName || '',
        courseName: course.courseName ? course.courseName.substring(8) : '',
        weeklyHours,
        totalWeeks,
        coefficient,
        totalHours,
      });
    });

    // 计算总工作量
    const total = items.reduce((sum, item) => sum + item.totalHours, 0);

    return { items, total };
  };

  useEffect(() => {
    if (!semesterId || !staffInfo) return;

    setLoading(true);

    // 直接使用传入的 scheduleData，不再发起请求
    try {
      const processedData = processWorkloadData(scheduleData);
      setWorkloadData(processedData.items);
      setTotalWorkload(processedData.total);
    } catch (error) {
      console.error('处理工作量数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [semesterId, staffInfo, scheduleData]); // 添加 scheduleData 作为依赖项

  return (
    <Card
      title={
        <Typography.Title level={4} style={{ margin: 0 }}>
          教师工作量预报表
          <span className={styles.workloadNoteText}>(不扣除节假日)</span>
        </Typography.Title>
      }
      loading={loading}
      style={{ marginTop: 16 }}
    >
      <div className={styles.workloadTable}>
        <table>
          <colgroup>
            <col style={{ width: '8%' }} /> {/* 工号 */}
            <col style={{ width: '8%' }} /> {/* 姓名 */}
            <col style={{ width: '12%' }} /> {/* 任课班级 - 调整为更合适的宽度 */}
            <col style={{ width: '23%' }} /> {/* 课程 - 相应增加一些宽度 */}
            <col style={{ width: '10%' }} /> {/* 周课时 */}
            <col style={{ width: '10%' }} /> {/* 周数 */}
            <col style={{ width: '10%' }} /> {/* 系数 */}
            <col style={{ width: '10%' }} /> {/* 课时 */}
            <col style={{ width: '9%' }} /> {/* 总课时(节) */}
          </colgroup>
          <thead>
            <tr>
              <th>工号</th>
              <th>姓名</th>
              <th>任课班级</th>
              <th>课程</th>
              <th>周课时</th>
              <th>周数</th>
              <th>系数</th>
              <th>课时</th>
              <th>总课时(节)</th>
            </tr>
          </thead>
          <tbody>
            {workloadData.map((item, index) => (
              <tr key={index} className={index % 2 === 1 ? styles.oddRow : ''}>
                {index === 0 ? (
                  <td rowSpan={workloadData.length}>{staffInfo?.jobId || ''}</td>
                ) : null}
                {index === 0 ? (
                  <td rowSpan={workloadData.length}>{staffInfo?.name || ''}</td>
                ) : null}
                <td
                  className={styles.alignCenter}
                  dangerouslySetInnerHTML={{ __html: formatClassName(item.className) }}
                ></td>
                <td className={styles.alignLeft}>{item.courseName}</td>
                <td className={styles.alignCenter}>{item.weeklyHours}</td>
                <td className={styles.alignCenter}>{item.totalWeeks}</td>
                <td className={styles.alignCenter}>{item.coefficient}</td>
                <td className={styles.alignCenter}>{item.totalHours}</td>
                {index === 0 ? (
                  <td rowSpan={workloadData.length} className={styles.alignCenter}>
                    {totalWorkload}
                  </td>
                ) : null}
              </tr>
            ))}
            {workloadData.length === 0 && (
              <tr>
                <td colSpan={9} className={styles.noData}>
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TeachingWorkloadTable;

import { getStaffWorkload } from '@/services/plan/courseScheduleManager';
import type { StaffWorkload, TeachingWorkloadItem } from '@/services/plan/types';
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
  // 删除 scheduleData 属性
}

const TeachingWorkloadTable: React.FC<TeachingWorkloadTableProps> = ({
  semesterId,
  staffInfo,
  // 删除 scheduleData 参数
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [workloadItems, setWorkloadItems] = useState<WorkloadItem[]>([]);
  const [totalWorkload, setTotalWorkload] = useState<number>(0);

  // 处理班级名称，去掉逗号并添加HTML换行标签
  const formatClassName = (className: string): string => {
    if (!className) return '';
    // 替换逗号为HTML换行标签
    return className.replace(/,/g, '<br>');
  };

  // 删除 processWorkloadData 函数，不再需要处理课表数据

  // 将新的工作量数据转换为组件内部使用的格式
  const convertWorkloadData = (
    data: StaffWorkload | null,
  ): { items: WorkloadItem[]; total: number } => {
    if (!data || !data.items || data.items.length === 0) {
      return { items: [], total: 0 };
    }

    const items: WorkloadItem[] = data.items.map((item: TeachingWorkloadItem) => ({
      className: item.teachingClassName || '',
      courseName: item.courseName || '',
      weeklyHours: item.weeklyHours || 0,
      totalWeeks: item.weekCount || 0,
      coefficient: item.coefficient || 1,
      totalHours: item.workloadHours || 0,
    }));

    return {
      items,
      total: data.totalHours || 0,
    };
  };

  // 获取工作量数据
  useEffect(() => {
    if (!semesterId || !staffInfo) return;

    setLoading(true);

    // 调用API获取工作量数据
    getStaffWorkload({
      semesterId,
      staffId: staffInfo.id,
    })
      .then((res) => {
        if (res) {
          const convertedData = convertWorkloadData(res);
          setWorkloadItems(convertedData.items);
          setTotalWorkload(convertedData.total);
        } else {
          // 如果没有获取到工作量数据，则显示空数据
          setWorkloadItems([]);
          setTotalWorkload(0);
        }
      })
      .catch((error) => {
        console.error('获取工作量数据失败:', error);
        // 出错时显示空数据
        setWorkloadItems([]);
        setTotalWorkload(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [semesterId, staffInfo]); // 删除 scheduleData 依赖

  // 组件渲染部分保持不变
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
            <col style={{ width: '6%' }} /> {/* 工号 */}
            <col style={{ width: '8%' }} /> {/* 姓名 */}
            <col style={{ width: '14%' }} /> {/* 任课班级 - 调整为更合适的宽度 */}
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
            {workloadItems.map((item, index) => (
              <tr key={index} className={index % 2 === 1 ? styles.oddRow : ''}>
                {index === 0 ? (
                  <td rowSpan={workloadItems.length}>{staffInfo?.jobId || ''}</td>
                ) : null}
                {index === 0 ? (
                  <td rowSpan={workloadItems.length}>{staffInfo?.name || ''}</td>
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
                  <td rowSpan={workloadItems.length} className={styles.alignCenter}>
                    {totalWorkload}
                  </td>
                ) : null}
              </tr>
            ))}
            {workloadItems.length === 0 && (
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

import type { StaffCancelledCourses } from '@/services/plan/types';
import { Table } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface FlattenedCancelledRecord {
  key: string;
  serialNumber?: number;
  staffId: string | number;
  sstsTeacherId?: string;
  staffName: string;
  teachingClassName?: string;
  courseName?: string;
  weeklyHours?: number;
  totalWeeks?: number;
  [date: string]: any;
  subtotal?: number;
  total?: number;
}

interface CancelledCoursesTableProps {
  filteredCancelledCourses: StaffCancelledCourses[];
  loading: boolean;
}

const formatClassName = (className: string): string[] => {
  if (!className) return [];
  return className.split(',').filter((name) => name.trim());
};

const CancelledCoursesTable: React.FC<CancelledCoursesTableProps> = React.memo(
  ({ filteredCancelledCourses, loading }) => {
    // 所有表格数据和列的生成都放在一个 useMemo，减少依赖链和重复计算
    const { columns, tableData } = React.useMemo(() => {
      // 1. 收集所有日期
      const allDatesSet = new Set<string>();
      const dateInfoMap = new Map<string, { weekNumber: number | string; weekOfDay: number }>();
      filteredCancelledCourses.forEach((staff) => {
        staff.cancelledDates.forEach((date) => {
          allDatesSet.add(date.date);
          if (!dateInfoMap.has(date.date)) {
            dateInfoMap.set(date.date, {
              weekNumber: date.weekNumber,
              weekOfDay: date.weekOfDay,
            });
          }
        });
      });
      const allDates = Array.from(allDatesSet).sort();

      // 2. 处理数据为扁平化结构
      const result: FlattenedCancelledRecord[] = [];
      let serialNumber = 0;
      filteredCancelledCourses.forEach((staff) => {
        const allCourses = staff.flatSchedules || [];
        let isFirstCourse = true;
        const courseDeductionMap = new Map<string, Record<string, number>>();
        staff.cancelledDates.forEach((date) => {
          date.courses.forEach((course) => {
            const scheduleId = String(course.scheduleId);
            if (!courseDeductionMap.has(scheduleId)) {
              courseDeductionMap.set(scheduleId, {});
            }
            const deductions = courseDeductionMap.get(scheduleId)!;
            deductions[date.date] = (deductions[date.date] || 0) + (course.cancelledHours || 0);
          });
        });
        allCourses.forEach((course) => {
          const scheduleId = String(course.scheduleId);
          const deductions = courseDeductionMap.get(scheduleId) || {};
          const record: FlattenedCancelledRecord = {
            key: `${staff.sstsTeacherId}-${scheduleId}`,
            serialNumber: isFirstCourse ? ++serialNumber : undefined,
            staffId: staff.staffId,
            sstsTeacherId: staff.sstsTeacherId,
            staffName: staff.staffName,
            teachingClassName: course.teachingClassName || '',
            courseName: course.courseName || '',
            weeklyHours: course.weeklyHours,
            totalWeeks: course.weekCount,
            subtotal: 0,
            total: isFirstCourse ? -staff.totalCancelledHours : undefined,
          };
          let subtotal = 0;
          allDates.forEach((date) => {
            const hours = deductions[date] || 0;
            record[date] = hours !== 0 ? -hours : 0;
            subtotal += hours;
          });
          record.subtotal = subtotal !== 0 ? -subtotal : 0;
          if (isFirstCourse) {
            record.total = -staff.totalCancelledHours;
          }
          result.push(record);
          isFirstCourse = false;
        });
        // 没有课表信息但有扣课记录
        const schedulesWithoutInfo = new Set<string>();
        staff.cancelledDates.forEach((date) => {
          date.courses.forEach((course) => {
            const scheduleId = String(course.scheduleId);
            if (!allCourses.some((c) => String(c.scheduleId) === scheduleId)) {
              schedulesWithoutInfo.add(scheduleId);
            }
          });
        });
        schedulesWithoutInfo.forEach((scheduleId) => {
          const deductions = courseDeductionMap.get(scheduleId) || {};
          let courseName = '';
          for (const date of staff.cancelledDates) {
            const course = date.courses.find((c) => String(c.scheduleId) === scheduleId);
            if (course) {
              courseName = course.courseName;
              break;
            }
          }
          const record: FlattenedCancelledRecord = {
            key: `${staff.sstsTeacherId}-${scheduleId}`,
            serialNumber: isFirstCourse ? ++serialNumber : undefined,
            staffId: staff.staffId,
            sstsTeacherId: staff.sstsTeacherId,
            staffName: staff.staffName,
            teachingClassName: '未知班级',
            courseName: courseName,
            weeklyHours: undefined,
            totalWeeks: undefined,
            subtotal: 0,
          };
          let subtotal = 0;
          allDates.forEach((date) => {
            const hours = deductions[date] || 0;
            record[date] = hours !== 0 ? -hours : 0;
            subtotal += hours;
          });
          record.subtotal = subtotal !== 0 ? -subtotal : 0;
          if (isFirstCourse) {
            record.total = -staff.totalCancelledHours;
          }
          result.push(record);
          isFirstCourse = false;
        });
        if (allCourses.length === 0 && schedulesWithoutInfo.size === 0) {
          result.push({
            key: `${staff.sstsTeacherId}-empty`,
            serialNumber: ++serialNumber,
            staffId: staff.staffId,
            sstsTeacherId: staff.sstsTeacherId,
            staffName: staff.staffName,
            subtotal: 0,
            total: -staff.totalCancelledHours,
          });
        }
      });

      // 3. 预处理每个教师的行数和起始索引
      const teacherRowsMap = new Map<string, { count: number; indices: number[] }>();
      result.forEach((record, index) => {
        if (record.sstsTeacherId) {
          if (!teacherRowsMap.has(record.sstsTeacherId)) {
            teacherRowsMap.set(record.sstsTeacherId, { count: 0, indices: [] });
          }
          const teacherInfo = teacherRowsMap.get(record.sstsTeacherId)!;
          teacherInfo.count += 1;
          teacherInfo.indices.push(index);
        }
      });

      // 4. 生成表格列
      const weekMap = ['一', '二', '三', '四', '五', '六', '日'];
      const baseColumns = [
        {
          title: '序号',
          dataIndex: 'serialNumber',
          key: 'serialNumber',
          width: '4%',
          align: 'center' as const,
          render: (value: any, record: FlattenedCancelledRecord, index: number) => {
            const teacherInfo = teacherRowsMap.get(record.sstsTeacherId!);
            if (!teacherInfo) return { children: value, props: { rowSpan: 1 } };
            const isFirstRow = teacherInfo.indices[0] === index;
            return {
              children: isFirstRow ? value : null,
              props: { rowSpan: isFirstRow ? teacherInfo.count : 0 },
            };
          },
        },
        {
          title: '工号',
          dataIndex: 'sstsTeacherId',
          key: 'sstsTeacherId',
          width: '4%',
          align: 'center' as const,
          render: (value: any, record: FlattenedCancelledRecord, index: number) => {
            const teacherInfo = teacherRowsMap.get(record.sstsTeacherId!);
            if (!teacherInfo) return { children: value, props: { rowSpan: 1 } };
            const isFirstRow = teacherInfo.indices[0] === index;
            return {
              children: isFirstRow ? value : null,
              props: { rowSpan: isFirstRow ? teacherInfo.count : 0 },
            };
          },
        },
        {
          title: '姓名',
          dataIndex: 'staffName',
          key: 'staffName',
          width: '6%',
          align: 'center' as const,
          render: (value: any, record: FlattenedCancelledRecord, index: number) => {
            const teacherInfo = teacherRowsMap.get(record.sstsTeacherId!);
            if (!teacherInfo) return { children: value, props: { rowSpan: 1 } };
            const isFirstRow = teacherInfo.indices[0] === index;
            return {
              children: isFirstRow ? value : null,
              props: { rowSpan: isFirstRow ? teacherInfo.count : 0 },
            };
          },
        },
        {
          title: '任课班级',
          dataIndex: 'teachingClassName',
          key: 'teachingClassName',
          width: '10%',
          align: 'center' as const,
          render: (value: any) => {
            if (!value) return '—';
            return (
              <>
                {formatClassName(value).map((name, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <br />}
                    {name}
                  </React.Fragment>
                ))}
              </>
            );
          },
        },
        {
          title: '课程',
          dataIndex: 'courseName',
          key: 'courseName',
          align: 'center' as const,
          render: (value: any) => value || '—',
        },
        {
          title: '周课时',
          dataIndex: 'weeklyHours',
          key: 'weeklyHours',
          width: '4%',
          align: 'center' as const,
        },
        {
          title: '上课周数',
          dataIndex: 'totalWeeks',
          key: 'totalWeeks',
          width: '5%',
          align: 'center' as const,
        },
      ];

      const dateColumns = allDates.map((date) => {
        const formattedDate = dayjs(date).format('M月D日');
        const info = dateInfoMap.get(date) || { weekNumber: '', weekOfDay: 1 };
        return {
          title: (
            <div style={{ textAlign: 'center' }}>
              {formattedDate}
              <br />第{info.weekNumber}周<br />周{weekMap[info.weekOfDay - 1]}
            </div>
          ),
          dataIndex: date,
          key: date,
          width: '7%',
          align: 'center' as const,
        };
      });

      const summaryColumns = [
        {
          title: '小计',
          dataIndex: 'subtotal',
          key: 'subtotal',
          width: '4%',
          align: 'center' as const,
        },
        {
          title: '合计',
          dataIndex: 'total',
          key: 'total',
          width: '5%',
          align: 'center' as const,
          render: (value: any, record: FlattenedCancelledRecord, index: number) => {
            const teacherInfo = teacherRowsMap.get(record.sstsTeacherId!);
            if (!teacherInfo)
              return {
                children: value !== undefined && value !== 0 ? value.toFixed(2) : '0.00',
                props: { rowSpan: 1 },
              };
            const isFirstRow = teacherInfo.indices[0] === index;
            return {
              children: isFirstRow
                ? value !== undefined && value !== 0
                  ? value.toFixed(2)
                  : '0.00'
                : null,
              props: { rowSpan: isFirstRow ? teacherInfo.count : 0 },
            };
          },
        },
      ];

      return {
        columns: [...baseColumns, ...dateColumns, ...summaryColumns],
        tableData: result,
      };
    }, [filteredCancelledCourses]);

    return (
      <Table
        dataSource={tableData}
        columns={columns}
        rowKey="key"
        pagination={false}
        bordered
        size="small"
        scroll={{ x: 'max-content', y: 600 }}
        loading={loading}
      />
    );
  },
);

export default CancelledCoursesTable;

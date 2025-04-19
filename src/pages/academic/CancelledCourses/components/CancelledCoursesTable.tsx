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
    const { columns, tableData } = React.useMemo(() => {
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

      const result: FlattenedCancelledRecord[] = [];
      const teacherRowsMap = new Map<string, { count: number; indices: number[] }>();

      let serialNumber = 0;
      filteredCancelledCourses.forEach((staff) => {
        const allCourses = staff.flatSchedules || [];
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

        let teacherSubtotal = 0;
        let courseIndex = 0;
        allCourses.forEach((course) => {
          const scheduleId = String(course.scheduleId);
          const deductions = courseDeductionMap.get(scheduleId) || {};
          const record: FlattenedCancelledRecord = {
            key: `${staff.sstsTeacherId}-${scheduleId}`,
            serialNumber: courseIndex === 0 ? ++serialNumber : undefined,
            staffId: staff.staffId,
            sstsTeacherId: staff.sstsTeacherId,
            staffName: staff.staffName,
            teachingClassName: course.teachingClassName || '',
            courseName: course.courseName || '',
            weeklyHours: course.weeklyHours,
            totalWeeks: course.weekCount,
            subtotal: 0,
          };

          allDates.forEach((date) => {
            const hours = deductions[date] || 0;
            record[date] = hours !== 0 ? -hours : 0;
            record.subtotal! += hours;
          });

          record.subtotal = -record.subtotal!;
          teacherSubtotal += record.subtotal;
          result.push(record);
          courseIndex++;
        });

        if (allCourses.length === 0) {
          result.push({
            key: `${staff.sstsTeacherId}-empty`,
            serialNumber: ++serialNumber,
            staffId: staff.staffId,
            sstsTeacherId: staff.sstsTeacherId,
            staffName: staff.staffName,
            subtotal: 0,
          });
        }

        const count = courseIndex || 1;
        const indices = result.slice(-count).map((_, i) => result.length - count + i);
        teacherRowsMap.set(staff.sstsTeacherId!, { count, indices });

        const firstRow = result[result.length - count];
        if (firstRow) firstRow.total = teacherSubtotal;
      });

      const weekMap = ['一', '二', '三', '四', '五', '六', '日'];
      const renderMergedCell = (value: any, record: FlattenedCancelledRecord, index: number) => {
        const teacherInfo = teacherRowsMap.get(record.sstsTeacherId!);
        if (!teacherInfo) return { children: value, props: { rowSpan: 1 } };
        const isFirstRow = teacherInfo.indices[0] === index;
        return {
          children: isFirstRow ? value : null,
          props: { rowSpan: isFirstRow ? teacherInfo.count : 0 },
        };
      };

      const baseColumns = [
        {
          title: '序号',
          dataIndex: 'serialNumber',
          key: 'serialNumber',
          width: '4%',
          align: 'center' as const,
          render: (v: any, r: FlattenedCancelledRecord, i: number) => renderMergedCell(v, r, i),
        },
        {
          title: '工号',
          dataIndex: 'sstsTeacherId',
          key: 'sstsTeacherId',
          width: '4%',
          align: 'center' as const,
          render: (v: any, r: FlattenedCancelledRecord, i: number) => renderMergedCell(v, r, i),
        },
        {
          title: '姓名',
          dataIndex: 'staffName',
          key: 'staffName',
          width: '6%',
          align: 'center' as const,
          render: (v: any, r: FlattenedCancelledRecord, i: number) => renderMergedCell(v, r, i),
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
        { title: '课程', dataIndex: 'courseName', key: 'courseName', align: 'center' as const },
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
          render: (v: any, r: FlattenedCancelledRecord, i: number) =>
            renderMergedCell(v?.toFixed(2) ?? '0.00', r, i),
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

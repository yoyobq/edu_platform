import type { StaffCancelledCourses } from '@/services/plan/types';
import { Table } from 'antd';
import React, { useMemo } from 'react';

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
  coefficient?: string | number;
  adjustedHours?: number;
  [date: string]: any;
  subtotal?: number;
  total?: number;
}

interface AdjunctPaymentTableProps {
  cancelledCourses: StaffCancelledCourses[];
  weekRange: [number, number];
  adjustedHoursMap: Record<string, number>;
  onAdjustedHoursChange: (value: number | null, recordKey: string) => void;
  loading: boolean;
  specificTeacherIds?: string[]; // 建议作为可选参数传入
}

const formatClassName = (className: string): string[] => {
  if (!className) return [];
  return className.split(',').filter((name) => name.trim());
};

const AdjunctPaymentTable: React.FC<AdjunctPaymentTableProps> = React.memo(
  ({
    cancelledCourses,
    weekRange,
    adjustedHoursMap,
    onAdjustedHoursChange,
    loading,
    specificTeacherIds, // 默认值
  }) => {
    // 数据处理和列生成全部用 useMemo，避免重复计算
    const { processedData, columns } = useMemo(() => {
      // 处理数据转换为扁平化结构
      const result: FlattenedCancelledRecord[] = [];
      let serialNumber = 0;

      // 收集所有日期，并按周数筛选
      const allDatesSet = new Set<string>();
      cancelledCourses.forEach((staff) => {
        const filteredDates = staff.cancelledDates.filter((date) => {
          const weekNum = Number(date.weekNumber);
          return weekNum >= weekRange[0] && weekNum <= weekRange[1];
        });
        filteredDates.forEach((date) => {
          allDatesSet.add(date.date);
        });
      });
      const allDates = Array.from(allDatesSet).sort();

      // 按照specificTeacherIds的顺序对数据进行排序
      const sortedData = [...cancelledCourses].sort((a, b) => {
        const indexA = specificTeacherIds!.indexOf(a.sstsTeacherId!);
        const indexB = specificTeacherIds!.indexOf(b.sstsTeacherId!);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

      sortedData.forEach((staff) => {
        const allCourses = staff.flatSchedules || [];
        let isFirstCourse = true;
        const courseDeductionMap = new Map<string, Record<string, number>>();
        staff.cancelledDates
          .filter((date) => {
            const weekNum = Number(date.weekNumber);
            return weekNum >= weekRange[0] && weekNum <= weekRange[1];
          })
          .forEach((date) => {
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
          const courseWeeks = course.weekCount;
          const record: FlattenedCancelledRecord = {
            key: `${staff.sstsTeacherId}-${scheduleId}`,
            serialNumber: isFirstCourse ? ++serialNumber : undefined,
            staffId: staff.staffId,
            sstsTeacherId: staff.sstsTeacherId,
            staffName: staff.staffName,
            teachingClassName: course.teachingClassName || '',
            courseName: course.courseName || '',
            weeklyHours: course.weeklyHours,
            coefficient: course.coefficient,
            totalWeeks: courseWeeks,
            subtotal: 0,
            total: isFirstCourse ? -staff.totalCancelledHours : undefined,
          };
          let subtotal = 0;
          allDates.forEach((date) => {
            const hours = deductions[date] || 0;
            subtotal += hours;
          });
          record.subtotal = subtotal !== 0 ? -subtotal : 0;
          result.push(record);
          isFirstCourse = false;
        });

        // 处理没有课表信息但有扣课记录的课程
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
          const actualWeeks = weekRange[1] - weekRange[0] + 1;
          const record: FlattenedCancelledRecord = {
            key: `${staff.sstsTeacherId}-${scheduleId}`,
            serialNumber: isFirstCourse ? ++serialNumber : undefined,
            staffId: staff.staffId,
            sstsTeacherId: staff.sstsTeacherId,
            staffName: staff.staffName,
            teachingClassName: '未知班级',
            courseName: courseName,
            weeklyHours: undefined,
            totalWeeks: actualWeeks,
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

      // 预处理每个教师的行数和起始索引
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
          width: '5%',
          align: 'center' as const,
          render: renderMergedCell,
        },
        {
          title: '姓名',
          dataIndex: 'staffName',
          key: 'staffName',
          width: '9%',
          align: 'center' as const,
          render: renderMergedCell,
        },
        {
          title: '任课班级',
          dataIndex: 'teachingClassName',
          key: 'teachingClassName',
          width: '15%',
          align: 'center' as const,
          render: (value: any) => {
            if (!value) return '—';
            const classNames = formatClassName(value);
            // 使用CSS样式让\n生效
            return classNames.length > 0 ? (
              <div style={{ whiteSpace: 'pre-line' }}>{classNames.join('\n')}</div>
            ) : (
              '—'
            );
          },
        },
        {
          title: '课程',
          dataIndex: 'courseName',
          key: 'courseName',
          width: '18%',
          align: 'center' as const,
          render: (value: any) => value || '—',
        },
        {
          title: '周学时',
          dataIndex: 'weeklyHours',
          key: 'weeklyHours',
          width: '8%',
          align: 'center' as const,
        },
        {
          title: '上课周数',
          dataIndex: 'totalWeeks',
          key: 'totalWeeks',
          width: '8%',
          align: 'center' as const,
        },
        {
          title: '增删课',
          key: 'adjustedHours',
          width: '8%',
          align: 'center' as const,
          render: (_: any, record: FlattenedCancelledRecord) => {
            // 计算值：扣课课时除以系数
            const coefficient =
              record.coefficient !== undefined && record.coefficient !== null
                ? Number(record.coefficient)
                : 1.0;
            const value = record.subtotal !== undefined ? record.subtotal / coefficient : 0;

            // 直接显示数值，保留0位小数
            return value.toFixed(0);
          },
        },
        {
          title: '系数',
          dataIndex: 'coefficient',
          key: 'coefficient',
          width: '8%',
          align: 'center' as const,
          render: (value: any) => {
            if (value !== undefined && value !== null) {
              return Number(value).toFixed(1);
            }
            return '1.0';
          },
        },
      ];

      const summaryColumns = [
        // 学校表格中没有扣课课时列，保留代码方便调试
        // {
        //   title: '扣课课时',
        //   dataIndex: 'subtotal',
        //   key: 'subtotal',
        //   width: '8%',
        //   align: 'center' as const,
        //   // 添加render函数处理浮点数精度问题
        //   render: (value: any) => {
        //     if (value === undefined || value === null) return '—';
        //     return Number(value).toFixed(1);
        //   },
        // },
        {
          title: '实际课时',
          key: 'actualHours',
          width: '8%',
          align: 'center' as const,
          render: (_: any, record: FlattenedCancelledRecord) => {
            if (
              record.weeklyHours === undefined ||
              record.totalWeeks === undefined ||
              record.subtotal === undefined
            ) {
              return '—';
            }
            const adjustedHours = adjustedHoursMap[record.key] || 0;
            // 扣课课时移除乘以系数的计算，因为后台返回的数据已经计算好了
            // 确保系数存在，如果不存在则使用默认值1.0
            const coefficient =
              record.coefficient !== undefined && record.coefficient !== null
                ? Number(record.coefficient)
                : 1.0;
            const actualHours =
              record.weeklyHours * record.totalWeeks * coefficient +
              adjustedHours +
              record.subtotal;
            // 虽然这里应该显示小数点后的数据，但学校表格中是整数，所以这里将错就错
            return actualHours.toFixed(0);
          },
        },
      ];

      return {
        processedData: result,
        columns: [...baseColumns, ...summaryColumns],
      };
    }, [cancelledCourses, weekRange, adjustedHoursMap, onAdjustedHoursChange, specificTeacherIds]);

    return (
      <Table
        dataSource={processedData}
        columns={columns}
        rowKey="key"
        pagination={false}
        bordered
        size="small"
        scroll={{ x: 'max-content' }}
        sticky={{ offsetHeader: 0 }}
        className="adjunct-payment-table"
        loading={loading}
      />
    );
  },
);

export default AdjunctPaymentTable;

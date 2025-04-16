import React, { useMemo } from 'react';
import { Table, InputNumber } from 'antd';
import type { StaffCancelledCourses } from '@/services/plan/types';

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
}

const AdjunctPaymentTable: React.FC<AdjunctPaymentTableProps> = ({
  cancelledCourses,
  weekRange,
  adjustedHoursMap,
  onAdjustedHoursChange,
  loading,
}) => {
  // 处理班级名称，将逗号分隔的班级转换为数组
  const formatClassName = (className: string): string[] => {
    if (!className) return [];
    return className.split(',').filter((name) => name.trim());
  };

  // 处理数据转换为扁平化结构
  const processData = (data: StaffCancelledCourses[]): FlattenedCancelledRecord[] => {
    // 这里是原来的 processData 函数内容
    // 由于代码较长，这里省略，实际使用时请复制原函数内容
    const result: FlattenedCancelledRecord[] = [];
    let serialNumber = 0;

    // 收集所有日期，并按周数筛选
    const allDatesSet = new Set<string>();
    data.forEach((staff) => {
      // 先筛选出符合周数范围的日期
      const filteredDates = staff.cancelledDates.filter((date) => {
        const weekNum = Number(date.weekNumber);
        return weekNum >= weekRange[0] && weekNum <= weekRange[1];
      });

      filteredDates.forEach((date) => {
        allDatesSet.add(date.date);
      });
    });

    // 按日期排序
    const allDates = Array.from(allDatesSet).sort();

    // 按照specificTeacherIds的顺序对数据进行排序
    const specificTeacherIds = ['3553']; // 这里需要从props传入
    const sortedData = [...data].sort((a, b) => {
      const indexA = specificTeacherIds.indexOf(a.sstsTeacherId!);
      const indexB = specificTeacherIds.indexOf(b.sstsTeacherId!);
      // 如果在specificTeacherIds中找不到，则放到最后
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    // 处理每个教师的数据
    sortedData.forEach((staff) => {
      // 使用 flatSchedules 获取所有课程信息
      const allCourses = staff.flatSchedules || [];

      // 为每个课程创建一行记录
      let isFirstCourse = true;

      // 创建课程扣课时数映射，只包含选定周数范围内的数据
      const courseDeductionMap = new Map<string, Record<string, number>>();

      // 填充扣课记录，只处理选定周数范围内的日期
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

      // 先处理有课表信息的课程
      allCourses.forEach((course) => {
        const scheduleId = String(course.scheduleId);
        const deductions = courseDeductionMap.get(scheduleId) || {};

        // 使用课程的实际教学周数，而不是计算的周数范围
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
          coefficient: course.coefficient, // 添加系数
          totalWeeks: courseWeeks, // 使用课程的实际教学周数
          subtotal: 0,
          total: isFirstCourse ? -staff.totalCancelledHours : undefined,
        };

        // 计算小计，但不再添加日期列
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
        // 找到这个课程的任意一条扣课记录，获取课程名称
        let courseName = '';
        for (const date of staff.cancelledDates) {
          const course = date.courses.find((c) => String(c.scheduleId) === scheduleId);
          if (course) {
            courseName = course.courseName;
            break;
          }
        }

        // 计算选定周数范围内的实际周数
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
          totalWeeks: actualWeeks, // 使用计算出的实际周数
          subtotal: 0,
        };

        // 添加每个日期的扣课时数
        let subtotal = 0;
        allDates.forEach((date) => {
          const hours = deductions[date] || 0;
          record[date] = hours !== 0 ? -hours : 0;
          subtotal += hours;
        });

        record.subtotal = subtotal !== 0 ? -subtotal : 0;

        // 只有第一个课程显示总计
        if (isFirstCourse) {
          record.total = -staff.totalCancelledHours;
        }

        result.push(record);
        isFirstCourse = false;
      });

      // 如果该教师没有课程，仍然添加一行
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

    return result;
  };

  // 使用 useMemo 缓存处理后的数据
  const processedData = useMemo(() => {
    return processData(cancelledCourses);
  }, [cancelledCourses, weekRange]);

  // 动态生成表格列
  const generateColumns = () => {
    // 预处理数据，计算每个教师的行数和起始索引
    const teacherRowsMap = new Map<string, { count: number; indices: number[] }>();

    processedData.forEach((record, index) => {
      if (record.sstsTeacherId) {
        if (!teacherRowsMap.has(record.sstsTeacherId)) {
          teacherRowsMap.set(record.sstsTeacherId, { count: 0, indices: [] });
        }
        const teacherInfo = teacherRowsMap.get(record.sstsTeacherId)!;
        teacherInfo.count += 1;
        teacherInfo.indices.push(index);
      }
    });

    // 创建合并单元格的渲染函数
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
        width: '8%',
        align: 'center' as const,
        render: renderMergedCell,
      },
      {
        title: '任课班级',
        dataIndex: 'teachingClassName',
        key: 'teachingClassName',
        width: '12%',
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
        width: '16%',
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
        width: '6%',
        align: 'center' as const,
      },
      {
        title: '增删课',
        key: 'adjustedHours',
        width: '8%',
        align: 'center' as const,
        render: (_: any, record: FlattenedCancelledRecord) => (
          <div className="no-select-input-wrapper">
            <InputNumber
              size="small"
              min={-99}
              max={99}
              defaultValue={0}
              value={adjustedHoursMap[record.key] || 0}
              onChange={(value) => onAdjustedHoursChange(value, record.key)}
              style={{ width: '100%' }}
              className="no-select-input"
            />
          </div>
        ),
      },
      {
        title: '系数',
        dataIndex: 'coefficient',
        key: 'coefficient',
        width: '6%',
        align: 'center' as const,
        render: (value: any) => {
          // 如果有值，转为数字并保留一位小数；如果没有值，默认显示1.0
          if (value !== undefined && value !== null) {
            return Number(value).toFixed(1);
          }
          return '1.0';
        },
      },
    ];

    // 添加小计和实际课时列
    const summaryColumns = [
      {
        title: '扣课课时',
        dataIndex: 'subtotal',
        key: 'subtotal',
        width: '6%',
        align: 'center' as const,
        render: (value: any, record: FlattenedCancelledRecord) => {
          // 如果没有扣课课时或系数，直接显示原值
          if (value === undefined || value === null) {
            return '—';
          }

          // 获取系数，如果没有则默认为1.0
          const coefficient = record.coefficient ? Number(record.coefficient) : 1.0;

          // 计算扣课课时除以系数的值
          const adjustedSubtotal = value / coefficient;

          // 格式化为整数
          return adjustedSubtotal.toFixed(0);
        },
      },
      {
        title: '实际课时',
        key: 'actualHours',
        align: 'center' as const,
        render: (_: any, record: FlattenedCancelledRecord) => {
          // 如果缺少必要数据，显示破折号
          if (
            record.weeklyHours === undefined ||
            record.totalWeeks === undefined ||
            record.subtotal === undefined
          ) {
            return '—';
          }

          // 获取增删课的值
          const adjustedHours = adjustedHoursMap[record.key] || 0;

          // 计算实际课时 = (周课时 * 上课周数 + 增删课 + 扣课课时) * 系数
          const coefficient = record.coefficient ? Number(record.coefficient) : 1.0;
          const actualHours =
            (record.weeklyHours * record.totalWeeks + adjustedHours + record.subtotal) *
            coefficient;

          // 格式化为整数
          return actualHours.toFixed(0);
        },
      },
    ];

    return [...baseColumns, ...summaryColumns];
  };

  // 使用 useMemo 缓存生成的列
  const columns = useMemo(() => {
    return generateColumns();
  }, [processedData, adjustedHoursMap]);

  return (
    <Table
      dataSource={processedData}
      columns={columns}
      rowKey="key"
      pagination={false}
      bordered
      size="small"
      scroll={{ x: 'max-content' }}
      className="data-table"
      loading={loading}
    />
  );
};

export default React.memo(AdjunctPaymentTable);

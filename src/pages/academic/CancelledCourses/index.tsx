import { getStaffsCancelledCourses } from '@/services/plan/courseScheduleManager';
import { getSemesters } from '@/services/plan/semester';
import type { Semester, StaffCancelledCourses } from '@/services/plan/types';
import { DownOutlined } from '@ant-design/icons';
import { Card, Checkbox, Col, Dropdown, Row, Space, Spin, Table, Tabs, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import './style.less';

// 定义扁平化后的扣课记录结构
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
  [date: string]: any; // 动态日期列
  subtotal?: number;
  total?: number;
}

// 定义教师信息结构
interface TeacherInfo {
  sstsTeacherId: string;
  staffName: string;
}

const CancelledCoursesPage: React.FC = () => {
  // 学期列表数组
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const [cancelledCourses, setCancelledCourses] = useState<StaffCancelledCourses[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 添加教师选择相关状态
  const [allTeachers, setAllTeachers] = useState<TeacherInfo[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [filteredCancelledCourses, setFilteredCancelledCourses] = useState<StaffCancelledCourses[]>(
    [],
  );

  // 添加专任教师工号列表
  const fullTimeTeacherIds = [
    '2225',
    '2236',
    '2323',
    '2332',
    '2203',
    '2223',
    '2224',
    '2232',
    '2297',
    '2226',
    '2229',
    '2237',
    '2228',
    '2314',
    '3236',
    '2230',
    '2311',
    '2235',
    '2342',
  ];

  // 添加行政兼课工号列表
  const adminTeacherIds = ['2221', '2270', '2062', '2066'];

  // 公益性岗位数组
  const publicWelfareTeacherIds = ['3322', '3600'];

  // 获取所有学期信息
  useEffect(() => {
    getSemesters({})
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => dayjs(b.startDate).unix() - dayjs(a.startDate).unix(),
        );
        setSemesters(sorted);
        const current = sorted.find((s) => s.isCurrent);
        const latest = sorted[0];
        const initialSemester = current || latest;
        if (initialSemester) {
          setSemesterId(initialSemester.id);
          setSemester(initialSemester);
        }
      })
      .catch((error) => console.error('获取学期列表失败:', error));
  }, []);

  // 获取扣课信息
  useEffect(() => {
    if (!semesterId) return;
    setLoading(true);
    // const testSstsTeacherIds = ['3618', '3617', '3616', '3593', '3556', '3552', '3553', '3558'];
    getStaffsCancelledCourses({ semesterId }) // , sstsTeacherIds: ['2225', '2236', '2226'] })
      .then((data) => {
        setCancelledCourses(data);

        // 提取所有教师信息
        const teachers: TeacherInfo[] = data.map((staff) => ({
          sstsTeacherId: staff.sstsTeacherId!,
          staffName: staff.staffName,
        }));

        setAllTeachers(teachers);
        // 默认全选
        setSelectedTeachers(teachers.map((t) => t.sstsTeacherId));
        setFilteredCancelledCourses(data);

        console.log('获取扣课信息成功:', data);
      })
      .catch((error) => {
        console.error('获取扣课信息失败:', error);
      })
      .finally(() => setLoading(false));
  }, [semesterId]);

  // 根据选中的教师过滤数据
  useEffect(() => {
    if (cancelledCourses.length === 0) return;

    // 当没有选择任何教师时，显示所有数据
    let filtered =
      selectedTeachers.length === 0
        ? cancelledCourses
        : cancelledCourses.filter((staff) => selectedTeachers.includes(staff.sstsTeacherId || ''));

    // 检查是否选择的是专任教师列表
    const isFullTimeTeachersSelected =
      selectedTeachers.length === fullTimeTeacherIds.length &&
      selectedTeachers.every((id) => fullTimeTeacherIds.includes(id));

    // 检查是否选择的是行政兼课列表
    const isAdminTeachersSelected =
      selectedTeachers.length === adminTeacherIds.length &&
      selectedTeachers.every((id) => adminTeacherIds.includes(id));

    // 检查是否选择的是公益性岗位列表
    const isPublicWelfareTeachersSelected =
      selectedTeachers.length === publicWelfareTeacherIds.length &&
      selectedTeachers.every((id) => publicWelfareTeacherIds.includes(id));

    // 如果是专任教师，按照fullTimeTeacherIds的顺序排序
    if (isFullTimeTeachersSelected) {
      // 创建一个映射，用于确定每个教师ID在fullTimeTeacherIds中的位置
      const orderMap = new Map<string, number>();
      fullTimeTeacherIds.forEach((id, index) => {
        orderMap.set(id, index);
      });

      // 根据映射排序
      filtered = [...filtered].sort((a, b) => {
        const orderA = orderMap.get(a.sstsTeacherId || '') ?? Number.MAX_SAFE_INTEGER;
        const orderB = orderMap.get(b.sstsTeacherId || '') ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });
    }
    // 如果是行政兼课，按照adminTeacherIds的顺序排序
    else if (isAdminTeachersSelected) {
      // 创建一个映射，用于确定每个教师ID在adminTeacherIds中的位置
      const orderMap = new Map<string, number>();
      adminTeacherIds.forEach((id, index) => {
        orderMap.set(id, index);
      });

      // 根据映射排序
      filtered = [...filtered].sort((a, b) => {
        const orderA = orderMap.get(a.sstsTeacherId || '') ?? Number.MAX_SAFE_INTEGER;
        const orderB = orderMap.get(b.sstsTeacherId || '') ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });
    }
    // 如果是公益性岗位，按照publicWelfareTeacherIds的顺序排序
    else if (isPublicWelfareTeachersSelected) {
      // 创建一个映射，用于确定每个教师ID在publicWelfareTeacherIds中的位置
      const orderMap = new Map<string, number>();
      publicWelfareTeacherIds.forEach((id, index) => {
        orderMap.set(id, index);
      });

      // 根据映射排序
      filtered = [...filtered].sort((a, b) => {
        const orderA = orderMap.get(a.sstsTeacherId || '') ?? Number.MAX_SAFE_INTEGER;
        const orderB = orderMap.get(b.sstsTeacherId || '') ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });
    }

    setFilteredCancelledCourses(filtered);
  }, [
    selectedTeachers,
    cancelledCourses,
    fullTimeTeacherIds,
    adminTeacherIds,
    publicWelfareTeacherIds,
  ]);

  // 处理教师选择变化
  const handleTeacherChange = (teacherId: string, checked: boolean) => {
    if (checked) {
      setSelectedTeachers((prev) => [...prev, teacherId]);
    } else {
      setSelectedTeachers((prev) => prev.filter((id) => id !== teacherId));
    }
  };

  // 处理全选/全不选
  const handleSelectAllTeachers = (checked: boolean) => {
    if (checked) {
      setSelectedTeachers(allTeachers.map((t) => t.sstsTeacherId));
    } else {
      setSelectedTeachers([]);
    }
  };

  // 处理选择专任教师
  const handleSelectFullTimeTeachers = () => {
    setSelectedTeachers(fullTimeTeacherIds);
  };

  // 处理选择行政兼课教师
  const handleSelectAdminTeachers = () => {
    setSelectedTeachers(adminTeacherIds);
  };

  // 处理选择公益性岗位教师
  const handleSelectPublicWelfareTeachers = () => {
    setSelectedTeachers(publicWelfareTeacherIds);
  };

  // 添加标签页切换处理函数
  const handleTabChange = (activeKey: string) => {
    switch (activeKey) {
      case 'all':
        handleSelectAllTeachers(true);
        break;
      case 'fullTime':
        handleSelectFullTimeTeachers();
        break;
      case 'admin':
        handleSelectAdminTeachers();
        break;
      case 'publicWelfare':
        handleSelectPublicWelfareTeachers();
        break;
      default:
        break;
    }
  };

  // 处理学期变更
  const handleSemesterChange = (newSemester: Semester) => {
    // 清理相关状态数据
    setCancelledCourses([]);
    setLoading(true);

    // 更新学期信息
    setSemesterId(newSemester.id);
    setSemester(newSemester);
  };

  // 菜单点击切换学期
  const handleMenuClick = (e: any) => {
    const selectedSemester = semesters.find((s) => s.id === parseInt(e.key, 10));
    if (selectedSemester && selectedSemester.id !== semesterId) {
      handleSemesterChange(selectedSemester);
    }
  };

  const menuItems = semesters.map((s) => ({
    key: s.id.toString(),
    label: s.name,
  }));

  // 处理数据转换为扁平化结构
  const processData = (data: StaffCancelledCourses[]): FlattenedCancelledRecord[] => {
    const result: FlattenedCancelledRecord[] = [];
    let serialNumber = 0;

    // 收集所有日期
    const allDatesSet = new Set<string>();
    data.forEach((staff) => {
      staff.cancelledDates.forEach((date) => {
        allDatesSet.add(date.date);
      });
    });

    // 按日期排序
    const allDates = Array.from(allDatesSet).sort();

    data.forEach((staff) => {
      // 使用 flatSchedules 获取所有课程信息
      const allCourses = staff.flatSchedules || [];

      // 为每个课程创建一行记录
      let isFirstCourse = true;

      // 创建课程扣课时数映射
      const courseDeductionMap = new Map<string, Record<string, number>>();

      // 填充扣课记录
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

      // 先处理有课表信息的课程
      allCourses.forEach((course) => {
        const scheduleId = String(course.scheduleId);
        const deductions = courseDeductionMap.get(scheduleId) || {};

        const record: FlattenedCancelledRecord = {
          key: `${staff.sstsTeacherId}-${scheduleId}`,
          serialNumber: isFirstCourse ? ++serialNumber : undefined,
          staffId: staff.staffId,
          sstsTeacherId: staff.sstsTeacherId,
          staffName: staff.staffName,
          teachingClassName: course.teachingClassName || '', // 确保有值，避免undefined
          courseName: course.courseName || '', // 确保有值，避免undefined
          weeklyHours: course.weeklyHours,
          totalWeeks: course.weekCount,
          subtotal: 0,
          total: isFirstCourse ? -staff.totalCancelledHours : undefined,
        };

        // 添加每个日期的扣课时数
        let subtotal = 0;
        allDates.forEach((date) => {
          const hours = deductions[date] || 0;
          record[date] = hours !== 0 ? -hours : 0; // 负数表示扣课
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

  // 获取所有日期列
  const getDateColumns = () => {
    const dateSet = new Set<string>();
    const dateInfoMap = new Map<string, { weekNumber: number | string; weekOfDay: number }>();

    filteredCancelledCourses.forEach((staff) => {
      // 使用过滤后的数据
      staff.cancelledDates.forEach((date) => {
        dateSet.add(date.date);
        if (!dateInfoMap.has(date.date)) {
          dateInfoMap.set(date.date, {
            weekNumber: date.weekNumber,
            weekOfDay: date.weekOfDay,
          });
        }
      });
    });

    // 按日期排序
    const sortedDates = Array.from(dateSet).sort();

    return sortedDates.map((date) => {
      const formattedDate = dayjs(date).format('M月D日');
      const weekMap = ['一', '二', '三', '四', '五', '六', '日'];
      const { weekNumber, weekOfDay } = dateInfoMap.get(date) || { weekNumber: '', weekOfDay: 1 };

      return {
        title: (
          <div style={{ textAlign: 'center' }}>
            {formattedDate}
            <br />第{weekNumber}周<br />周{weekMap[weekOfDay - 1]}
          </div>
        ),
        dataIndex: date,
        key: date,
        width: '7%',
        align: 'center' as const,
      };
    });
  };

  // 处理班级名称，将逗号分隔的班级转换为数组
  const formatClassName = (className: string): string[] => {
    if (!className) return [];
    return className.split(',').filter((name) => name.trim());
  };

  // 动态生成表格列
  const generateColumns = () => {
    // 预处理数据，计算每个教师的行数和起始索引
    const flattenedData = processData(filteredCancelledCourses); // 使用过滤后的数据
    const teacherRowsMap = new Map<string, { count: number; indices: number[] }>();

    flattenedData.forEach((record, index) => {
      if (record.sstsTeacherId) {
        if (!teacherRowsMap.has(record.sstsTeacherId)) {
          teacherRowsMap.set(record.sstsTeacherId, { count: 0, indices: [] });
        }
        const teacherInfo = teacherRowsMap.get(record.sstsTeacherId)!;
        teacherInfo.count += 1;
        teacherInfo.indices.push(index);
      }
    });

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
        // width: '15%',
        align: 'center' as const,
        render: (value: any) => value || '—', // 添加默认显示
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

    // 添加日期列
    const dateColumns = getDateColumns();

    // 添加小计和合计列
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

    return [...baseColumns, ...dateColumns, ...summaryColumns];
  };

  return (
    <div className="container">
      {/* 功能区卡片 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Title level={4}>扣课统计表</Typography.Title>
          <div>
            <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
              <Typography.Link style={{ fontSize: 16 }}>
                <Space>
                  {semester?.name || '请选择学期'}
                  <DownOutlined />
                </Space>
              </Typography.Link>
            </Dropdown>
          </div>
        </div>
      </Card>

      {/* 教师选择区域 - 使用标签页替换按钮 */}
      <Card style={{ marginBottom: 16 }}>
        <Tabs defaultActiveKey="all" onChange={handleTabChange}>
          <Tabs.TabPane key="all" tab="全部教师" />
          <Tabs.TabPane key="fullTime" tab="专任教师" />
          <Tabs.TabPane key="admin" tab="行政兼课" />
          <Tabs.TabPane key="publicWelfare" tab="公益性岗位" />
        </Tabs>

        {/* 表格只渲染一次，根据选中的教师显示数据 */}
        <Spin spinning={loading}>
          <Table
            dataSource={processData(filteredCancelledCourses)}
            columns={generateColumns()}
            rowKey="key"
            pagination={false}
            bordered
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </Spin>

        <Row gutter={[16, 8]} style={{ display: 'none' }}>
          {allTeachers.map((teacher) => (
            <Col span={4} key={teacher.sstsTeacherId}>
              <Checkbox
                checked={selectedTeachers.includes(teacher.sstsTeacherId)}
                onChange={(e) => handleTeacherChange(teacher.sstsTeacherId, e.target.checked)}
              >
                {teacher.staffName}
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default CancelledCoursesPage;

import { getStaffsCancelledCourses } from '@/services/plan/courseScheduleManager';
import { getSemesters } from '@/services/plan/semester';
import type { Semester, StaffCancelledCourses, TeacherInfo } from '@/services/plan/types';
import { DownOutlined } from '@ant-design/icons';
import { Card, Dropdown, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CancelledCoursesTable from './components/CancelledCoursesTable';
import TeacherTabs from './components/TeacherTabs';
import './style.less';

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

  // 添加专任教师工号列表
  const fullTimeTeacherIds = useMemo(
    () => [
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
    ],
    [],
  );

  // 添加行政兼课工号列表
  const adminTeacherIds = useMemo(() => ['2221', '2270', '2062', '2066'], []);

  // 公益性岗位数组
  const publicWelfareTeacherIds = useMemo(() => ['3322', '3600'], []);

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
    getStaffsCancelledCourses({ semesterId })
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
      })
      .catch((error) => {
        console.error('获取扣课信息失败:', error);
      })
      .finally(() => setLoading(false));
  }, [semesterId]);

  // 用 useMemo 计算 filteredCancelledCourses，避免多余 setState 和渲染
  const filteredCancelledCourses = useMemo(() => {
    if (cancelledCourses.length === 0) return [];

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
      const orderMap = new Map<string, number>();
      fullTimeTeacherIds.forEach((id, index) => {
        orderMap.set(id, index);
      });
      filtered = [...filtered].sort((a, b) => {
        const orderA = orderMap.get(a.sstsTeacherId || '') ?? Number.MAX_SAFE_INTEGER;
        const orderB = orderMap.get(b.sstsTeacherId || '') ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });
    }
    // 如果是行政兼课，按照adminTeacherIds的顺序排序
    else if (isAdminTeachersSelected) {
      const orderMap = new Map<string, number>();
      adminTeacherIds.forEach((id, index) => {
        orderMap.set(id, index);
      });
      filtered = [...filtered].sort((a, b) => {
        const orderA = orderMap.get(a.sstsTeacherId || '') ?? Number.MAX_SAFE_INTEGER;
        const orderB = orderMap.get(b.sstsTeacherId || '') ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });
    }
    // 如果是公益性岗位，按照publicWelfareTeacherIds的顺序排序
    else if (isPublicWelfareTeachersSelected) {
      const orderMap = new Map<string, number>();
      publicWelfareTeacherIds.forEach((id, index) => {
        orderMap.set(id, index);
      });
      filtered = [...filtered].sort((a, b) => {
        const orderA = orderMap.get(a.sstsTeacherId || '') ?? Number.MAX_SAFE_INTEGER;
        const orderB = orderMap.get(b.sstsTeacherId || '') ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });
    }

    return filtered;
  }, [
    selectedTeachers,
    cancelledCourses,
    fullTimeTeacherIds,
    adminTeacherIds,
    publicWelfareTeacherIds,
  ]);

  // 处理全选/全不选
  const handleSelectAllTeachers = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedTeachers(allTeachers.map((t) => t.sstsTeacherId));
      } else {
        setSelectedTeachers([]);
      }
    },
    [allTeachers],
  );

  // 处理选择专任教师
  const handleSelectFullTimeTeachers = useCallback(() => {
    setSelectedTeachers(fullTimeTeacherIds);
  }, [fullTimeTeacherIds]);

  // 处理选择行政兼课教师
  const handleSelectAdminTeachers = useCallback(() => {
    setSelectedTeachers(adminTeacherIds);
  }, [adminTeacherIds]);

  // 处理选择公益性岗位教师
  const handleSelectPublicWelfareTeachers = useCallback(() => {
    setSelectedTeachers(publicWelfareTeacherIds);
  }, [publicWelfareTeacherIds]);

  // 添加标签页切换处理函数
  const handleTabChange = useCallback(
    (activeKey: string) => {
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
    },
    [
      handleSelectAllTeachers,
      handleSelectFullTimeTeachers,
      handleSelectAdminTeachers,
      handleSelectPublicWelfareTeachers,
    ],
  );

  // 处理学期变更
  const handleSemesterChange = useCallback((newSemester: Semester) => {
    // 清理相关状态数据
    setCancelledCourses([]);
    setLoading(true);

    // 更新学期信息
    setSemesterId(newSemester.id);
    setSemester(newSemester);
  }, []);

  // 菜单点击切换学期
  const handleMenuClick = useCallback(
    (e: any) => {
      const selectedSemester = semesters.find((s) => s.id === parseInt(e.key, 10));
      if (selectedSemester && selectedSemester.id !== semesterId) {
        handleSemesterChange(selectedSemester);
      }
    },
    [semesters, semesterId, handleSemesterChange],
  );

  const menuItems = useMemo(
    () =>
      semesters.map((s) => ({
        key: s.id.toString(),
        label: s.name,
      })),
    [semesters],
  );

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
        <TeacherTabs onTabChange={handleTabChange} />

        {/* 表格组件 */}
        <CancelledCoursesTable
          filteredCancelledCourses={filteredCancelledCourses}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default CancelledCoursesPage;

import { getStaffsCancelledCourses } from '@/services/plan/courseScheduleManager';
import { getSemesters } from '@/services/plan/semester';
import type { Semester, StaffCancelledCourses, TeacherInfo } from '@/services/plan/types';
import { DownOutlined } from '@ant-design/icons';
import { Card, Dropdown, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TeacherTabs from '../TeacherTabs';
import CancelledCoursesTable from './components/CancelledCoursesTable';
import './style.less';

/**
 * 外聘教师扣课统计页面
 * 显示教师在特定学期内的扣课情况，提供标签页筛选功能，并支持动态切换学期。
 */
const CancelledCoursesPage: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const [cancelledCourses, setCancelledCourses] = useState<StaffCancelledCourses[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [allTeachers, setAllTeachers] = useState<TeacherInfo[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);

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
  const adminTeacherIds = ['2221', '2270', '2062', '2066'];
  const publicWelfareTeacherIds = ['3322', '3600'];
  const specificTeacherIds = ['3618', '3617', '3616', '3593', '3556', '3552', '3553', '3358'];

  // 获取所有学期列表，并默认选择当前学期或最新一个
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
      .catch(console.error);
  }, []);

  // 获取扣课信息
  useEffect(() => {
    if (!semesterId) return;
    setLoading(true);
    getStaffsCancelledCourses({ semesterId })
      .then((data) => {
        setCancelledCourses(data);
        const teachers: TeacherInfo[] = data.map((staff) => ({
          sstsTeacherId: staff.sstsTeacherId!,
          staffName: staff.staffName,
        }));
        setAllTeachers(teachers);
        setSelectedTeachers(teachers.map((t) => t.sstsTeacherId));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [semesterId]);

  // 按 selectedTeachers 顺序，筛选出当前选中教师的扣课信息
  const filteredCancelledCourses = useMemo(() => {
    const map = new Map(cancelledCourses.map((s) => [s.sstsTeacherId, s]));
    return selectedTeachers.map((id) => map.get(id)).filter(Boolean) as StaffCancelledCourses[];
  }, [cancelledCourses, selectedTeachers]);

  // 处理全选 / 取消全选教师的操作
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

  // 切换专任教师标签页时设置选中教师
  const handleSelectFullTimeTeachers = useCallback(() => {
    setSelectedTeachers(fullTimeTeacherIds);
  }, [fullTimeTeacherIds]);

  // 切换行政兼课标签页时设置选中教师
  const handleSelectAdminTeachers = useCallback(() => {
    setSelectedTeachers(adminTeacherIds);
  }, [adminTeacherIds]);

  // 切换公益性岗位标签页时设置选中教师
  const handleSelectPublicWelfareTeachers = useCallback(() => {
    setSelectedTeachers(publicWelfareTeacherIds);
  }, [publicWelfareTeacherIds]);

  // 切换外聘教师标签页时设置选中教师
  const handleSelectSpecificTeachers = useCallback(() => {
    setSelectedTeachers(specificTeacherIds);
  }, [specificTeacherIds]);

  // 处理标签页变化，根据不同类型设置选中教师
  const handleTabChange = useCallback(
    (key: string) => {
      switch (key) {
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
        case 'specific':
          handleSelectSpecificTeachers();
          break;
      }
    },
    [
      handleSelectAllTeachers,
      handleSelectFullTimeTeachers,
      handleSelectAdminTeachers,
      handleSelectPublicWelfareTeachers,
      handleSelectSpecificTeachers,
    ],
  );

  // 学期切换时，重置扣课数据和加载状态
  const handleSemesterChange = useCallback((newSemester: Semester) => {
    setCancelledCourses([]);
    setLoading(true);
    setSemesterId(newSemester.id);
    setSemester(newSemester);
  }, []);

  // 下拉菜单点击切换学期
  const handleMenuClick = useCallback(
    (e: any) => {
      const selectedSemester = semesters.find((s) => s.id === parseInt(e.key, 10));
      if (selectedSemester && selectedSemester.id !== semesterId) {
        handleSemesterChange(selectedSemester);
      }
    },
    [semesters, semesterId, handleSemesterChange],
  );

  // 将所有学期转换为菜单项格式
  const menuItems = useMemo(
    () => semesters.map((s) => ({ key: s.id.toString(), label: s.name })),
    [semesters],
  );

  return (
    <div className="container">
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

      <Card style={{ marginBottom: 16 }}>
        <TeacherTabs onTabChange={handleTabChange} />
        <CancelledCoursesTable
          filteredCancelledCourses={filteredCancelledCourses}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default CancelledCoursesPage;

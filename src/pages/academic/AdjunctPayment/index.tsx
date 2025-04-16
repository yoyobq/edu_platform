import Footer from '@/components/Footer';
import { getStaffsCancelledCourses } from '@/services/plan/courseScheduleManager';
import { getSemesters } from '@/services/plan/semester';
import type { Semester, StaffCancelledCourses } from '@/services/plan/types';
import { DownOutlined } from '@ant-design/icons';
import { Card, Dropdown, Space, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import './style.less';
import WeekRangeSlider from './components/WeekRangeSlider';
import CancelledDatesInfo from './components/CancelledDatesInfo';
import AdjunctPaymentTable from './components/AdjunctPaymentTable';

const AdjunctPaymentPage: React.FC = () => {
  // 学期列表数组
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const [cancelledCourses, setCancelledCourses] = useState<StaffCancelledCourses[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 添加周数范围状态
  const [weekRange, setWeekRange] = useState<[number, number]>([1, 16]);
  const [totalWeeks, setTotalWeeks] = useState<number>(16);
  // 添加一个状态来存储临时的周数范围
  const [tempWeekRange, setTempWeekRange] = useState<[number, number]>([1, 16]);
  // 添加一个状态来存储增删课的值
  const [adjustedHoursMap, setAdjustedHoursMap] = useState<Record<string, number>>({});

  // 指定教师工号列表
  const specificTeacherIds = useMemo(() => ['3553'], []);

  // 计算学期的教学周数
  const calculateTeachingWeeks = useCallback((semester: Semester): number => {
    if (semester.firstTeachingDate && semester.examStartDate) {
      const startDate = dayjs(semester.firstTeachingDate);
      const endDate = dayjs(semester.examStartDate);
      // 计算从教学开始日期到考试开始日期之间的周数
      const weeksDiff = Math.floor(endDate.diff(startDate, 'day') / 7);
      return weeksDiff;
    }
    return 16; // 默认值
  }, []);

  // 处理增删课数值变化
  const handleAdjustedHoursChange = useCallback((value: number | null, recordKey: string) => {
    setAdjustedHoursMap((prev) => ({
      ...prev,
      [recordKey]: value || 0,
    }));
  }, []);

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

          // 计算教学周数并设置初始范围
          const weeks = calculateTeachingWeeks(initialSemester);
          setTotalWeeks(weeks);
          setWeekRange([1, weeks]);
          setTempWeekRange([1, weeks]);
        }
      })
      .catch((error) => console.error('获取学期列表失败:', error));
  }, [calculateTeachingWeeks]);

  // 获取扣课信息
  useEffect(() => {
    if (!semesterId) return;
    setLoading(true);
    getStaffsCancelledCourses({ semesterId, sstsTeacherIds: specificTeacherIds, weeks: weekRange })
      .then((data) => {
        setCancelledCourses(data);
      })
      .catch((error) => {
        console.error('获取扣课信息失败:', error);
      })
      .finally(() => setLoading(false));
  }, [semesterId, weekRange, specificTeacherIds]);

  // 处理学期变更
  const handleSemesterChange = useCallback(
    (newSemester: Semester) => {
      // 清理相关状态数据
      setCancelledCourses([]);
      setLoading(true);

      // 更新学期信息
      setSemesterId(newSemester.id);
      setSemester(newSemester);

      // 计算新学期的教学周数并更新范围
      const weeks = calculateTeachingWeeks(newSemester);
      setTotalWeeks(weeks);
      const newRange: [number, number] = [1, weeks];
      setWeekRange(newRange);
      setTempWeekRange(newRange); // 同步更新临时状态
    },
    [calculateTeachingWeeks],
  );

  // 处理周数范围变化（滑动过程中）
  const handleWeekRangeChange = useCallback((value: number[]) => {
    // 只更新临时状态，不触发数据请求
    setTempWeekRange(value as [number, number]);
  }, []);

  // 处理滑动完成后的操作
  const handleWeekRangeAfterChange = useCallback((value: number[]) => {
    // 滑动完成后，更新实际状态并触发数据请求
    setWeekRange(value as [number, number]);
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
      <Card className="header-card">
        <div className="header-content">
          <Typography.Title level={4}>兼职教师扣课统计表</Typography.Title>
          <div>
            <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
              <Typography.Link className="semester-selector">
                <Space>
                  {semester?.name || '请选择学期'}
                  <DownOutlined />
                </Space>
              </Typography.Link>
            </Dropdown>
          </div>
        </div>
      </Card>

      {/* 周数选择滑动条 */}
      <Card className="week-range-card">
        <WeekRangeSlider
          semester={semester}
          totalWeeks={totalWeeks}
          tempWeekRange={tempWeekRange}
          onWeekRangeChange={handleWeekRangeChange}
          onWeekRangeAfterChange={handleWeekRangeAfterChange}
        />

        {/* 扣课日期提示信息 */}
        <CancelledDatesInfo cancelledCourses={cancelledCourses} weekRange={weekRange} />
      </Card>

      {/* 数据表格 */}
      <Card>
        <Spin spinning={loading}>
          <AdjunctPaymentTable
            cancelledCourses={cancelledCourses}
            weekRange={weekRange}
            adjustedHoursMap={adjustedHoursMap}
            onAdjustedHoursChange={handleAdjustedHoursChange}
            loading={loading}
          />
        </Spin>
      </Card>

      <div className="content-padding"></div>
      <Footer />
    </div>
  );
};

export default AdjunctPaymentPage;

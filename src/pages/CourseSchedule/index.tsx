/* eslint-disable @typescript-eslint/no-unused-vars */
import CourseTable from '@/components/mySSTS/CourseTable';
import { getFullScheduleByStaff } from '@/services/plan/courseScheduleManager';
import { getSemesters } from '@/services/plan/semester';
import type { FlatCourseSchedule, Semester } from '@/services/plan/types';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Card, Dropdown, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import HolidayDeductionTable from './components/CancelledCoursesTable';
import TeachingWorkloadTable from './components/TeachingWorkloadTable';
import styles from './style.less';

/**
 * CourseSchedulePage 组件：用于展示课程表和课时信息
 */
const CourseSchedulePage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  // 学期列表数组
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const [scheduleData, setScheduleData] = useState<FlatCourseSchedule[]>([]);

  const [staffInfo, setStaffInfo] = useState<any>(null);

  const [loading, setLoading] = useState<boolean>(true);
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

  // 单独处理 staffInfo 的获取
  useEffect(() => {
    if (initialState?.currentUser?.staffInfo) {
      setStaffInfo(initialState.currentUser.staffInfo);
    }
  }, [initialState?.currentUser?.staffInfo]);

  // 获取课表数据
  useEffect(() => {
    if (!semesterId || !staffInfo) return;

    setLoading(true);

    getFullScheduleByStaff(staffInfo.id, semesterId)
      .then((res) => {
        console.log(res);
        setScheduleData(res);
      })
      .catch((error) => console.error('获取课表数据失败:', error))
      .finally(() => setLoading(false));
  }, [semesterId, staffInfo]);

  // 处理学期变更
  const handleSemesterChange = (newSemester: Semester) => {
    // 清理相关状态数据
    setScheduleData([]);
    setLoading(true);

    // 更新学期信息
    setSemesterId(newSemester.id);
    setSemester(newSemester);
  };

  // 菜单点击切换学期
  const handleMenuClick = (e: any) => {
    const selectedSemester = semesters.find((s) => s.id === parseInt(e.key, 10));
    if (selectedSemester) {
      handleSemesterChange(selectedSemester);
    }
  };

  const menuItems = semesters.map((s) => ({
    key: s.id.toString(),
    label: s.name,
  }));

  return (
    <div className={styles.container}>
      {/* 功能区卡片 */}
      <Card className={styles.infoCard} style={{ marginBottom: 16 }}>
        <div className={styles.infoContainer}>
          <div className={styles.teacherInfo}>
            <Space>
              <UserOutlined />
              <Typography.Text strong>{staffInfo?.name}</Typography.Text>
              <Typography.Text type="secondary">工号: {staffInfo?.jobId}</Typography.Text>
            </Space>
          </div>
          <div className={styles.semesterSelector}>
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

      <CourseTable
        semesterId={semesterId}
        semester={semester}
        staffId={staffInfo?.id}
        scheduleData={scheduleData}
      />

      {/* 添加工作量预报表 - 删除 scheduleData 属性 */}
      <TeachingWorkloadTable semesterId={semesterId} staffInfo={staffInfo} />

      {/* 添加节假日扣课时统计表 */}
      <HolidayDeductionTable
        semesterId={semesterId}
        staffInfo={staffInfo}
        scheduleData={scheduleData}
      />

      <div className={styles.contentPadding}></div>
    </div>
  );
};

export default CourseSchedulePage;

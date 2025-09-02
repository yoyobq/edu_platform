import { getStaffWorkloads } from '@/services/plan/courseScheduleManager';
import { getSemesters } from '@/services/plan/semester';
import type { Semester, StaffWorkload } from '@/services/plan/types';
import { DownOutlined } from '@ant-design/icons';
import { Card, Dropdown, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TeacherTabs from '../TeacherTabs';
import WorkloadTable, { FlattenedWorkloadRecord } from './components/WorkloadTable';
import './style.less';

const WorkloadForecastPage: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const [workloads, setWorkloads] = useState<StaffWorkload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('all');
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
  const adminTeacherIds = ['2218', '2221', '2270', '2062', '2066'];
  const publicWelfareTeacherIds = ['3322', '3600', '3366'];
  const specificTeacherIds = [
    '3592',
    '3600',
    '3648',
    '3650',
    '3497',
    '3236',
    '3322',
    '3646',
    '3647',
    '3552',
    '3649',
    '3616',
    '3556',
    '3645',
    '3618',
    '3641',
    '3358',
    '3553',
  ];

  // 根据当前标签页筛选出应显示的教师并排序
  const getSortedTeacherIds = useCallback((all: string[], tab: string): string[] => {
    // const filterFrom = (source: string[]) => source.filter(id => all.includes(id));
    switch (tab) {
      case 'fullTime':
        return fullTimeTeacherIds.filter((id) => all.includes(id));
      case 'admin':
        return adminTeacherIds.filter((id) => all.includes(id));
      case 'publicWelfare':
        return publicWelfareTeacherIds.filter((id) => all.includes(id));
      case 'specific':
        return specificTeacherIds.filter((id) => all.includes(id));
      default:
        return all;
    }
  }, []);

  // 拉取工作量数据，并根据当前 tab 类型设置排序后的教师 ID
  const fetchWorkloads = useCallback(
    (semId: number, tab: string) => {
      setLoading(true);
      getStaffWorkloads({ semesterId: semId })
        .then((data) => {
          const ids = data.map((s) => s.sstsTeacherId || '').filter(Boolean);
          const sortedIds = getSortedTeacherIds(ids, tab);
          setWorkloads(data);
          setSelectedTeachers(sortedIds);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    },
    [getSortedTeacherIds],
  );

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
          fetchWorkloads(initialSemester.id, activeTab);
        }
      })
      .catch(console.error);
  }, []);

  const handleTabChange = useCallback(
    (key: string) => {
      setActiveTab(key);
      if (semesterId) fetchWorkloads(semesterId, key);
    },
    [semesterId, fetchWorkloads],
  );

  // 过滤出当前标签页选中的教师的工作量数据，并按 selectedTeachers 的顺序排序
  const filteredWorkloads = useMemo(() => {
    const map = new Map(workloads.map((w) => [w.sstsTeacherId, w]));
    return selectedTeachers.map((id) => map.get(id)).filter(Boolean) as StaffWorkload[];
  }, [workloads, selectedTeachers]);

  // 扁平化课程数据，并计算教师的行合并信息（用于表格合并单元格）
  const { processedData, teacherRowsMap } = useMemo(() => {
    const result: FlattenedWorkloadRecord[] = [];
    const rowsMap = new Map<string, { count: number; indices: number[] }>();
    filteredWorkloads.forEach((staff) => {
      if (!staff.sstsTeacherId) return;
      let first = true;
      staff.items.forEach((item) => {
        result.push({
          key: `${staff.sstsTeacherId}-${item.courseName}-${item.teachingClassName}`,
          sstsTeacherId: first ? staff.sstsTeacherId : undefined,
          staffName: first ? staff.staffName : undefined,
          teachingClassName: item.teachingClassName,
          courseName: item.courseName,
          weeklyHours: item.weeklyHours,
          weekCount: item.weekCount,
          coefficient: item.coefficient,
          workloadHours: item.workloadHours,
          totalHours: first ? staff.totalHours : undefined,
        });
        first = false;
      });
      if (staff.items.length === 0) {
        result.push({
          key: `${staff.sstsTeacherId}-empty`,
          sstsTeacherId: staff.sstsTeacherId,
          staffName: staff.staffName,
          totalHours: staff.totalHours,
        });
      }
      const start = result.length - (staff.items.length || 1);
      const indices = Array.from({ length: staff.items.length || 1 }, (_, i) => start + i);
      rowsMap.set(staff.sstsTeacherId, { count: staff.items.length || 1, indices });
    });
    return { processedData: result, teacherRowsMap: rowsMap };
  }, [filteredWorkloads]);

  const menuItems = semesters.map((s) => ({ key: s.id.toString(), label: s.name }));

  // 计算所有教师的总课时
  const totalWorkloadHours = useMemo(() => {
    return processedData.reduce((sum, r) => sum + (r.totalHours || 0), 0).toFixed(2);
  }, [processedData]);

  return (
    <div className="container">
      <Card className="header-card">
        <div className="header-content">
          <Typography.Title level={4}>教师工作量预测</Typography.Title>
          <Dropdown
            menu={{
              items: menuItems,
              onClick: (e) => {
                const sel = semesters.find((x) => x.id === Number(e.key));
                if (sel) {
                  setSemester(sel);
                  setSemesterId(sel.id);
                  fetchWorkloads(sel.id, activeTab);
                }
              },
            }}
            trigger={['click']}
          >
            <Typography.Link>
              <Space>
                {semester?.name || '请选择学期'}
                <DownOutlined />
              </Space>
            </Typography.Link>
          </Dropdown>
        </div>
      </Card>
      <Card className="data-table-card">
        <TeacherTabs onTabChange={handleTabChange} />
        <WorkloadTable
          loading={loading}
          data={processedData}
          totalWorkloadHours={totalWorkloadHours}
          teacherRowsMap={teacherRowsMap}
        />
      </Card>
    </div>
  );
};

export default WorkloadForecastPage;

import {
  getActualTeachingDates,
  getFullScheduleByStaff,
} from '@/services/plan/courseScheduleManager';
import { getSemesters } from '@/services/plan/semester';
import type { FlatCourseSchedule, TeachingDate } from '@/services/plan/types';
import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Card, Dropdown, message, Space, Spin, Tag, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
// 移除静态导入
// import { exportToExcel } from './components/ExcelExporter';
import './style.less';

// 将星期几转换为中文
const getDayOfWeekText = (day: number): string => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  return days[day - 1] || '未知';
};

// 解析周次字符串，返回上课周次的文本表示
const parseWeekNumberString = (weekStr: string): string => {
  if (!weekStr) return '未知';

  const weeks = weekStr.split(',').map((w) => parseInt(w, 10));
  const activeWeeks: number[] = [];

  weeks.forEach((isActive, index) => {
    if (isActive === 1) {
      activeWeeks.push(index + 1);
    }
  });

  // 尝试简化表示，例如连续的周次用范围表示
  const ranges: string[] = [];
  let start = activeWeeks[0];
  let end = start;

  for (let i = 1; i <= activeWeeks.length; i++) {
    if (i < activeWeeks.length && activeWeeks[i] === end + 1) {
      end = activeWeeks[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      if (i < activeWeeks.length) {
        start = end = activeWeeks[i];
      }
    }
  }

  return ranges.join(', ');
};

// 获取课程类别的中文名称和颜色
const getCategoryInfo = (category: string): CategoryInfo => {
  const categoryMap: Record<string, CategoryInfo> = {
    THEORY: { text: '理论课', color: 'blue' },
    PRACTICE: { text: '实践课', color: 'green' },
    INTEGRATED: { text: '一体化', color: 'orange' },
    OTHER: { text: '其他', color: 'default' },
  };

  return categoryMap[category] || { text: '其他', color: 'default' };
};

const PlanAsst: React.FC = () => {
  // 使用 useModel 钩子访问 initialState，包含全局的初始化数据
  const { initialState } = useModel('@@initialState');
  const staffId = initialState?.currentUser?.staffInfo?.id;

  // 学期相关状态
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const [staffIdState, setStaffId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [teachingDates, setTeachingDates] = useState<TeachingDate[]>([]);
  const [processedCourses, setProcessedCourses] = useState<ProcessedCourse[]>([]);

  // 使用 useEffect 初始化 staffId
  useEffect(() => {
    if (staffId) {
      setStaffId(staffId);
    }
  }, [staffId]);

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
      .catch((error) => console.error('获取学期列表失败:', error))
      .finally(() => setLoading(false));
  }, []);

  // 添加获取课表数据的逻辑
  useEffect(() => {
    if (!semesterId || !staffIdState) return;

    setLoading(true);

    // 处理 staffId，确保类型正确
    const effectiveStaffId = staffIdState === null ? undefined : staffIdState;

    // 处理课表数据，将相同scheduleId的课程合并
    const processScheduleData = (data: FlatCourseSchedule[]) => {
      // 按scheduleId分组
      const courseMap = new Map<number, ProcessedCourse>();

      data.forEach((item) => {
        const scheduleId = item.scheduleId;
        if (!scheduleId) return;

        if (!courseMap.has(scheduleId)) {
          // 创建新的课程记录
          courseMap.set(scheduleId, {
            scheduleId,
            courseName: item.courseName || '',
            staffName: item.staffName || '',
            teachingClassName: item.teachingClassName || '',
            classroomName: item.classroomName || '未记录',
            courseCategory: item.courseCategory || '',
            credits: item.credits || 0,
            weekCount: item.weekCount || 0,
            weeklyHours: item.weeklyHours || 0,
            coefficient: item.coefficient || '1.00',
            weekNumberString: item.weekNumberString || '',
            timeSlots: [],
          });
        }

        // 添加时间段信息
        const course = courseMap.get(scheduleId)!;
        if (item.dayOfWeek && item.periodStart && item.periodEnd) {
          course.timeSlots.push({
            dayOfWeek: item.dayOfWeek,
            periodStart: item.periodStart,
            periodEnd: item.periodEnd,
            weekType: item.weekType || 'ALL',
          });
        }
      });

      // 转换为数组
      const processed = Array.from(courseMap.values());
      setProcessedCourses(processed);
    };

    // 从后台获取数据
    getFullScheduleByStaff({
      staffId: effectiveStaffId,
      semesterId,
    })
      .then((res) => {
        // 处理课表数据
        processScheduleData(res);
      })
      .catch((error) => {
        console.error('获取课表数据失败:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [semesterId, staffIdState]);

  // 当学期变更时，清空教学日期数据
  const handleSemesterChange = useCallback((newSemester: Semester) => {
    // 清理相关状态数据
    setLoading(true);
    setProcessedCourses([]);
    setTeachingDates([]);

    // 更新学期信息
    setSemesterId(newSemester.id);
    setSemester(newSemester);

    setLoading(false);
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

  // 将所有学期转换为菜单项格式
  const menuItems = useMemo(
    () =>
      semesters.map((s) => ({
        key: s.id.toString(),
        label: s.name,
      })),
    [semesters],
  );

  // 添加获取详细数据的函数
  const fetchDetailData = async (record: ProcessedCourse) => {
    // 标记为加载中
    setProcessedCourses((prev) =>
      prev.map((item) =>
        item.scheduleId === record.scheduleId ? { ...item, detailLoading: true } : item,
      ),
    );

    try {
      // 声明一个变量来存储教学日期数据
      let currentTeachingDates = teachingDates;

      // 检查是否已经获取过教学日期数据
      if (teachingDates.length === 0) {
        // 从后台获取实际教学日期数据
        const teachingDateInput = {
          semesterId: semesterId!,
          staffId: staffIdState!,
        };

        const teachingDateData = await getActualTeachingDates(teachingDateInput);
        // console.log('🔍 后台返回的原始教学日期数据:', teachingDateData);
        setTeachingDates(teachingDateData);
        currentTeachingDates = teachingDateData;
      }

      // 从已有的教学日期数据中提取当前课程的数据
      const courseTeachingDates: any[] = [];

      // 遍历所有日期，找出包含当前课程的日期
      currentTeachingDates.forEach((dateItem) => {
        // 在每天的课程中查找当前课程
        const coursesForDay = dateItem.courses || [];
        const matchingCourses = coursesForDay.filter(
          (course: any) => course.scheduleId === record.scheduleId,
        );

        if (matchingCourses.length > 0) {
          // 找到匹配的课程，添加到结果中
          courseTeachingDates.push({
            date: dateItem.date,
            week: dateItem.weekNumber,
            weekOfDay: dateItem.weekOfDay,
            courses: matchingCourses,
          });
        }
      });

      console.log('📅 当前课程的教学日期数据:', courseTeachingDates);
      console.log('📋 当前处理的课程记录:', record);

      // 按周次排序
      courseTeachingDates.sort((a, b) => a.week - b.week);

      // 将数字转换为中文数字（1-10）
      const numberToChinese = (num: number): string => {
        const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
        if (num >= 1 && num <= 10) {
          return chineseNumbers[num - 1];
        }
        return num.toString();
      };

      // 将节次范围转换为详细列表（如 "1-3" 转换为 "第一节，第二节，第三节"）
      const periodRangeToDetailedList = (
        start: number,
        end: number,
        courseCategory?: string,
      ): string => {
        const periodCount = end - start + 1;

        // 如果是理论课且恰好是3节课，拆分为前两节和后一节
        if (courseCategory === 'THEORY' && periodCount === 3) {
          const firstTwoPeriods = [];
          for (let i = start; i < start + 2; i++) {
            firstTwoPeriods.push(`第${numberToChinese(i)}节`);
          }
          const lastPeriod = `第${numberToChinese(end)}节`;
          return `${firstTwoPeriods.join('，')}，${lastPeriod}`;
        }

        // 如果是理论课且恰好是4节课，拆分为前两节和后两节
        if (courseCategory === 'THEORY' && start === 1 && end === 4) {
          const firstTwoPeriods = [];
          for (let i = start; i < start + 2; i++) {
            firstTwoPeriods.push(`第${numberToChinese(i)}节`);
          }
          const lastTwoPeriods = [];
          for (let i = start + 2; i <= end; i++) {
            lastTwoPeriods.push(`第${numberToChinese(i)}节`);
          }
          return `${firstTwoPeriods.join('，')}，${lastTwoPeriods.join('，')}`;
        }

        // 其他情况保持原有逻辑
        const periods = [];
        for (let i = start; i <= end; i++) {
          periods.push(`第${numberToChinese(i)}节`);
        }
        return periods.join('，');
      };

      // 构建详细数据
      const detailData = {
        scheduleDetails: courseTeachingDates.flatMap((date) => {
          //
          return date.courses.flatMap(
            (course: { periodStart: number; periodEnd: number; weekType: string }) => {
              // 计算学时数 - 根据课程节次计算
              const periodCount = course.periodEnd - course.periodStart + 1;

              // 如果是理论课且恰好是4节课，拆分为两行数据
              if (
                record.courseCategory === 'THEORY' &&
                course.periodStart === 1 &&
                course.periodEnd === 4
              ) {
                return [
                  {
                    week: date.week,
                    date: date.date,
                    content: `${getDayOfWeekText(date.weekOfDay)} ${periodRangeToDetailedList(1, 2, record.courseCategory)}${
                      course.weekType !== 'ALL'
                        ? course.weekType === 'ODD'
                          ? '(单周)'
                          : course.weekType === 'EVEN'
                            ? '(双周)'
                            : ''
                        : ''
                    }`,
                    hours: 2, // 前两节课
                    periodStart: 1,
                    periodEnd: 2,
                    weekType: course.weekType,
                  },
                  {
                    week: date.week,
                    date: date.date,
                    content: `${getDayOfWeekText(date.weekOfDay)} ${periodRangeToDetailedList(3, 4, record.courseCategory)}${
                      course.weekType !== 'ALL'
                        ? course.weekType === 'ODD'
                          ? '(单周)'
                          : course.weekType === 'EVEN'
                            ? '(双周)'
                            : ''
                        : ''
                    }`,
                    hours: 2, // 后两节课
                    periodStart: 3,
                    periodEnd: 4,
                    weekType: course.weekType,
                  },
                ];
              }

              // 如果是理论课且恰好是3节课，拆分为2+1模式
              if (record.courseCategory === 'THEORY' && periodCount === 3) {
                // 处理123、234、567三种情况
                if (
                  (course.periodStart === 1 && course.periodEnd === 3) ||
                  (course.periodStart === 2 && course.periodEnd === 4) ||
                  (course.periodStart === 5 && course.periodEnd === 7)
                ) {
                  return [
                    {
                      week: date.week,
                      date: date.date,
                      content: `${getDayOfWeekText(date.weekOfDay)} ${periodRangeToDetailedList(course.periodStart, course.periodStart + 1, record.courseCategory)}${
                        course.weekType !== 'ALL'
                          ? course.weekType === 'ODD'
                            ? '(单周)'
                            : course.weekType === 'EVEN'
                              ? '(双周)'
                              : ''
                          : ''
                      }`,
                      hours: 2, // 前两节课
                      periodStart: course.periodStart,
                      periodEnd: course.periodStart + 1,
                      weekType: course.weekType,
                    },
                    {
                      week: date.week,
                      date: date.date,
                      content: `${getDayOfWeekText(date.weekOfDay)} ${periodRangeToDetailedList(course.periodEnd, course.periodEnd, record.courseCategory)}${
                        course.weekType !== 'ALL'
                          ? course.weekType === 'ODD'
                            ? '(单周)'
                            : course.weekType === 'EVEN'
                              ? '(双周)'
                              : ''
                          : ''
                      }`,
                      hours: 1, // 最后一节课
                      periodStart: course.periodEnd,
                      periodEnd: course.periodEnd,
                      weekType: course.weekType,
                    },
                  ];
                }
              }

              // 其他情况保持原有逻辑
              const hours = periodCount > 0 ? periodCount : 2;
              return {
                week: date.week,
                date: date.date,
                content: `${getDayOfWeekText(date.weekOfDay)} ${periodRangeToDetailedList(course.periodStart, course.periodEnd, record.courseCategory)}${
                  course.weekType !== 'ALL'
                    ? course.weekType === 'ODD'
                      ? '(单周)'
                      : course.weekType === 'EVEN'
                        ? '(双周)'
                        : ''
                    : ''
                }`,
                hours: hours,
                // 添加原始的节次数据用于Excel导出
                periodStart: course.periodStart,
                periodEnd: course.periodEnd,
                weekType: course.weekType,
              };
            },
          );
        }),
      };

      // 更新课程数据
      setProcessedCourses((prev) =>
        prev.map((item) =>
          item.scheduleId === record.scheduleId
            ? { ...item, detailData, detailLoading: false }
            : item,
        ),
      );

      // 返回详细数据，这样调用者可以直接使用
      return detailData;
    } catch (error) {
      console.error('获取详细数据失败:', error);
      // 更新加载状态
      setProcessedCourses((prev) =>
        prev.map((item) =>
          item.scheduleId === record.scheduleId ? { ...item, detailLoading: false } : item,
        ),
      );
      throw error;
    }
  };

  // 添加懒加载导出Excel的函数
  const lazyExportToExcel = async (courseName: string, className: string, scheduleDetails: any) => {
    try {
      // 动态导入导出函数
      const { exportToExcel } = await import('./components/ExcelExporter');
      await exportToExcel(courseName, className, scheduleDetails);
    } catch (error) {
      console.error('导出Excel失败:', error);
      message.error('导出Excel失败，请稍后重试');
    }
  };

  // 定义 ProTable 的列
  const columns: ProColumns<ProcessedCourse>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: '5%',
      search: false,
      className: 'column-index',
      render: (_, __, index) => index + 1,
    },
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
      width: '24%',
      search: false,
      render: (_, record) => {
        const { text: categoryText } = getCategoryInfo(record.courseCategory);
        return (
          <div
            className={`courseCell ${record.courseCategory === 'THEORY' ? 'theoryPracticeCourse' : record.courseCategory === 'INTEGRATED' ? 'integratedCourse' : 'otherCourse'}`}
          >
            <div className="course-name">{record.courseName}</div>
            <div className="teaching-class">{record.teachingClassName}</div>
            <div className="courseWatermark">{categoryText}</div>
          </div>
        );
      },
    },
    {
      title: '学分',
      dataIndex: 'credits',
      key: 'credits',
      width: '6%',
      search: false,
      className: 'column-credits',
    },
    {
      title: (
        <>
          <div>周学时 /</div>
          <div>总学时</div>
        </>
      ),
      dataIndex: 'weeklyHours',
      key: 'weeklyHours',
      width: '12%',
      search: false,
      className: 'column-hours',
      render: (_, record) => {
        // 计算总学时 = 周学时 × 周数
        const totalHours = record.weeklyHours * record.weekCount;
        return (
          <>
            {record.weeklyHours} / {totalHours}
          </>
        );
      },
    },
    {
      title: '上课时间',
      width: '12%',
      key: 'timeSlots',
      className: 'column-index',
      search: false,
      render: (_, record) => (
        <>
          {record.timeSlots.map((slot, index) => {
            // 处理理论课的特殊分割情况
            if (record.courseCategory === 'THEORY') {
              const periodCount = slot.periodEnd - slot.periodStart + 1;

              // 处理3节理论课的情况（123, 234, 567等）
              if (periodCount === 3) {
                return (
                  <div key={index}>
                    <div className="time-slot">
                      {getDayOfWeekText(slot.dayOfWeek)} 第{slot.periodStart}-{slot.periodStart + 1}
                      节
                      {slot.weekType !== 'ALL' && (
                        <Tag className="time-slot-tag" color="blue">
                          {slot.weekType === 'ODD'
                            ? '单周'
                            : slot.weekType === 'EVEN'
                              ? '双周'
                              : slot.weekType}
                        </Tag>
                      )}
                    </div>
                    <div className="time-slot">
                      {getDayOfWeekText(slot.dayOfWeek)} 第{slot.periodEnd}节
                      {slot.weekType !== 'ALL' && (
                        <Tag className="time-slot-tag" color="blue">
                          {slot.weekType === 'ODD'
                            ? '单周'
                            : slot.weekType === 'EVEN'
                              ? '双周'
                              : slot.weekType}
                        </Tag>
                      )}
                    </div>
                  </div>
                );
              }

              // 处理4节理论课的情况（1-4节）
              if (slot.periodStart === 1 && slot.periodEnd === 4) {
                return (
                  <div key={index}>
                    <div className="time-slot">
                      {getDayOfWeekText(slot.dayOfWeek)} 第1-2节
                      {slot.weekType !== 'ALL' && (
                        <Tag className="time-slot-tag" color="blue">
                          {slot.weekType === 'ODD'
                            ? '单周'
                            : slot.weekType === 'EVEN'
                              ? '双周'
                              : slot.weekType}
                        </Tag>
                      )}
                    </div>
                    <div className="time-slot">
                      {getDayOfWeekText(slot.dayOfWeek)} 第3-4节
                      {slot.weekType !== 'ALL' && (
                        <Tag className="time-slot-tag" color="blue">
                          {slot.weekType === 'ODD'
                            ? '单周'
                            : slot.weekType === 'EVEN'
                              ? '双周'
                              : slot.weekType}
                        </Tag>
                      )}
                    </div>
                  </div>
                );
              }
            }

            // 其他情况保持原有显示格式
            return (
              <div key={index} className="time-slot">
                {getDayOfWeekText(slot.dayOfWeek)} 第{slot.periodStart}-{slot.periodEnd}节
                {slot.weekType !== 'ALL' && (
                  <Tag className="time-slot-tag" color="blue">
                    {slot.weekType === 'ODD'
                      ? '单周'
                      : slot.weekType === 'EVEN'
                        ? '双周'
                        : slot.weekType}
                  </Tag>
                )}
              </div>
            );
          })}
        </>
      ),
    },
    {
      title: '上课周次',
      dataIndex: 'weekNumberString',
      key: 'weekNumberString',
      width: '12%',
      search: false,
      className: 'column-weeks',
      render: (_, record) => (
        <Tooltip title={record.weekNumberString}>
          <span>{parseWeekNumberString(record.weekNumberString)}</span>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: '15%',
      className: 'column-index',
      search: false,
      render: (_, record) => {
        if (record.detailLoading) {
          return <LoadingOutlined style={{ fontSize: '16px', color: '#1890ff' }} />;
        }
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              size="middle"
              onClick={() => {
                // 切换展开状态
                const expanded = !record.expanded;

                // 如果展开且没有详细数据，则获取详细数据
                if (expanded && !record.detailData && !record.detailLoading) {
                  fetchDetailData(record);

                  // 如果是一体化课程，显示提示信息
                  if (record.courseCategory === 'INTEGRATED') {
                    message.warning(
                      '一体化课程课程安排需要任课老师自行敲定，此处仅列出按理论课排课规则的上课时间。',
                    );
                  }
                }

                // 更新展开状态
                setProcessedCourses((prev) =>
                  prev.map((item) =>
                    item.scheduleId === record.scheduleId ? { ...item, expanded } : item,
                  ),
                );
              }}
            >
              {record.expanded ? '收起详情' : '查看详情'}
            </Button>
            <Button
              type="primary"
              size="middle"
              loading={record.excelLoading}
              onClick={() => {
                // 如果没有详细数据且不在加载中，则获取详细数据
                if (!record.detailData && !record.detailLoading) {
                  // 设置加载状态
                  setProcessedCourses((prev) =>
                    prev.map((item) =>
                      item.scheduleId === record.scheduleId
                        ? { ...item, detailLoading: true, excelLoading: true }
                        : item,
                    ),
                  );

                  // 获取详细数据
                  fetchDetailData(record)
                    .then((detailData) => {
                      // 直接使用返回的详细数据，而不是从processedCourses中查找
                      if (detailData) {
                        // 使用懒加载的导出函数
                        lazyExportToExcel(
                          record.courseName,
                          record.teachingClassName,
                          detailData.scheduleDetails,
                        );
                      }

                      // 导出完成后，取消加载状态
                      setProcessedCourses((prev) =>
                        prev.map((item) =>
                          item.scheduleId === record.scheduleId
                            ? { ...item, excelLoading: false }
                            : item,
                        ),
                      );
                    })
                    .catch(() => {
                      // 出错时也需要取消加载状态
                      setProcessedCourses((prev) =>
                        prev.map((item) =>
                          item.scheduleId === record.scheduleId
                            ? { ...item, excelLoading: false }
                            : item,
                        ),
                      );
                    });

                  // 如果是一体化课程，显示提示信息
                  if (record.courseCategory === 'INTEGRATED') {
                    message.warning(
                      '一体化课程课程安排需要任课老师自行敲定，此处仅列出按理论课排课规则的上课时间。',
                    );
                  }
                } else if (record.detailData) {
                  // 如果已有详细数据，设置加载状态并导出Excel
                  setProcessedCourses((prev) =>
                    prev.map((item) =>
                      item.scheduleId === record.scheduleId
                        ? { ...item, excelLoading: true }
                        : item,
                    ),
                  );

                  // 使用懒加载的导出Excel
                  lazyExportToExcel(
                    record.courseName,
                    record.teachingClassName,
                    record.detailData.scheduleDetails,
                  );

                  // 导出完成后，取消加载状态
                  setTimeout(() => {
                    setProcessedCourses((prev) =>
                      prev.map((item) =>
                        item.scheduleId === record.scheduleId
                          ? { ...item, excelLoading: false }
                          : item,
                      ),
                    );
                  }, 500); // 短暂延迟以确保用户能看到加载状态
                }
              }}
            >
              生成Excel
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="container">
      <Card className="header-card">
        <div className="header-content">
          <Typography.Title level={4} className="page-title">
            教学计划助手
          </Typography.Title>
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
      <ProTable<ProcessedCourse>
        rowKey="scheduleId"
        columns={columns}
        dataSource={processedCourses}
        loading={loading}
        search={false}
        options={false}
        pagination={false}
        bordered
        cardProps={{ bodyStyle: { padding: 0 } }}
        toolBarRender={false}
        expandable={{
          expandedRowKeys: processedCourses
            .filter((item) => item.expanded)
            .map((item) => item.scheduleId),
          expandedRowRender: (record) => {
            if (!record.detailData) {
              return <Spin tip="加载中..." />;
            }
            return (
              <div className="detail-container">
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th className="auxiliary">周次</th>
                      <th className="auxiliary">周天</th>
                      <th>授课时间</th>
                      <th>学时数</th>
                      <th>节次</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.detailData.scheduleDetails.map(
                      (
                        detail: { week: number; date: string; content: string; hours: number },
                        index: number,
                      ) => {
                        // 从content中提取周几信息
                        const weekdayMatch = detail.content.match(/^(周[一二三四五六日])/);
                        const weekday = weekdayMatch ? weekdayMatch[1] : '';
                        // 从content中移除周几信息，只保留节次信息
                        const contentWithoutWeekday = detail.content.replace(
                          /^周[一二三四五六日]\s/,
                          '',
                        );

                        return (
                          <tr key={`${detail.date}-${index}`}>
                            <td className="center auxiliary">第{detail.week}周</td>
                            <td className="center auxiliary">{weekday}</td>
                            <td>{detail.date}</td>
                            <td className="center">{detail.hours}</td>
                            <td>{contentWithoutWeekday}</td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            );
          },
          showExpandColumn: false, // 隐藏展开按钮列
        }}
      />
    </div>
  );
};

export default PlanAsst;

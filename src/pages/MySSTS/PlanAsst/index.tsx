import {
  getActualTeachingDates,
  getFullScheduleByStaff,
} from '@/services/plan/courseScheduleManager';
import { getSemesters } from '@/services/plan/semester';
import type { FlatCourseSchedule, TeachingDate } from '@/services/plan/types';
import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useModel } from '@umijs/max'; // 用于访问全局状态管理的钩子
import {
  Alert,
  Button,
  Card,
  Dropdown,
  message,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './style.less'; // 引入样式文件，包含页面整体布局的样式

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
  const [jobId] = useState<number | null>(null);
  const [staffIdState, setStaffId] = useState<number | null>(null); // 存储员工 ID
  const [loading, setLoading] = useState<boolean>(true);
  // 添加课表数据状态
  // const [scheduleData, setScheduleData] = useState<FlatCourseSchedule[]>([]);
  // 添加教学日期状态
  const [teachingDates, setTeachingDates] = useState<TeachingDate[]>([]);
  // 添加处理后的课程数据状态
  const [processedCourses, setProcessedCourses] = useState<ProcessedCourse[]>([]);

  // 使用 useEffect 初始化 staffId
  useEffect(() => {
    if (staffId) {
      setStaffId(staffId);
      console.log('员工ID已设置:', staffId);
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

    // 处理 staffId 和 jobId，确保类型正确
    const effectiveStaffId = staffIdState === null ? undefined : staffIdState;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const effectiveJobId = jobId === null ? undefined : jobId;

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
      console.log('处理后的课程数据:', processed);
    };
    // 从后台获取数据
    getFullScheduleByStaff({
      staffId: effectiveStaffId,
      // jobId: effectiveJobId,
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
  }, [semesterId, staffIdState, jobId]); // 添加依赖项

  // 当学期变更时，清空教学日期数据
  const handleSemesterChange = useCallback((newSemester: Semester) => {
    // 清理相关状态数据
    setLoading(true);
    // setScheduleData([]); // 清空课表数据
    setProcessedCourses([]); // 清空处理后的课程数据
    setTeachingDates([]); // 清空教学日期数据，这样切换学期后会重新获取

    // 更新学期信息
    setSemesterId(newSemester.id);
    setSemester(newSemester);
    console.log('学期已切换:', newSemester);
    // 这里可以添加其他与学期相关的数据加载逻辑

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
          // 不需要提供 weeks 参数，获取所有周次的数据
        };

        const teachingDateData = await getActualTeachingDates(teachingDateInput);
        console.log('获取到的教学日期数据:', teachingDateData);

        // 保存教学日期数据到state中
        setTeachingDates(teachingDateData);

        // 使用刚获取的数据，而不是等待状态更新
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

      // 按周次排序
      courseTeachingDates.sort((a, b) => a.week - b.week);

      // 将数字转换为中文数字（1-10）
      const numberToChinese = (num: number): string => {
        const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
        if (num >= 1 && num <= 10) {
          return chineseNumbers[num - 1];
        }
        return num.toString(); // 超出范围返回原数字
      };

      // 将节次范围转换为详细列表（如 "1-3" 转换为 "第一节，第二节，第三节"）
      const periodRangeToDetailedList = (start: number, end: number): string => {
        const periods = [];
        for (let i = start; i <= end; i++) {
          periods.push(`第${numberToChinese(i)}节`);
        }
        return periods.join('，');
      };

      // 构建详细数据
      const detailData = {
        scheduleDetails: courseTeachingDates.flatMap((date) => {
          // 将每个时间段单独作为一条记录
          return date.courses.map(
            (course: { periodStart: number; periodEnd: number; weekType: string }) => ({
              week: date.week,
              date: date.date,
              content: `${getDayOfWeekText(date.weekOfDay)} ${periodRangeToDetailedList(course.periodStart, course.periodEnd)}${
                course.weekType !== 'ALL'
                  ? course.weekType === 'ODD'
                    ? '(单周)'
                    : course.weekType === 'EVEN'
                      ? '(双周)'
                      : ''
                  : ''
              }`,
            }),
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
    } catch (error) {
      console.error('获取详细数据失败:', error);
      // 更新加载状态
      setProcessedCourses((prev) =>
        prev.map((item) =>
          item.scheduleId === record.scheduleId ? { ...item, detailLoading: false } : item,
        ),
      );
    }
  };

  // 定义 ProTable 的列
  const columns: ProColumns<ProcessedCourse>[] = [
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
      search: false,
      render: (_, record) => {
        const { text: categoryText, color } = getCategoryInfo(record.courseCategory);
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.courseName}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.teachingClassName}</div>
            <div>
              <Tag style={{ marginLeft: '4px' }} color={color}>
                {categoryText}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: '学分',
      dataIndex: 'credits',
      key: 'credits',
      width: '8%',
      search: false,
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
      width: '18%',
      key: 'timeSlots',
      search: false,
      render: (_, record) => (
        <>
          {record.timeSlots.map((slot, index) => (
            <div
              key={index}
              style={{ marginBottom: index < record.timeSlots.length - 1 ? '8px' : 0 }}
            >
              {getDayOfWeekText(slot.dayOfWeek)} 第{slot.periodStart}-{slot.periodEnd}节
              {slot.weekType !== 'ALL' && (
                <Tag style={{ marginLeft: '4px' }} color="blue">
                  {slot.weekType === 'ODD'
                    ? '单周'
                    : slot.weekType === 'EVEN'
                      ? '双周'
                      : slot.weekType}
                </Tag>
              )}
            </div>
          ))}
        </>
      ),
    },
    {
      title: '上课周次',
      dataIndex: 'weekNumberString',
      key: 'weekNumberString',
      width: '12%',
      search: false,
      render: (_, record) => (
        <Tooltip title={record.weekNumberString}>
          <span>{parseWeekNumberString(record.weekNumberString)}</span>
        </Tooltip>
      ),
    },
    // 添加操作列，用于展示详情按钮
    {
      title: '操作',
      key: 'action',
      width: '20%',
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
              onClick={() => {
                // 这里添加生成模板的逻辑
                console.log('生成模板', record);
                // 如果需要先获取详细数据
                if (!record.detailData && !record.detailLoading) {
                  fetchDetailData(record);
                }
                // 然后可以调用生成模板的函数
                // generateExcelTemplate(record);
              }}
            >
              生成Excel模板
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <>
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
      {/* 使用 ProTable 替换原来的 Table */}
      <Card style={{ marginTop: 16 }}>
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
            // 恢复默认的展开图标和点击行为
            expandRowByClick: false, // 禁用点击行展开，只通过图标或按钮展开
            expandedRowKeys: processedCourses
              .filter((course) => course.expanded)
              .map((course) => course.scheduleId),
            // 自定义展开图标（可选，如果想要自定义图标样式）
            // expandIcon: ({ expanded, onExpand, record }) => {
            //   return expanded ? (
            //     <MinusOutlined onClick={e => onExpand(record, e)} />
            //   ) : (
            //     <PlusOutlined onClick={e => onExpand(record, e)} />
            //   );
            // },
            onExpand: (expanded, record) => {
              // 如果展开且没有详细数据，则获取详细数据
              if (expanded && !record.detailData && !record.detailLoading) {
                fetchDetailData(record);
              }

              // 更新展开状态
              setProcessedCourses((prev) =>
                prev.map((item) =>
                  item.scheduleId === record.scheduleId ? { ...item, expanded } : item,
                ),
              );
            },
            // 展开行的内容
            expandedRowRender: (record) => {
              // 如果正在加载，显示加载状态
              if (record.detailLoading) {
                return (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <Spin tip="加载中..." />
                  </div>
                );
              }

              // 如果有详细数据，显示详细数据
              if (record.detailData) {
                // 判断是否为一体化课程
                const isIntegratedCourse = record.courseCategory === 'INTEGRATED';

                return (
                  <div style={{ padding: '10px 20px' }}>
                    {/* 为一体化课程添加警告信息 */}
                    {isIntegratedCourse && (
                      <Alert
                        message="一体化课程课程安排需要任课老师自行敲定，无法根据课程表直接计算授课时间，此处仅列出按理论课排课规则的上课时间。"
                        type="warning"
                        showIcon
                        className="warning-message"
                      />
                    )}

                    <table className="detail-table">
                      <thead>
                        <tr>
                          <th>授课时间</th>
                          <th>学时数</th>
                          <th>节次</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.detailData.scheduleDetails.map(
                          (detail: { date: string; content: string }, index: number) => (
                            <tr key={`${detail.date}-${index}`}>
                              <td>{detail.date}</td>
                              <td>2</td>
                              <td>{detail.content.replace(/周[一二三四五六日]\s/, '')}</td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              }

              // 如果没有详细数据，显示提示信息
              return (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <p>暂无详细数据，请点击查看详情按钮获取。</p>
                </div>
              );
            },
          }}
        />
      </Card>
    </>
  );
};

export default PlanAsst;

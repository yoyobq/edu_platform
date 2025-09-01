import { getCalendarEvents } from '@/services/plan/calendarEvent';
import { getSemester, getSemesters } from '@/services/plan/semester';
import { DownOutlined } from '@ant-design/icons';
import { Card, Dropdown, Typography } from 'antd';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isoWeek from 'dayjs/plugin/isoWeek';
import React, { useEffect, useRef, useState } from 'react';
import styles from './SemesterView.less';

// 扩展 dayjs 插件
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isoWeek);

type EventType = 'normal' | 'weekend' | 'holiday' | 'special' | 'exam';

/** 统一返回当天的 topic 与 eventType 以及调课信息 */
interface DayData {
  topic: string;
  eventType: EventType;
  rescheduleInfo?: string;
}

interface SemesterDay {
  date: string; // 格式 YYYY-MM-DD
  type: EventType; // 最终颜色类型
  topic: string; // 当天所有事件合并的 topic 文本
  rescheduleInfo?: string; // 若存在调课信息，则显示“调课 MM-DD(星期)”这样的字符串
}

/** 学期基础信息 */
interface Semester {
  id: number;
  name: string;
  startDate: string; // 格式 YYYY-MM-DD
  examStartDate: string; // 考试开始日期
  firstTeachingDate: string; // 上课开始日期
  endDate: string; // 学期结束日期
  isCurrent: boolean; // 是否是当前学期
}

/** 学期事件信息 */
interface CalendarEvent {
  id: number;
  semesterId: number;
  topic: string;
  date: string; // 格式 YYYY-MM-DD
  timeSlot: 'ALL_DAY' | 'MORNING' | 'AFTERNOON'; // 枚举类型
  eventType: 'HOLIDAY' | 'EXAM' | 'ACTIVITY' | 'HOLIDAY_MAKEUP' | 'WEEKDAY_SWAP' | 'SPORTS_MEET'; // 事件类型
  originalDate?: string | null; // 可能为空
  recordStatus: 'ACTIVE' | 'ACTIVE_TENTATIVE' | 'EXPIRY'; // 记录状态
  version: number;
  createdAt: string; // 格式 YYYY-MM-DD HH:mm:ss
  updatedAt: string; // 格式 YYYY-MM-DD HH:mm:ss
  updatedByAccoutId?: number | null; // 可能为空
}

/**
 * isInThirdLastWeek：以学期结束日的 isoWeek（周一为起点）计算，
 * 倒数第三周的周一 = end.startOf('isoWeek').subtract(2, 'week')
 * 范围为 [thirdLastMonday, thirdLastMonday.add(6, 'day')]
 * ！这个逻辑已被学期表的 exam_start_date 替代！
 */
// function isInThirdLastWeek(dateStr: string, endStr: string): boolean {
//   const date = dayjs(dateStr, 'YYYY-MM-DD');
//   const end = dayjs(endStr, 'YYYY-MM-DD').startOf('isoWeek');
//   const thirdLastMonday = end.subtract(2, 'week');
//   const thirdLastSunday = thirdLastMonday.add(6, 'day');
//   const afterStart = date.isSame(thirdLastMonday, 'day') || date.isAfter(thirdLastMonday, 'day');
//   const beforeEnd = date.isSame(thirdLastSunday, 'day') || date.isBefore(thirdLastSunday, 'day');
//   return afterStart && beforeEnd;
// }

/**
 * getDayData：统一根据日期返回当天的数据
 * 如果存在调课相关事件，则从 original_date 中提取信息，格式为 "与 MM-DD(周X)"。
 */
// 需要同时更新 getDayData 中的字段引用
function getDayData(dateStr: string, semester: Semester, calendarEvents: CalendarEvent[]): DayData {
  const events = calendarEvents.filter(
    (e) => e.semesterId === semester.id && e.date === dateStr && e.recordStatus !== 'EXPIRY',
  );
  const topic = events.length ? events.map((e) => e.topic).join(' · ') : '';
  let eventType: EventType;
  let rescheduleInfo: string | undefined = undefined;

  // 新增日期星期计算
  const weekday = dayjs(dateStr).isoWeekday();

  const rescheduledEvent = events.find(
    (e) => e.eventType === 'WEEKDAY_SWAP' || e.eventType === 'HOLIDAY_MAKEUP',
  );
  if (rescheduledEvent && rescheduledEvent.originalDate) {
    // 修改字段
    const orig = dayjs(rescheduledEvent.originalDate); // 修改字段
    const origDateStr = orig.format('MM-DD');
    const weekdayMap: { [key: number]: string } = {
      1: '一',
      2: '二',
      3: '三',
      4: '四',
      5: '五',
      6: '六',
      7: '日',
    };
    const origWeekday = orig.isoWeekday();
    rescheduleInfo = `调 ${origDateStr} 课(周${weekdayMap[origWeekday]})`;
  }

  // 修改字段引用为 eventType
  if (events.length > 0) {
    if (events.some((e) => e.eventType === 'HOLIDAY')) {
      eventType = 'holiday';
    } else if (events.some((e) => ['SPORTS_MEET', 'ACTIVITY'].includes(e.eventType))) {
      eventType = 'special';
    } else if (rescheduledEvent) {
      eventType = 'normal';
    } else {
      eventType = 'normal';
    }
  } else {
    // 使用计算出的 weekday 判断周末
    eventType = weekday === 6 || weekday === 7 ? 'weekend' : 'normal';
  }

  const examStart = dayjs(semester.examStartDate);
  const examEnd = examStart.add(4, 'day'); // 考试周为周一起连续4天
  if (
    eventType === 'normal' &&
    dayjs(dateStr).isSameOrAfter(examStart, 'day') &&
    dayjs(dateStr).isSameOrBefore(examEnd, 'day')
  ) {
    eventType = 'exam';
  }
  return { topic, eventType, rescheduleInfo };
}

interface WeekData {
  weekIndex: number; // 0 => 准备周, 1,2,3...
  days: SemesterDay[]; // 这一周包含的日期
}

/**
 * 将学期全部日期分周:
 * 根据 firstTeachingDate 所在的周确定第1周
 * firstTeachingDate 之前的日期为准备周(week 0)
 * firstTeachingDate 所在的周开始为第1周
 */
function splitDaysIntoWeeks(allDays: SemesterDay[], firstTeachingDate: string): WeekData[] {
  const result: WeekData[] = [];
  let temp: SemesterDay[] = [];
  let currentWeekIndex = 0; // 0 => 准备周

  // 计算 firstTeachingDate 所在周的周一
  const firstTeaching = dayjs(firstTeachingDate);
  const firstTeachingWeekStart = firstTeaching.startOf('isoWeek'); // 该周的周一

  for (let i = 0; i < allDays.length; i++) {
    const dayObj = allDays[i];
    const d = dayjs(dayObj.date);
    const wd = d.isoWeekday(); // 1=Mon,...7=Sun

    if (wd === 1 && temp.length > 0) {
      // 遇到周一 => 结束上一周, push 到result
      result.push({ weekIndex: currentWeekIndex, days: temp });
      temp = [];

      // 判断当前周一是否是 firstTeachingDate 所在周的周一或之后
      if (d.isSameOrAfter(firstTeachingWeekStart, 'day')) {
        if (currentWeekIndex === 0) {
          currentWeekIndex = 1; // 从准备周进入第1周
        } else {
          currentWeekIndex++; // 正常递增
        }
      }
      // 如果还在 firstTeachingDate 之前，保持为准备周(0)
    }
    temp.push(dayObj);
  }

  if (temp.length > 0) {
    result.push({ weekIndex: currentWeekIndex, days: temp });
  }

  return result;
}

const dayHeaders = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

interface SemesterViewProps {
  onDateSelect?: (date: string) => void;
}

const SemesterView: React.FC<SemesterViewProps> = ({ onDateSelect }) => {
  // 学期列表数组
  const [semesters, setSemesters] = useState<Semester[]>([]); // 所有可用学期
  const [loadingSemesters, setLoadingSemesters] = useState<boolean>(true);

  // 单个学期数据
  const [semester, setSemester] = useState<Semester | null>(null); // 当前学期
  const [loadingSemester, setLoadingSemester] = useState<boolean>(true);

  // 修改初始化类型为 number | null
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const [weeks, setWeeks] = useState<WeekData[]>([]);

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);

  const todayRef = useRef<HTMLDivElement | null>(null);
  // **获取所有学期信息**
  useEffect(() => {
    setLoadingSemesters(true);
    getSemesters({})
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => dayjs(b.startDate).unix() - dayjs(a.startDate).unix(),
        );
        setSemesters(sorted);

        const current = sorted.find((s) => s.isCurrent);
        const latest = sorted[0];
        // 确保ID有效时更新
        if (current?.id || latest?.id) {
          setSemesterId(current?.id ?? latest!.id);
        }
      })
      .catch((error) => console.error('获取学期列表失败:', error))
      .finally(() => setLoadingSemesters(false));
  }, []);

  // **获取选中学期信息**
  useEffect(() => {
    if (!semesterId) return; // 添加空值校验

    setLoadingSemester(true); // 开始加载
    getSemester(semesterId) // 通过 getSemester 获取学期信息
      .then((data) => {
        setSemester(data);
        setLoadingSemester(false); // 加载成功
      })
      .catch((error) => {
        console.error('获取学期信息失败:', error);
        setLoadingSemester(false); // 加载失败
      });
  }, [semesterId]);

  // 1) 生成所有日期 => 2) 分周 => 3) setWeeks
  useEffect(() => {
    if (!semester || calendarEvents.length === 0) return;

    const start = dayjs(semester.startDate);
    const end = dayjs(semester.endDate);
    const totalDays = end.diff(start, 'day') + 1;
    const allDays: SemesterDay[] = [];
    for (let i = 0; i < totalDays; i++) {
      const current = start.add(i, 'day');
      const dateStr = current.format('YYYY-MM-DD');
      // 解构时同时取出 rescheduleInfo
      const { topic, eventType, rescheduleInfo } = getDayData(dateStr, semester, calendarEvents);
      allDays.push({ date: dateStr, topic, type: eventType, rescheduleInfo });
    }

    const splitted = splitDaysIntoWeeks(allDays, semester.firstTeachingDate);
    setWeeks(splitted);

    // // 数据加载完成后，添加一个延时，确保DOM已经渲染
    // setTimeout(() => {
    //   const today = document.querySelector(`.${styles.today}`);
    //   if (today) {
    //     // 滚动到今天的位置，并向上偏移300px，让今天显示在页面中上部
    //     today.scrollIntoView({ behavior: 'smooth', block: 'center' });
    //     window.scrollBy(0, 300);
    //   }
    // }, 500);
  }, [semester, calendarEvents]); // 依赖 semester，calendarEvents 数据加载后会自动更新

  // 使用 loading 状态判断数据是否加载完成
  useEffect(() => {
    setTimeout(() => {
      if (!loadingSemesters && !loadingSemester && !loadingEvents && todayRef.current) {
        // 滚动到今天的位置，让今天显示在页面中部
        todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // window.scrollBy(0, 250);
      }
    }, 500);
  }, [loadingSemesters, loadingSemester, loadingEvents]);

  // **获取校历事件**
  useEffect(() => {
    if (!semesterId) return; // 避免 semesterId 为空时报错
    setLoadingEvents(true);

    getCalendarEvents(semesterId)
      .then((events) => {
        // console.log('获取的事件列表:', events);
        setCalendarEvents(events);
      })
      // .catch((error) => {
      // console.error('获取校历事件失败:', error);
      // })
      .finally(() => {
        setLoadingEvents(false);
      });
  }, [semesterId]); // 当 semesterId 变化时，重新加载事件

  // **如果加载中，显示占位 UI**
  if (loadingSemesters || loadingSemester || loadingEvents) {
    return <Card loading>加载学期数据中...</Card>;
  }

  // **如果 semester 仍然为空，或学期事件未正确加载，显示错误信息**
  if (!semester || calendarEvents.length === 0) {
    return <Card>学期数据加载失败，请稍后重试。</Card>;
  }

  /** 渲染顶部表头 */
  const renderHeaderRow = () => {
    return (
      <div className={styles.headerRow}>
        <div className={styles.blankCell}></div> {/* 左上角空白 */}
        {dayHeaders.map((h) => (
          <div key={h} className={styles.headerCell}>
            {h}
          </div>
        ))}
      </div>
    );
  };
  /** 渲染日期方格 */
  const renderDayCell = (day: SemesterDay) => {
    const isToday = dayjs(day.date).isSame(dayjs(), 'day');
    const date = dayjs(day.date);
    const isFirstDay = date.date() === 1; // 判断是否为每月1号
    const monthName = date.format('M月'); // 获取月份名称

    return (
      <div
        key={day.date}
        // id={isToday ? 'today-cell' : undefined}
        ref={isToday ? todayRef : null}
        className={`${styles.dayCard} ${styles[day.type]} ${isToday ? styles.today : ''}`}
        onClick={() => onDateSelect?.(day.date)}
      >
        <div
          className={`${styles.dateText} ${isFirstDay ? styles.firstDay : ''}`}
          data-month={isFirstDay ? monthName : ''}
        >
          {date.format('MM-DD')}
        </div>
        <div className={styles.topicText}>
          {day.type === 'exam' && <div className={styles.examLabel}>考试周</div>}
          {day.rescheduleInfo && <div className={styles.rescheduleLabel}>{day.rescheduleInfo}</div>}
          {!day.rescheduleInfo && <div>{day.topic}</div>}
        </div>
      </div>
    );
  };

  /** 渲染一周: 第一列 => 周数, 后面7列 => 日期方格 */
  const renderWeekRow = (weekData: WeekData) => {
    const { weekIndex, days } = weekData;
    const label = weekIndex === 0 ? '' : `${weekIndex}`;
    // 如果天数不满7天 => 需要补足
    // 先找出 days[] 中每个 day 的 isoWeekday => 放在正确列
    const cells: (JSX.Element | null)[] = new Array(7).fill(null);

    days.forEach((day) => {
      const w = dayjs(day.date).isoWeekday(); // 1..7
      cells[w - 1] = renderDayCell(day);
    });

    return (
      <div className={styles.weekRow} key={weekIndex}>
        <div className={styles.weekLabelCell}>{label}</div>
        {cells.map((c, idx) => c || <div key={idx} className={styles.emptyDay}></div>)}
      </div>
    );
  };

  const handleMenuClick = (e: any) => {
    const selectedSemester = semesters.find((s) => s.id === parseInt(e.key, 10));
    if (selectedSemester) {
      console.log(selectedSemester.id);
      setSemesterId(selectedSemester.id);
      console.log(`切换到: ${selectedSemester.name}`);
    }
  };

  const menuItems = semesters.map((s) => ({
    key: s.id.toString(),
    label: s.name,
  }));

  return (
    <Card
      title={
        <Dropdown.Button
          menu={{
            items: menuItems,
            onClick: handleMenuClick,
          }}
          trigger={['click']}
          icon={<DownOutlined />}
        >
          <Typography.Title level={4} style={{ cursor: 'pointer', margin: 0 }}>
            {semester?.name}校历
          </Typography.Title>
        </Dropdown.Button>
      }
    >
      <div className={styles.semesterContainer}>
        {renderHeaderRow()}
        {weeks.map((w) => renderWeekRow(w))}
      </div>
    </Card>
  );
};

export default SemesterView;

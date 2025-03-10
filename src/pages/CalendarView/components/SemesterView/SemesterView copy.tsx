// SemesterView.tsx
import { Card } from 'antd';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isoWeek from 'dayjs/plugin/isoWeek';
import React, { useEffect, useState } from 'react';
import styles from './SemesterView.less';

// 扩展插件
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isoWeek);

type EventType = 'normal' | 'weekend' | 'holiday' | 'special' | 'exam';

interface SemesterDay {
  date: string; // 格式 YYYY-MM-DD
  type: EventType; // 最终颜色类型
  topic: string; // 当天所有事件合并的 topic 文本
  rescheduleInfo?: string; // 若存在调课信息，则显示“调课 MM-DD(星期)”这样的字符串
}

const semester = {
  id: 2,
  name: '2425第二学期',
  start_date: '2025-02-14',
  end_date: '2025-06-29',
  is_current: 1,
};

const mockCalendarEvents = [
  {
    id: 1,
    semester_id: 2,
    topic: '校领导报到',
    date: '2025-02-14',
    time_slot: 'all_day',
    event_type: 'activity',
    original_date: null,
    record_status: 'active',
    version: 1,
    updated_at: '2025-02-28 09:37:00',
    updated_by_accout_id: 2,
  },
  {
    id: 2,
    semester_id: 2,
    topic: '教职工报到',
    date: '2025-02-15',
    time_slot: 'all_day',
    event_type: 'activity',
    original_date: null,
    record_status: 'active',
    version: 1,
    updated_at: '2025-02-28 09:37:53',
    updated_by_accout_id: 2,
  },
  {
    id: 3,
    semester_id: 2,
    topic: '学生报到',
    date: '2025-02-16',
    time_slot: 'all_day',
    event_type: 'activity',
    original_date: null,
    record_status: 'active',
    version: 1,
    updated_at: '2025-02-28 10:19:48',
    updated_by_accout_id: 2,
  },
  {
    id: 4,
    semester_id: 2,
    topic: '调课',
    date: '2025-04-02',
    time_slot: 'all_day',
    event_type: 'weekday_swap',
    original_date: '2025-04-03',
    record_status: 'active',
    version: 1,
    updated_at: '2025-02-28 11:33:07',
    updated_by_accout_id: 2,
  },
  {
    id: 5,
    semester_id: 2,
    topic: '调课',
    date: '2025-04-03',
    time_slot: 'all_day',
    event_type: 'weekday_swap',
    original_date: '2025-04-02',
    record_status: 'active',
    version: 1,
    updated_at: '2025-02-28 11:33:12',
    updated_by_accout_id: 2,
  },
  {
    id: 6,
    semester_id: 2,
    topic: '清明放假',
    date: '2025-04-04',
    time_slot: 'all_day',
    event_type: 'holiday',
    original_date: null,
    record_status: 'active',
    version: 1,
    updated_at: '2025-02-28 10:23:59',
    updated_by_accout_id: 2,
  },
  {
    id: 9,
    semester_id: 2,
    topic: '调课',
    date: '2025-04-27',
    time_slot: 'all_day',
    event_type: 'holiday_makeup',
    original_date: '2025-05-05',
    record_status: 'active',
    version: 1,
    updated_at: '2025-02-28 10:28:13',
    updated_by_accout_id: 2,
  },
  {
    id: 10,
    semester_id: 2,
    topic: '劳动节放假',
    date: '2025-05-01',
    time_slot: 'all_day',
    event_type: 'holiday',
    original_date: null,
    record_status: 'active',
    version: 1,
    updated_at: '2025-02-28 10:27:14',
    updated_by_accout_id: 2,
  },
  {
    id: 11,
    semester_id: 2,
    topic: '劳动节放假',
    date: '2025-05-02',
    time_slot: 'all_day',
    event_type: 'holiday',
    original_date: null,
    record_status: 'active',
    version: 1,
    updated_at: '2025-02-28 10:27:14',
    updated_by_accout_id: 2,
  },
  {
    id: 14,
    semester_id: 2,
    topic: '劳动节放假',
    date: '2025-05-05',
    time_slot: 'all_day',
    event_type: 'holiday',
    original_date: null,
    record_status: 'active',
    version: 1,
    updated_at: '2025-02-28 10:27:14',
    updated_by_accout_id: 2,
  },
  {
    id: 15,
    semester_id: 2,
    topic: '端午节放假',
    date: '2025-06-02',
    time_slot: 'all_day',
    event_type: 'holiday',
    original_date: null,
    record_status: 'active',
    version: 1,
    updated_at: '2025-02-28 11:21:58',
    updated_by_accout_id: 2,
  },
  {
    id: 16,
    semester_id: 2,
    topic: '运动会',
    date: '2025-04-24',
    time_slot: 'all_day',
    event_type: 'sports_meet',
    original_date: null,
    record_status: 'active_tentative',
    version: 1,
    updated_at: '2025-02-28 10:58:20',
    updated_by_accout_id: 2,
  },
  {
    id: 17,
    semester_id: 2,
    topic: '运动会',
    date: '2025-04-25',
    time_slot: 'all_day',
    event_type: 'sports_meet',
    original_date: null,
    record_status: 'active_tentative',
    version: 1,
    updated_at: '2025-02-28 10:58:57',
    updated_by_accout_id: 2,
  },
];

/** 统一返回当天的 topic 与 eventType 以及调课信息 */
interface DayData {
  topic: string;
  eventType: EventType;
  rescheduleInfo?: string;
}

/**
 * isInThirdLastWeek：以学期结束日的 isoWeek（周一为起点）计算，
 * 倒数第三周的周一 = end.startOf('isoWeek').subtract(2, 'week')
 * 范围为 [thirdLastMonday, thirdLastMonday.add(6, 'day')]
 */
function isInThirdLastWeek(dateStr: string, endStr: string): boolean {
  const date = dayjs(dateStr, 'YYYY-MM-DD');
  const end = dayjs(endStr, 'YYYY-MM-DD').startOf('isoWeek');
  const thirdLastMonday = end.subtract(2, 'week');
  const thirdLastSunday = thirdLastMonday.add(6, 'day');
  const afterStart = date.isSame(thirdLastMonday, 'day') || date.isAfter(thirdLastMonday, 'day');
  const beforeEnd = date.isSame(thirdLastSunday, 'day') || date.isBefore(thirdLastSunday, 'day');
  return afterStart && beforeEnd;
}

/**
 * getDayData：统一根据日期返回当天的数据
 * 如果存在调课相关事件，则从 original_date 中提取信息，格式为 "与 MM-DD(周X)"。
 */
function getDayData(dateStr: string): DayData {
  const d = dayjs(dateStr);
  const weekday = d.isoWeekday(); // 1=Monday ... 7=Sunday
  const events = mockCalendarEvents.filter(
    (e) => e.semester_id === semester.id && e.date === dateStr && e.record_status !== 'expiry',
  );
  const topic = events.length ? events.map((e) => e.topic).join(', ') : '';
  let eventType: EventType;
  let rescheduleInfo: string | undefined = undefined;

  // 如果存在调课事件，则取 original_date
  const rescheduledEvent = events.find(
    (e) => e.event_type === 'weekday_swap' || e.event_type === 'holiday_makeup',
  );
  if (rescheduledEvent && rescheduledEvent.original_date) {
    const orig = dayjs(rescheduledEvent.original_date);
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
    rescheduleInfo = `调 ${origDateStr}(${weekdayMap[origWeekday]})`;
  }

  if (events.length > 0) {
    if (events.some((e) => e.event_type === 'holiday')) {
      eventType = 'holiday';
    } else if (events.some((e) => e.event_type === 'exam')) {
      eventType = 'exam';
    } else if (events.some((e) => ['sports_meet', 'activity'].includes(e.event_type))) {
      eventType = 'special';
    } else if (rescheduledEvent) {
      eventType = 'normal';
    } else {
      eventType = 'normal';
    }
  } else {
    eventType = weekday === 6 || weekday === 7 ? 'weekend' : 'normal';
  }

  // 如果处于倒数第三周且 eventType 为 normal 或 weekend，则覆盖为 exam
  if (isInThirdLastWeek(dateStr, semester.end_date) && eventType === 'normal') {
    eventType = 'exam';
  }

  return { topic, eventType, rescheduleInfo };
}

interface SemesterViewProps {
  onDateSelect?: (date: string) => void;
}

const SemesterView: React.FC<SemesterViewProps> = ({ onDateSelect }) => {
  const [days, setDays] = useState<SemesterDay[]>([]);

  useEffect(() => {
    const start = dayjs(semester.start_date);
    const end = dayjs(semester.end_date);
    const totalDays = end.diff(start, 'day') + 1;
    const generated: SemesterDay[] = [];

    for (let i = 0; i < totalDays; i++) {
      const current = start.add(i, 'day');
      const dateStr = current.format('YYYY-MM-DD');
      const dayData = getDayData(dateStr);
      generated.push({
        date: dateStr,
        type: dayData.eventType,
        topic: dayData.topic,
        rescheduleInfo: dayData.rescheduleInfo,
      });
    }
    setDays(generated);
  }, []);

  const renderDayCard = (day: SemesterDay) => (
    <div
      key={day.date}
      className={`${styles.dayCard} ${styles[day.type]}`}
      onClick={() => onDateSelect?.(day.date)}
    >
      <div className={styles.dateText}>{dayjs(day.date).format('MM-DD')}</div>
      <div className={styles.topicText}>
        {day.type === 'exam' && <div className={styles.examLabel}>考试周</div>}
        {day.rescheduleInfo && <div className={styles.rescheduleLabel}>{day.rescheduleInfo}</div>}
        {!day.rescheduleInfo && <div>{day.topic}</div>}
      </div>
    </div>
  );

  const rows: React.ReactNode[] = [];
  let cells: React.ReactNode[] = [];

  const firstWeekday = dayjs(semester.start_date).isoWeekday(); // Monday = 1
  for (let i = 1; i < firstWeekday; i++) {
    cells.push(<div key={`empty-start-${i}`} className={styles.emptyDay} />);
  }

  days.forEach((day, idx) => {
    cells.push(renderDayCard(day));
    if (cells.length % 7 === 0 || idx === days.length - 1) {
      rows.push(
        <div key={`row-${idx}`} className={styles.weekRow}>
          {cells}
        </div>,
      );
      cells = [];
    }
  });

  return (
    <Card title={`学期视图：${semester.name}`}>
      <div className={styles.semesterContainer}>{rows}</div>
    </Card>
  );
};

export default SemesterView;

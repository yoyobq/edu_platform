import { Card } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import styles from './SemesterView.less';

type EventType = 'normal' | 'weekend' | 'holiday' | 'special' | 'exam';

interface SemesterDay {
  date: string;
  type: EventType;
}

const semester = {
  id: 2,
  name: '2425第二学期',
  start_date: '2025-02-14',
  end_date: '2025-06-29',
  is_current: 1,
};

const specialDates: Record<string, EventType> = {
  '2025-02-14': 'special',
  '2025-05-01': 'holiday',
  '2025-05-02': 'holiday',
  '2025-05-03': 'holiday',
  '2025-06-08': 'exam',
};

interface SemesterViewProps {
  onDateSelect?: (date: string) => void;
}

const SemesterView: React.FC<SemesterViewProps> = ({ onDateSelect }) => {
  const [days, setDays] = useState<SemesterDay[]>([]);

  useEffect(() => {
    const start = dayjs(semester.start_date);
    const end = dayjs(semester.end_date);
    const totalDays = end.diff(start, 'day') + 1;

    const generatedDays: SemesterDay[] = Array.from({ length: totalDays }).map((_, i) => {
      const current = start.add(i, 'day');
      const weekday = current.day();
      const dateStr = current.format('YYYY-MM-DD');

      let type: EventType = weekday === 0 || weekday === 6 ? 'weekend' : 'normal';

      if (specialDates[dateStr]) {
        type = specialDates[dateStr];
      }

      return { date: dateStr, type };
    });

    setDays(generatedDays);
  }, []);

  const renderDayCard = (day: SemesterDay) => (
    <div
      key={day.date}
      className={`${styles.dayCard} ${styles[day.type]}`}
      onClick={() => onDateSelect?.(day.date)}
    >
      {dayjs(day.date).format('MM-DD')}
    </div>
  );

  const rows: React.ReactNode[] = [];
  let cells: React.ReactNode[] = [];

  const firstDayWeek = dayjs(semester.start_date).day() || 7;
  for (let i = 1; i < firstDayWeek; i++)
    cells.push(<div key={`empty-start-${i}`} className={styles.emptyDay}></div>);

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

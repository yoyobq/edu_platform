import { Card, Progress } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import styles from './DayView.less';

interface BasicInfoProps {
  date: string;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ date }) => {
  const weekNumber = dayjs(date).diff(dayjs('2025-02-14'), 'week') + 1;
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][dayjs(date).day()];
  const day = dayjs(date).date();
  const month = dayjs(date).month() + 1;

  // 获取季节图标
  const getSeasonIcon = () => {
    const m = dayjs(date).month() + 1;
    if (m >= 3 && m <= 5) return '🌸'; // 春季
    if (m >= 6 && m <= 8) return '☀️'; // 夏季
    if (m >= 9 && m <= 11) return '🍂'; // 秋季
    return '❄️'; // 冬季
  };

  // 计算学期信息
  const getSemesterInfo = () => {
    const year = dayjs(date).year();
    const month = dayjs(date).month() + 1;

    if (month >= 9 || month <= 1) {
      return `${year}-${year + 1}学年第一学期`;
    } else {
      return `${year - 1}-${year}学年第二学期`;
    }
  };

  // 计算教学周进度
  const getWeekProgress = () => {
    // 假设一个学期有20周
    const totalWeeks = 20;
    const percent = Math.min(Math.round((weekNumber / totalWeeks) * 100), 100);
    return percent;
  };

  return (
    <Card className={styles.basicInfoCard}>
      <div className={styles.calendarContainer}>
        <div className={styles.calendarHeader}>
          {/* <span className={styles.month}>{month}月</span> */}
          <span className={styles.year}>{dayjs(date).year()}</span>
        </div>
        <div className={styles.calendarBody}>
          <div className={styles.dayNumber}>
            <span className={styles.dayValue}>{day}</span>
            <span className={styles.monthValue}>{month}月</span>
          </div>
          <div className={styles.weekInfo}>
            <div className={styles.weekday}>星期{weekday}</div>
            <div className={styles.weekProgressContainer}>
              <Progress
                percent={getWeekProgress()}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                format={() => `第 ${weekNumber} 周`}
                className={styles.weekProgressBar}
                size={{ height: 40 }}
                percentPosition={{ align: 'center', type: 'inner' }}
              />
            </div>
          </div>
        </div>
        <div className={styles.calendarFooter}>
          <div className={styles.seasonWatermark}>{getSeasonIcon()}</div>
          <span>{getSemesterInfo()}</span>
        </div>
      </div>
    </Card>
  );
};

export default BasicInfo;

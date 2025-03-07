import { Card } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface BasicInfoProps {
  date: string;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ date }) => {
  const weekNumber = dayjs(date).diff(dayjs('2025-02-14'), 'week') + 1;
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][dayjs(date).day()];

  return (
    <Card title="基本信息" style={{ height: '100%' }}>
      <p>
        <strong>日期：</strong>
        {date}
      </p>
      <p>
        第 {weekNumber} 周 星期{weekday}
      </p>
    </Card>
  );
};

export default BasicInfo;

// src/pages/CalendarView/index.tsx
import { Card } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import DayView from './components/DayView/DayView';
import SemesterView from './components/SemesterView/SemesterView';

const CalendarPage: React.FC = () => {
  const [view, setView] = useState<'day' | 'semester'>('semester');
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setView('day');
  };

  const handleBackToSemester = () => {
    setView('semester');
  };

  return (
    <Card style={{ marginTop: 20 }}>
      {view === 'semester' && <SemesterView onDateSelect={handleDateSelect} />}
      {view === 'day' && <DayView date={selectedDate} onBackToSemester={handleBackToSemester} />}
    </Card>
  );
};

export default CalendarPage;

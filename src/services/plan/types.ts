export interface Semester {
  id: number;
  schoolYear: number;
  termNumber: number;
  name: string;
  startDate: string;
  examStartDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface CreateSemesterInput {
  schoolYear: number;
  termNumber: number;
  name: string;
  startDate: string;
  examStartDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface UpdateSemesterInput {
  schoolYear?: number;
  termNumber?: number;
  name?: string;
  startDate?: string;
  examStartDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

export interface CalendarEvent {
  id: number;
  semesterId: number;
  topic: string;
  date: string;
  timeSlot: 'ALL_DAY' | 'MORNING' | 'AFTERNOON';
  eventType: 'HOLIDAY' | 'EXAM' | 'ACTIVITY' | 'HOLIDAY_MAKEUP' | 'WEEKDAY_SWAP' | 'SPORTS_MEET';
  originalDate?: string | null;
  recordStatus: 'ACTIVE' | 'ACTIVE_TENTATIVE' | 'EXPIRY';
  version: number;
  createdAt: string;
  updatedAt: string;
  updatedByAccoutId?: number | null;
}

export interface CreateCalendarEventInput {
  semesterId: number;
  topic: string;
  date: string;
  timeSlot: 'ALL_DAY' | 'MORNING' | 'AFTERNOON';
  eventType: 'HOLIDAY' | 'EXAM' | 'ACTIVITY' | 'HOLIDAY_MAKEUP' | 'WEEKDAY_SWAP' | 'SPORTS_MEET';
  originalDate?: string | null;
  recordStatus: 'ACTIVE' | 'ACTIVE_TENTATIVE' | 'EXPIRY';
  updatedByAccoutId?: number | null;
}

export interface UpdateCalendarEventInput {
  topic?: string;
  date?: string;
  timeSlot?: 'ALL_DAY' | 'MORNING' | 'AFTERNOON';
  eventType?: 'HOLIDAY' | 'EXAM' | 'ACTIVITY' | 'HOLIDAY_MAKEUP' | 'WEEKDAY_SWAP' | 'SPORTS_MEET';
  originalDate?: string | null;
  recordStatus?: 'ACTIVE' | 'ACTIVE_TENTATIVE' | 'EXPIRY';
  updatedByAccoutId?: number | null;
}

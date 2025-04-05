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

export interface TeachingDate {
  date: string;
  weekOfDay: number;
  weekNumber: number;
  courses: TeachingCourse[];
}

export interface TeachingCourse {
  scheduleId: number;
  courseName: string;
  slotId: number;
  periodStart: number;
  periodEnd: number;
  weekType: string;
  coefficient: number;
}

export interface CancelledTeachingDate {
  date: string;
  weekOfDay: number;
  weekNumber: number;
  note?: string;
  courses: TeachingCourse[];
}

export interface TeachingHourSummary {
  staffId: number;
  sstsTeacherId: string;
  staffName: string;
  totalHours: number;
}

export interface TeachingDateInput {
  semesterId: number;
  staffId?: number;
  sstsTeacherId?: string;
  weeks?: number[];
}

export interface BatchTeachingHourFilter {
  semesterId: number;
  staffIds?: number[];
  sstsTeacherIds?: string[];
  weeks?: number[];
}

export interface CourseSlot {
  id: number;
  weekDay: number;
  periodStart: number;
  periodEnd: number;
  weekType: string;
}

export interface CourseSourceMap {
  id: number;
  courseScheduleId: number;
  lecturePlanId: string;
  courseId: string;
  teacherInChargeId: string;
  teachingClassId: string;
  staffId: number;
  semesterId: number;
}

export interface CourseSchedule {
  id: number;
  staffId: number;
  staffName: string;
  teachingClassName: string;
  classroomId?: number;
  classroomName?: string;
  courseId?: number;
  courseName?: string;
  semesterId: number;
  weekCount?: number;
  weeklyHours?: number;
  credits?: number;
  coefficient: number;
  courseCategory: 'REQUIRED' | 'ELECTIVE' | 'CLUB' | 'CLASS_MEETING' | 'OTHER';
  weekNumberString?: string;
  slots?: CourseSlot[];
  sourceMap?: CourseSourceMap;
}

export interface FlatCourseSchedule {
  scheduleId: number;
  courseName: string;
  staffId: number;
  staffName: string;
  teachingClassName: string;
  classroomName?: string;
  semesterId: number;
  courseCategory: string;
  credits?: number;
  weekCount?: number;
  weeklyHours?: number;
  coefficient: string;
  weekNumberString?: string;
  slotId: number;
  dayOfWeek: number;
  periodStart: number;
  periodEnd: number;
  weekType: string;
}

export interface Semester {
  id: number;
  schoolYear: number;
  termNumber: number;
  name: string;
  startDate: string;
  firstTeachingDate: string;
  examStartDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface CreateSemesterInput {
  schoolYear: number;
  termNumber: number;
  name: string;
  startDate: string;
  firstTeachingDate: string;
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
  courseCategory: 'THEORY' | 'PRACTICE' | 'INTEGRATED' | 'CLUB' | 'CLASS_MEETING' | 'OTHER';
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

/**
 * 教学工作量项目详细信息
 */
export interface TeachingWorkloadItem {
  /** 课程名称 */
  courseName: string;
  /** 教学班级名称 */
  teachingClassName: string;
  /** 每周教学时数 */
  weeklyHours: number;
  /** 教学周数 */
  weekCount: number;
  /** 工作量系数 */
  coefficient: number;
  /** 工作量时数，计算公式：每周教学时数 × 教学周数 × 工作量系数 */
  workloadHours: number;
}

/**
 * 教职工工作量信息
 */
export interface StaffWorkload {
  /** 教职工的唯一标识符 */
  staffId: string | number;
  /** 教职工姓名 */
  staffName: string;
  /** 教职工的教学工作量项目列表 */
  items: TeachingWorkloadItem[];
  /** 总工作时数 */
  totalHours: number;
}

/**
 * 多个教师工作量的筛选输入
 */
export interface StaffWorkloadFilter {
  /** 学期ID */
  semesterId: string | number;
  /** 教师ID列表 */
  staffIds?: number[];
  /** SSTS教师ID列表 */
  sstsTeacherIds?: string[];
}

/**
 * 单个教师工作量查询输入（staffId、sstsTeacherId二选一）
 */
export interface StaffWorkloadSingleInput {
  /** 学期ID */
  semesterId: string | number;
  /** 教师ID */
  staffId?: number;
  /** SSTS教师ID */
  sstsTeacherId?: string;
}

// 扣课信息查询输入
export interface CancelledCoursesInput {
  semesterId: number | string;
  staffIds?: number[];
  sstsTeacherIds?: string[];
  weeks?: number[];
}

// 单个教师扣课信息查询输入
export interface CancelledCoursesSingleInput {
  semesterId: number | string;
  staffId?: number;
  sstsTeacherId?: string;
  weeks?: number[];
}

// 表示教师的扣课信息
export interface StaffCancelledCourses {
  // 教职工的唯一标识符
  staffId: string | number;
  // 校园网教师工号
  sstsTeacherId?: string;
  // 教职工姓名
  staffName: string;
  // 扣课日期列表
  cancelledDates: CancelledDate[];
  // 总扣课时数
  totalCancelledHours: number;
  // 教师课程安排列表（按课程ID分组后的简化信息）
  flatSchedules?: CourseScheduleSummary[];
}

// 表示单个扣课日期的详细信息
export interface CancelledDate {
  // 日期，格式为 YYYY-MM-DD
  date: string;
  // 星期几 (1-7)
  weekOfDay: number;
  // 学期第几周
  weekNumber: number;
  // 该日期下被取消的课程列表
  courses: CancelledCourse[];
}

// 表示单个被取消的课程
export interface CancelledCourse {
  // 课程安排ID
  scheduleId: number;
  // 课程名称
  courseName: string;
  // 课时ID
  slotId: string | number;
  // 开始节次
  periodStart: number;
  // 结束节次
  periodEnd: number;
  // 周类型 (ALL, ODD, EVEN)
  weekType: string;
  // 工作量系数
  coefficient: string;
  // 扣课时数
  cancelledHours: number;
  // 教学班级名称（可选）
  teachingClassName?: string;
}

// 课程安排摘要信息
export interface CourseScheduleSummary {
  // 课程表ID
  scheduleId: number;
  // 课程名称
  courseName: string;
  // 教学班级名称
  teachingClassName: string;
  // 教学周数
  weekCount: number;
  // 每周教学时数
  weeklyHours: number;
}

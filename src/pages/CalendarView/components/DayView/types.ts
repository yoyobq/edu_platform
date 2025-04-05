export interface CourseSlot {
  id: number;
  weekDay: number;
  periodStart: number;
  periodEnd: number;
  weekType: string;
}

// CourseSourceMap 并不是要暴露给用户的数据，仅在调试阶段保留
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

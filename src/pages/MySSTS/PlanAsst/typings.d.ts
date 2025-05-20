// 定义学期类型接口
interface Semester {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  firstTeachingDate?: string;
  examStartDate?: string;
  isCurrent: boolean;
}

// 定义处理后的课程数据接口
interface ProcessedCourse {
  scheduleId: number;
  courseName: string;
  staffName: string;
  teachingClassName: string;
  classroomName: string;
  courseCategory: string;
  credits: number;
  weekCount: number;
  weeklyHours: number;
  coefficient: string;
  weekNumberString: string;
  timeSlots: {
    dayOfWeek: number;
    periodStart: number;
    periodEnd: number;
    weekType: string;
  }[];
  // 添加展开状态和详细数据字段
  expanded?: boolean;
  detailData?: any;
  detailLoading?: boolean;
  excelLoading?: boolean; // 添加Excel导出加载状态
}

// 定义详细数据的接口
interface DetailData {
  scheduleDetails: {
    week: number;
    date: string;
    content: string;
  }[];
}

// 定义教学日期数据的接口
interface CourseTeachingDate {
  date: string;
  week: number;
  weekOfDay: number;
  courses: {
    scheduleId: number;
    periodStart: number;
    periodEnd: number;
    weekType: string;
  }[];
}

// 定义课程类别信息的接口
interface CategoryInfo {
  text: string;
  color: string;
}

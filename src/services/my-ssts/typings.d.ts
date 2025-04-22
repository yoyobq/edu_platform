// services/my-ssts/typings.d.ts
interface SstsLoginParams {
  userId: string;
  password: string;
}

interface SstsGetCurriPlanDetailParams {
  loginInfo: SstsLoginParams;
  curriPlanList: curriPlanListParams;
}

interface curriPlanListParams {
  LECTURE_PLAN_ID: any;
  [key: string]: any;
}

interface SstsLoginResponse {
  success: boolean;
  cookie: {
    expiresIn: number;
    refreshToken: string;
    token: string;
    tokenHead: string;
  };
  jsessionCookie: string;
  userInfo: Record<string, any>;
}

interface TeachingLogData {
  teaching_class_id: string;
  teaching_date: string;
  week_number: string;
  day_of_week: string;
  lesson_hours: number;
  section_id: string;
  section_name: string;
  journal_type: string;
  topic_record: string;
  homework_assignment: string;
  course_content: string;
}

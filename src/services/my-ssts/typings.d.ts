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

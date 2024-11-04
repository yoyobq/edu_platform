// services/my-ssts/typings.d.ts
interface SstsLoginParams {
  userId: string;
  password: string;
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

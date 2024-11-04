import { message } from 'antd';
import { sstsLogin } from './login';

export async function checkSessionExpiration({ userId, password }: SstsLoginParams): Promise<void> {
  const expirationTime = parseInt(sessionStorage.getItem('sessionExpiration') || '0', 10);
  const sessionId = sessionStorage.getItem('ssts_JSESSIONID_A');

  // 判断 session 是否存在或已过期
  if (!sessionId || Date.now() > expirationTime) {
    message.warning('Session 已过期或不存在，尝试自动重新登录...');
    // 调用 login.ts 里的 sstsLogin 重新登录
    await sstsLogin({ userId, password });
  }
}

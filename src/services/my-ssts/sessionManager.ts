import { sstsLogin } from './login';

/**
 * SSTS 会话管理服务
 */
export class SstsSessionManager {
  // 会话存储键名
  private static readonly SESSION_KEYS = {
    TOKEN: 'ssts_token',
    JSESSIONID: 'ssts_JSESSIONID_A',
    JIAOWU_TOKEN: 'ssts_jiaowu_token',
    REFRESH_TOKEN: 'ssts_refreshToken',
    EXPIRATION: 'sessionExpiration',
    USER_NAME: 'ssts_userName',
  };

  /**
   * 登录并保存会话信息
   */
  static async login(credentials: SstsLoginParams): Promise<{
    success: boolean;
    userName?: string;
    message?: string;
  }> {
    try {
      const response = await sstsLogin(credentials);

      if (response.success) {
        // 存储会话信息
        sessionStorage.setItem(this.SESSION_KEYS.TOKEN, response.cookie.token);
        sessionStorage.setItem(
          this.SESSION_KEYS.JSESSIONID,
          response.jsessionCookie.split(';')[0].split('=')[1],
        );

        // 存储用户名
        if (response.userInfo?.userName) {
          sessionStorage.setItem(this.SESSION_KEYS.USER_NAME, response.userInfo.userName);
        }

        // 设置过期时间（例如2小时后）
        const expirationTime = Date.now() + 2 * 60 * 60 * 1000;
        sessionStorage.setItem(this.SESSION_KEYS.EXPIRATION, expirationTime.toString());

        return {
          success: true,
          userName: response.userInfo?.userName,
        };
      } else {
        return {
          success: false,
          message: '登录失败，请检查工号或密码。',
        };
      }
    } catch (error) {
      console.error('登录失败:', error);
      return {
        success: false,
        message: '登录过程中断，请稍后重试。',
      };
    }
  }

  /**
   * 获取当前会话信息
   */
  static getSessionInfo() {
    return {
      JSESSIONID_A: sessionStorage.getItem(this.SESSION_KEYS.JSESSIONID),
      token: sessionStorage.getItem(this.SESSION_KEYS.TOKEN),
      jiaowuToken: sessionStorage.getItem(this.SESSION_KEYS.JIAOWU_TOKEN),
      refreshToken: sessionStorage.getItem(this.SESSION_KEYS.REFRESH_TOKEN),
      expirationTime: sessionStorage.getItem(this.SESSION_KEYS.EXPIRATION),
      userName: sessionStorage.getItem(this.SESSION_KEYS.USER_NAME),
    };
  }

  /**
   * 检查会话是否有效
   */
  static isSessionValid(): boolean {
    const { JSESSIONID_A, token, expirationTime } = this.getSessionInfo();

    if (!JSESSIONID_A || !token) {
      return false;
    }

    // 检查是否过期
    if (expirationTime) {
      const expTime = parseInt(expirationTime, 10);
      if (Date.now() > expTime) {
        return false;
      }
    }

    return true;
  }

  /**
   * 刷新会话
   */
  static async refreshSession(credentials: SstsLoginParams): Promise<boolean> {
    const result = await this.login(credentials);
    return result.success;
  }

  /**
   * 确保会话有效，如果无效则尝试刷新
   */
  static async ensureValidSession(credentials: SstsLoginParams): Promise<boolean> {
    if (this.isSessionValid()) {
      return true;
    }

    return this.refreshSession(credentials);
  }

  /**
   * 清除会话信息
   */
  static clearSession(): void {
    Object.values(this.SESSION_KEYS).forEach((key) => {
      sessionStorage.removeItem(key);
    });
  }

  /**
   * 获取用户名
   */
  static getUserName(): string | null {
    return sessionStorage.getItem(this.SESSION_KEYS.USER_NAME);
  }

  private static readonly CREDENTIALS_KEY = 'ssts_credentials';

  /**
   * 保存用户凭证到 localStorage
   * TODO: 后端加密存储
   */
  static saveCredentials(jobId: string, password: string): void {
    const data = JSON.stringify({ jobId, password });
    // 使用 encodeURIComponent 替代 escape
    const encoded = btoa(encodeURIComponent(data));
    localStorage.setItem(this.CREDENTIALS_KEY, encoded);
  }

  /**
   * 从 localStorage 读取用户凭证
   * TODO: 后端解密
   */
  static loadCredentials(): { jobId: string; password: string } | null {
    const encoded = localStorage.getItem(this.CREDENTIALS_KEY);
    if (!encoded) return null;
    try {
      // 使用 decodeURIComponent 替代 unescape
      const decoded = decodeURIComponent(atob(encoded));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  /**
   * 清除本地保存的凭证
   */
  static clearCredentials(): void {
    localStorage.removeItem(this.CREDENTIALS_KEY);
  }
}

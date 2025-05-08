import { message } from 'antd';
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
        } else {
          sessionStorage.setItem(this.SESSION_KEYS.USER_NAME, '未知用户');
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
   * 获取用户名
   */
  static getUserName(): string | null {
    return sessionStorage.getItem(this.SESSION_KEYS.USER_NAME);
  }

  private static readonly CREDENTIALS_KEY_PREFIX = 'ssts_credentials_';

  /**
   * 保存用户凭证到 localStorage，与用户名关联
   * TODO: 后端加密存储
   */
  static saveCredentials(jobId: string, password: string): void {
    const userName = this.getUserName();
    if (!userName) {
      console.warn('无法保存凭据：未找到用户名');
      return;
    }

    // 使用用户特定的键名
    const storageKey = `${this.CREDENTIALS_KEY_PREFIX}${userName}`;
    const data = JSON.stringify({ jobId, password });
    // 使用 encodeURIComponent 替代 escape
    const encoded = btoa(encodeURIComponent(data));
    localStorage.setItem(storageKey, encoded);
  }

  /**
   * 从 localStorage 读取当前用户的凭证
   * TODO: 后端解密
   */
  static loadCredentials(): { jobId: string; password: string } | null {
    const userName = this.getUserName();
    if (!userName) {
      // 如果没有用户名，则无法获取特定用户的凭据
      return null;
    }

    // 使用用户特定的键名
    const storageKey = `${this.CREDENTIALS_KEY_PREFIX}${userName}`;
    const encoded = localStorage.getItem(storageKey);
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
   * 清除当前用户的本地保存的凭证
   */
  static clearCredentials(): void {
    const userName = this.getUserName();
    if (userName) {
      // 只清除当前用户的凭据
      localStorage.removeItem(`${this.CREDENTIALS_KEY_PREFIX}${userName}`);
    }
  }

  /**
   * 清除所有用户的凭证（用于安全清理）
   */
  static clearAllCredentials(): void {
    // 遍历 localStorage 并删除所有以凭据前缀开头的项
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.CREDENTIALS_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * 清除会话信息，同时清除当前用户的凭证
   */
  static clearSession(): void {
    // 先清除当前用户的凭证
    this.clearCredentials();

    // 再清除会话信息
    Object.values(this.SESSION_KEYS).forEach((key) => {
      sessionStorage.removeItem(key);
    });
  }

  /**
   * 使用保存的凭据自动登录
   * @param credentials 登录凭据，包含 jobId 和 password
   * @param onSuccess 登录成功回调
   * @param onFailure 登录失败回调
   * @param setLoading 设置加载状态的函数（可选）
   * @returns Promise<{success: boolean, userName?: string, message?: string}>
   */
  static async autoLoginWithCredentials(
    credentials: { jobId: string; password: string },
    onSuccess?: (userName: string) => void,
    onFailure?: () => void,
    setLoading?: (loading: boolean) => void,
  ) {
    const hide = message.loading('正在使用保存的凭据登录...', 0);
    if (setLoading) setLoading(true);

    try {
      const result = await this.login({
        userId: credentials.jobId,
        password: credentials.password,
      });

      if (result.success) {
        message.success('自动登录成功！');

        // 调用成功回调
        if (result.userName && onSuccess) {
          onSuccess(result.userName);
        }
      } else {
        message.error(result.message || '自动登录失败，请手动登录');
        // 自动登录失败，调用失败回调
        if (onFailure) {
          onFailure();
        }
      }

      return result;
    } catch (error) {
      console.error('自动登录失败:', error);
      message.error('自动登录失败，请手动登录');
      // 自动登录失败，调用失败回调
      if (onFailure) {
        onFailure();
      }
      return {
        success: false,
        message: '登录过程中断，请稍后重试。',
      };
    } finally {
      hide();
      if (setLoading) setLoading(false);
    }
  }

  /**
   * 检查会话状态并在需要时自动重新登录
   * @param currentSessionValid 当前会话状态
   * @param setSessionValid 设置会话状态的函数
   * @param onSuccess 登录成功回调
   * @param onFailure 登录失败回调
   * @param setLoading 设置加载状态的函数（可选）
   * @returns 当前会话是否有效
   */
  static async checkSessionAndAutoLogin(
    setSessionValid: (valid: boolean) => void,
    onSuccess?: (userName: string) => void,
    onFailure?: () => void,
    setLoading?: (loading: boolean) => void,
  ) {
    const isValid = this.isSessionValid();

    // 如果会话失效且有保存的凭据，尝试自动重新登录
    if (!isValid) {
      const savedCreds = this.loadCredentials();
      if (savedCreds) {
        const loginResult = await this.autoLoginWithCredentials(
          savedCreds,
          onSuccess,
          onFailure,
          setLoading,
        );
        // 根据登录结果更新会话状态
        setSessionValid(loginResult.success);
        return true;
      } else {
        // 如果没有保存的凭据，确保设置会话状态为无效
        message.warning('校园网登陆已超时，请先重新登录校园网');
        setSessionValid(false);
      }
    }
    return isValid;
  }
}

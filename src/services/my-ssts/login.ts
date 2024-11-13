import { request } from '@umijs/max';
import { message } from 'antd';
import { gql } from 'graphql-tag';

/** 登录校园网 */
export async function sstsLogin({ userId, password }: SstsLoginParams): Promise<SstsLoginResponse> {
  // 构造 GraphQL 变量
  const variables = {
    input: {
      userId,
      password,
    },
  };
  // 定义 GraphQL 查询
  const query = gql`
    query ($input: SstsLoginInput!) {
      sstsLogin(input: $input) {
        success
        cookie
        jsessionCookie
        userInfo
        refreshedToken
      }
    }
  `;

  // 构造请求体
  const data = {
    query: query.loc?.source.body, // 获取 GraphQL 查询的 body
    operationName: null,
    variables,
  };

  // 使用 request 发送请求
  return request<API.ResponseData>('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  })
    .then((response) => {
      const loginResponse = response?.data?.sstsLogin;
      if (loginResponse?.success) {
        // 1. 将整个 jsessionCookie 存入 localStorage
        const jsessionCookie = loginResponse.jsessionCookie;
        sessionStorage.setItem('jsessionCookie', jsessionCookie);

        // 2. 取出 JSESSIONID_A 单独存放
        const JSESSIONID_A = jsessionCookie
          .split('; ')
          .find((cookie: string) => cookie.startsWith('JSESSIONID_A='))
          ?.split('=')[1]; // 通过 ?. 防止找不到时抛出错误

        if (!JSESSIONID_A) {
          throw new Error('找不到 JESESSIONID_A');
        }
        sessionStorage.setItem('ssts_JSESSIONID_A', JSESSIONID_A);
        const expirationTime = Date.now() + 20 * 60 * 1000; // 20 分钟有效期
        sessionStorage.setItem('sessionExpiration', expirationTime.toString());

        if (!loginResponse.cookie) {
          throw new Error('找不到 cookie');
        }
        sessionStorage.setItem('ssts_token', loginResponse.cookie.token);
        sessionStorage.setItem('ssts_refreshToken', loginResponse.cookie.refreshToken);

        if (!loginResponse.refreshedToken) {
          throw new Error('找不到教务系统独立 Token');
        }
        sessionStorage.setItem('ssts_jiaowu_token', loginResponse.refreshedToken);

        // message.success('与校园网会话建立，用户登录成功');
        // console.log(loginResponse);
        return loginResponse; // 返回成功结果
      } else {
        throw new Error('登录失败');
      }
    })
    .catch((error) => {
      message.error('与校园网会话建立过程过程出错。');
      // console.log(error);
      throw error;
    });
}

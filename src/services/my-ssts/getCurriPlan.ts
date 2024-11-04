import { request } from '@umijs/max';
import { gql } from 'graphql-tag';
import { checkSessionExpiration } from './utils';

/** 获得登录用户的教学计划 */
export async function sstsGetCurriPlan({ userId, password }: SstsLoginParams): Promise<any> {
  // 确保 session 有效
  await checkSessionExpiration({ userId, password });

  const JSESSIONID_A = sessionStorage.getItem('ssts_JSESSIONID_A');
  const token = sessionStorage.getItem('ssts_token');
  const refreshToken = sessionStorage.getItem('ssts_refreshToken');

  if (!JSESSIONID_A || !token || !refreshToken) {
    throw new Error('会话信息缺失，请先点击登录校园网按钮');
  }

  // 构造 GraphQL 变量
  const variables = {
    input: {
      JSESSIONID_A,
      token,
      refreshToken,
    },
  };

  // 定义 GraphQL 查询
  const query = gql`
    query ($input: SstsSessionInfo!) {
      sstsGetCurriPlan(input: $input)
    }
  `;

  const data = {
    query: query.loc?.source.body, // 获取 GraphQL 查询的 body
    operationName: null,
    variables,
  };

  try {
    // 调用接口获取教学计划
    const response = await request('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data,
    });

    // 检查返回数据
    if (response?.data?.sstsGetCurriPlan) {
      console.log('教学计划:', response.data.sstsGetCurriPlan);
      return response.data.sstsGetCurriPlan;
    } else {
      throw new Error('获取教学计划失败，请稍后重试。');
    }
  } catch (error) {
    console.error('获取教学计划时出错:', error);
    throw error;
  }
}

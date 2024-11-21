import { request } from '@umijs/max';
import { gql } from 'graphql-tag';
import { checkSessionExpiration } from './utils';

/** 获得登录用户的教学计划 */
export async function sstsGetCurriPlan({ userId, password }: SstsLoginParams): Promise<any> {
  const JSESSIONID_A = sessionStorage.getItem('ssts_JSESSIONID_A');
  const token = sessionStorage.getItem('ssts_jiaowu_token');
  // const refreshToken = sessionStorage.getItem('ssts_refreshToken');
  await checkSessionExpiration({ userId, password });

  if (!JSESSIONID_A) {
    throw new Error('会话信息缺失，请先点击登录校园网按钮');
  }

  // 构造 GraphQL 变量
  const variables = {
    input: {
      JSESSIONID_A,
      userId,
      token,
    },
  };

  // 定义 GraphQL 查询
  const query = gql`
    query sstsGetCurriPlan($input: SstsSessionInput!) {
      sstsGetCurriPlan(input: $input)
    }
  `;

  const data = {
    query: query.loc?.source.body, // 获取 GraphQL 查询的 body
    operationName: 'sstsGetCurriPlan',
    variables,
  };

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
    // console.log('教学计划:', response.data.sstsGetCurriPlanList);
    return response.data.sstsGetCurriPlan;
  } else {
    throw new Error('获取教学计划失败，请稍后重试。');
  }
}

/** 提交日志信息 */
export async function sstsSubmitTeachingLog({
  loginParams,
  teachingLogData,
}: {
  loginParams: SstsLoginParams;
  teachingLogData: TeachingLogData;
}): Promise<any> {
  // 从 sessionStorage 中获取会话信息
  const JSESSIONID_A = sessionStorage.getItem('ssts_JSESSIONID_A');
  const token = sessionStorage.getItem('ssts_jiaowu_token');
  const { userId, password } = loginParams;

  await checkSessionExpiration({ userId, password });

  if (!JSESSIONID_A || !token) {
    throw new Error('会话信息缺失，请先点击登录校园网按钮并重新获取日志');
  }

  // 构造 GraphQL 变量
  const variables = {
    input: {
      teachingLogData,
      JSESSIONID_A,
      token,
    },
  };

  // 定义 GraphQL Mutation
  const mutation = gql`
    mutation sstsSubmitTeachingLog($input: TeachingLogInput!) {
      sstsSubmitTeachingLog(input: $input)
    }
  `;

  const data = {
    query: mutation.loc?.source.body, // 获取 GraphQL Mutation 的 body
    operationName: 'sstsSubmitTeachingLog',
    variables,
  };

  // 调用接口提交教学日志
  const response = await request('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });

  console.log(response);
  // 检查返回数据并处理结果
  if (response?.data?.sstsSubmitTeachingLog) {
    return response.data.sstsSubmitTeachingLog;
  } else {
    throw new Error('教学日志提交失败，请稍后重试。');
  }
}

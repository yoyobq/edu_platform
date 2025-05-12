import { request } from '@umijs/max';
import { print } from 'graphql';
import {
  mutationSstsSubmitIntegratedTeachingLog,
  mutationSstsSubmitTeachingLog,
  querySstsGetCurriPlan,
} from './graphql/curriPlan.graphql';
import { SstsSessionManager } from './sessionManager';

/**
 * 通用 GraphQL 请求封装
 */
async function graphqlRequest<T>(operationName: string, query: any, variables: object): Promise<T> {
  const data = {
    query: query.loc?.source.body || print(query),
    operationName,
    variables,
  };

  const response = await request<API.ResponseData>('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });

  if (response?.data?.[operationName]) {
    return response.data[operationName] as T;
  }

  throw new Error(`请求 ${operationName} 失败`);
}

/**
 * 获取教学计划 API
 */
export async function sstsGetCurriPlanApi(params: {
  JSESSIONID_A: string;
  userId: string;
  token: string;
}): Promise<any> {
  return graphqlRequest('sstsGetCurriPlan', querySstsGetCurriPlan, { input: params });
}
/**
 * 提交教学日志 API
 */
export async function sstsSubmitTeachingLogApi(params: {
  teachingLogData: TeachingLogData;
  JSESSIONID_A: string;
  token: string;
}): Promise<any> {
  return graphqlRequest('sstsSubmitTeachingLog', mutationSstsSubmitTeachingLog, { input: params });
}

/**
 * 提交一体化教学日志 API
 */
export async function sstsSubmitIntegratedTeachingLogApi(params: {
  teachingLogData: TeachingLogData;
  JSESSIONID_A: string;
  token: string;
}): Promise<any> {
  return graphqlRequest(
    'sstsSubmitIntegratedTeachingLog',
    mutationSstsSubmitIntegratedTeachingLog,
    { input: params },
  );
}

/**
 * 获取教学计划服务
 * 注意：此函数不再需要密码，只需要用户ID用于API调用
 */
export async function sstsGetCurriPlan({ jobId }: { jobId: string }): Promise<any> {
  // 检查会话是否有效
  if (!SstsSessionManager.isSessionValid()) {
    throw new Error('会话信息缺失或已过期，请先点击登录校园网按钮');
  }

  const { JSESSIONID_A, token } = SstsSessionManager.getSessionInfo();

  if (!JSESSIONID_A || !token) {
    throw new Error('会话信息缺失，请先点击登录校园网按钮');
  }

  try {
    // 调用 API 获取教学计划
    return await sstsGetCurriPlanApi({
      JSESSIONID_A,
      userId: jobId,
      token,
    });
  } catch (error) {
    throw new Error('获取教学计划失败，请稍后重试。');
  }
}

// 提交教学日志服务
export async function sstsSubmitTeachingLog({
  teachingLogData,
}: {
  // userId: string;
  teachingLogData: TeachingLogData;
}): Promise<any> {
  // 检查会话是否有效
  if (!SstsSessionManager.isSessionValid()) {
    throw new Error('会话信息缺失或已过期，请先点击登录校园网按钮并重新获取日志');
  }

  const { JSESSIONID_A, token } = SstsSessionManager.getSessionInfo();

  if (!JSESSIONID_A || !token) {
    throw new Error('会话信息缺失，请先点击登录校园网按钮并重新获取日志');
  }

  try {
    // 调用 API 提交教学日志
    return await sstsSubmitTeachingLogApi({
      teachingLogData,
      JSESSIONID_A,
      token,
    });
  } catch (error) {
    console.error(error);
    throw new Error('教学日志提交失败，请稍后重试。');
  }
}

// 提交教学日志服务
export async function sstsSubmitIntegratedTeachingLog({
  teachingLogData,
}: {
  // userId: string;
  teachingLogData: TeachingLogData;
}): Promise<any> {
  // 检查会话是否有效
  if (!SstsSessionManager.isSessionValid()) {
    throw new Error('会话信息缺失或已过期，请先点击登录校园网按钮并重新获取日志');
  }

  const { JSESSIONID_A, token } = SstsSessionManager.getSessionInfo();

  if (!JSESSIONID_A || !token) {
    throw new Error('会话信息缺失，请先点击登录校园网按钮并重新获取日志');
  }

  try {
    // 调用 API 提交教学日志
    return await sstsSubmitIntegratedTeachingLogApi({
      teachingLogData,
      JSESSIONID_A,
      token,
    });
  } catch (error) {
    console.error(error);
    throw new Error('一体化教学日志提交失败，请稍后重试。');
  }
}

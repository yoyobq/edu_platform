// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { gql } from 'graphql-tag';

/** (已废弃）获取当前的用户 GET /api/currentUser */
/** 目前登录接口是 POST /graphql */
export async function currentUser(options: { [key: string]: any }) {
  // 此处是老的示例代码，去 mock 获取数据，仅保留
  // return request<{
  //   data: USER.CurrentUser;
  // }>('/api/currentUser', {
  //   method: 'GET',
  //   ...(options || {}),
  // });

  const variables = {
    accountId: options.accountId,
  };

  // console.log(variables);
  const query = gql`
    query getUser($accountId: Int!) {
      user(accountId: $accountId) {
        id
        accountId
        name
        accessGroup
      }
    }
  `;

  // console.log(query.loc?.source.body);
  const data = {
    query: query.loc?.source.body,
    operationName: null, // 操作名称，选填，查询文档有多个操作时必填
    variables, // 对象集合，选填
  };

  return request<API.ResponseData>('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
    // ...(options || {}),
  }).then((response) => {
    if (response.success) {
      console.log(response.data.user);
      return response.data.user;
    }
    throw new Error('获取用户信息失败。');
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'DELETE',
    ...(options || {}),
  });
}

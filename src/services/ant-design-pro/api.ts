// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { gql } from 'graphql-tag';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  // 此处用了 mock 数据
  return request<{
    data: API.CurrentUser;
  }>('/api/currentUser', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
/** 目前登录接口是 POST /graphql，上一行是修改器原始注释保留待查 */
export async function login(body: USER.LoginParams, options?: { [key: string]: any }) {
  const variables = {
    params: {
      loginName: body.loginName,
      loginPassword: body.loginPassword,
      type: body.type,
    },
  };
  // console.log(JSON.stringify(params));
  // 注意这是一个拼接字符串的实例,query 后是 query 的名字
  // 对象内才是引用 resolver 里的名字
  const query = gql`
    query ($params: LoginParams!) {
      checkAccount(params: $params)
    }
  `;

  const data = {
    query: query.loc?.source.body,
    operationName: null, // 操作名称，选填，查询文档有多个操作时必填
    variables, // 对象集合，选填
  };

  /** 这里保留了一些对 useRequest 重新封装 request 返回的 promise 
  *   的探索，目前代码有 bug 暂时弃用
  // const { data:any } = useRequest(()=>{
  //   return request<USER.LoginResult>('/graphql', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     data,
  //     // ...(options || {}),
  //   });
  // });

  // return data;
  */

  return request<API.ResponseData>('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
    // ...(options || {}),
  }).then((response) => {
    if (response.success) {
      return response.data;
    }
    throw new Error('Invalid response');
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

// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { gql } from 'graphql-tag';

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

/** 发送验证码 POST /api/login/captcha */
export async function getFakeCaptcha(
  params: {
    // query
    /** 手机号 */
    phone?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.FakeCaptcha>('/api/login/captcha', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

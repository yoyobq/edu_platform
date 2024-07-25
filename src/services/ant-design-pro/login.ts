// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { gql } from 'graphql-tag';
import Cookies from 'js-cookie';

/** (已废弃）登录接口 POST /api/login/account */
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

  // console.log(query);

  const data = {
    query: query.loc?.source.body,
    operationName: null, // 操作名称，选填，查询文档有多个操作时必填
    variables, // 对象集合，选填
  };
  // console.log(data.query);

  return request<API.ResponseData>('/graphql/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
    // ...(options || {}),
  })
    .then((response) => {
      // response 中包含了 account 和 token
      // if (response.success) {
      console.log(response.data);
      // 只有在账号登陆时，才会生成新的 token
      Cookies.set('token', response.data.checkAccount.token);
      // 把 account 返回
      return response.data.checkAccount.account;
      // }
      // throw new Error('无效的后台反馈，登录失败');
    })
    .catch((error) => {
      throw new Error(error.message);
    });
}

/** (已废弃）获取当前的用户 GET /api/currentUser */
/** 目前登录接口是 POST /graphql
 * 就是 app.tsx 里调用的 queryCurrentUser
 */
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
      // console.log(response.data.user);
      return response.data.user;
    }
    throw new Error('获取用户信息失败。');
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin() {
  Cookies.remove('token');
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

// 测试代码，利用 mutation 改变数据库
export async function updateAccount(body: USER.UpdateParams, options?: { [key: string]: any }) {
  const variables = {
    params: {
      id: body.id,
      loginName: body.loginName,
      loginEmail: body.loginEmail,
      loginPassword: body.loginPassword,
    },
  };

  const mutation = gql`
    mutation ($params: UpdateParams!) {
      updateAccount(params: $params) {
        id
        loginName
        loginEmail
        loginPassword
      }
    }
  `;

  const data = {
    query: mutation.loc?.source.body,
    operationName: null,
    variables,
  };

  return request<API.ResponseData>('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  }).then((response) => {
    if (response.success) {
      return response.data.updateAccount;
    }
    throw new Error('无效的后台反馈，更新账户失败');
  });
}

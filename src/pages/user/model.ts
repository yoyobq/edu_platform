// import { request } from '@umijs/max';

// /**  23-3-16 尝试对登录系统进行改造，以下是区别原始项目的分项记录
//   * 1. TS 的类型申明原本在 services/xxx/typings.d.ts 中，
//   *    现将和 user相关定义转移到 pages/src/User/typings.d.ts，
//   *    且专门申明了一个叫 USER 的 namespace。
//   * 2. 原本数据源来自 mock 项目，此处新建一个 model 文件处理数据。
//   *    写到这里我突然意识到 umi 的 model 是一个全局数据流组件，
//   *    正常的数据处理直接扔到页面里去就可以了。那这个文件就保留后用吧。

// **/
// /** Logs user into the system GET /user/login */
// export async function loginUser(
//   // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
//   params: USER.loginUserParams,
//   options?: { [key: string]: any },
// ) {
//   return request<string>('/user/login', {
//     method: 'GET',
//     params: {
//       ...params,
//     },
//     ...(options || {}),
//   });
// }

// export async function getData() {
//   // const res =  await request('/api/exercisesIndex', {
//   const gql = `{
//     qubankTableInfos {
//       id
//       tableName
//       tableInfo
//       testItemStr
//       remark
//     }
//   }
//   `;

//   // console.log(gql);
//   // const body | params = JSON.stringify({});
//   // data 是对 body (post)或 params (get)的封装
//   const data = ({
//     'query': gql,
//     'operationName': null, // 操作名称，选填，查询文档有多个操作时必填
//     'variables': null, // 对象集合，选填
//   });

//   return await request('/graphql', {
//     method: 'post',

//     // 默认情况以下两个选项的信息默认包括，不用自己填写
//     // requestType: 'json', // default
//     // headers: {
//     //   'Accept': 'application/json',
//     //   'Content-Type': 'application/json;charset=utf-8',
//     // },

//     data,
//     // 'credentials' 发送带凭据的请求
//     // 为了让浏览器发送包含凭据的请求（即使是跨域源），需要设置 credentials: 'include'
//     // 如果只想在请求URL与调用脚本位于同一起源处时发送凭据，请添加credentials: 'same-origin'
//     // 要改为确保浏览器不在请求中包含凭据，请使用credentials: 'omit'
//     // 2021-6-6补充，这个其实也不用谢，因为在 request 里封装了
//     credentials: 'include',

//     // 'responseType': 如何解析返回的数据，当 parseResponse 值为 false 时该参数无效
//     // 默认为 'json', 对返回结果进行 Response.text().then( d => JSON.parse(d) ) 解析
//     // 其他(text, blob, arrayBuffer, formData), 做 Response[responseType]() 解析
//     // responseType: 'json', // default

//     // 'errorHandler' 统一的异常处理，供开发者对请求发生的异常做统一处理，详细使用请参考下方的错误处理文档
//     // errorHandler: function(error) { /* 异常处理 */ },
//   });
// }

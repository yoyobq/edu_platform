// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 退出登录接口 POST /api/login/outLogin */
export async function chat(options?: { [key: string]: any }) {
  // console.log(options);
  const body = JSON.stringify(options);
  return request<Record<string, any>>('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // ...(options || {}),
    // params: {
    //   ...options,
    // },
    data: body,
  });
}

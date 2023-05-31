// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function chat(options?: { [key: string]: any }) {
  // console.log(options);
  const body = JSON.stringify(options);

  return request<Record<string, any>>('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function textGen(options?: { [key: string]: any }) {
  // console.log(options);
  const body = JSON.stringify(options);
  return request<Record<string, any>>('/api/textGen', {
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

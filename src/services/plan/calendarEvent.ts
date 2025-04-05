import { request } from '@umijs/max';
import { DocumentNode, print } from 'graphql';
import {
  mutationCreateCalendarEvent,
  mutationDeleteCalendarEvent,
  mutationUpdateCalendarEvent,
  queryCalendarEvent,
  queryCalendarEvents,
} from './graphql/calendarEvent.graphql';
import type { CalendarEvent, CreateCalendarEventInput, UpdateCalendarEventInput } from './types';

/**
 * 通用 GraphQL 请求封装
 * @template T 返回的数据类型
 * @param operationName GraphQL 操作名称（query/mutation 名称）
 * @param query GraphQL 查询或变更语句，支持 `string | DocumentNode`
 * @param variables 可选的 GraphQL 变量对象
 * @returns `Promise<T>` 解析后的数据
 */
async function graphqlRequest<T>(
  operationName: string,
  query: string | DocumentNode,
  variables?: object,
): Promise<T> {
  const data = {
    query: typeof query === 'string' ? query : print(query), // 自动转换 DocumentNode
    operationName,
    variables,
  };

  return request<API.ResponseData>('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  }).then((response) => response.data[operationName] as T);
}

/**
 * 获取单个校历事件
 * @param id 事件 ID
 * @returns `Promise<CalendarEvent>` 返回事件的详细信息
 */
export async function getCalendarEvent(id: number): Promise<CalendarEvent> {
  return graphqlRequest<CalendarEvent>('getCalendarEvent', queryCalendarEvent, { id });
}

/**
 * 获取某个学期的校历事件列表
 * @param semesterId 学期 ID
 * @returns `Promise<CalendarEvent[]>` 返回符合条件的校历事件数组
 */
export async function getCalendarEvents(semesterId: number): Promise<CalendarEvent[]> {
  return graphqlRequest<CalendarEvent[]>('listCalendarEvents', queryCalendarEvents, { semesterId });
}

/**
 * 创建新校历事件
 * @param input 创建事件所需的数据
 * @returns `Promise<CalendarEvent>` 返回新创建的事件信息
 */
export async function createNewCalendarEvent(
  input: CreateCalendarEventInput,
): Promise<CalendarEvent> {
  return graphqlRequest<CalendarEvent>('createCalendarEvent', mutationCreateCalendarEvent, {
    input,
  });
}

/**
 * 更新校历事件信息
 * @param id 需要更新的事件 ID
 * @param input 更新的字段（可选字段）
 * @returns `Promise<CalendarEvent>` 返回更新后的事件信息
 */
export async function modifyCalendarEvent(
  id: number,
  input: UpdateCalendarEventInput,
): Promise<CalendarEvent> {
  return graphqlRequest<CalendarEvent>('updateCalendarEvent', mutationUpdateCalendarEvent, {
    id,
    input,
  });
}

/**
 * 删除校历事件
 * @param id 要删除的事件 ID
 * @returns `Promise<boolean>` 返回 `true` 表示删除成功
 */
export async function removeCalendarEvent(id: number): Promise<boolean> {
  return graphqlRequest<boolean>('deleteCalendarEvent', mutationDeleteCalendarEvent, { id });
}

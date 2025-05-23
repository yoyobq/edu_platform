import { request } from '@umijs/max';
import { DocumentNode, print } from 'graphql';
import {
  queryActualTeachingDates,
  queryBatchTeachingHours,
  queryCancelledCourses,
  queryDailySchedule,
  queryFullScheduleByStaff,
  queryStaffCancelledCourses,
  queryStaffsCancelledCourses,
  queryStaffWorkload,
  queryStaffWorkloads,
  queryTeachingHours,
} from './graphql/courseScheduleManager.graphql';
import type {
  BatchTeachingHourFilter,
  CancelledCoursesInput,
  CancelledCoursesSingleInput,
  CancelledTeachingDate,
  // FlatCourseSchedule,
  FlatCourseSchedule,
  StaffCancelledCourses,
  StaffWorkload,
  StaffWorkloadFilter,
  StaffWorkloadSingleInput,
  TeachingDate,
  TeachingDateInput,
  TeachingHourSummary,
} from './types';

/**
 * 通用 GraphQL 请求封装
 * @template T 返回的数据类型
 * @param operationName GraphQL 操作名称（query/mutation 的名称）
 * @param query GraphQL 查询或变更语句，支持 `string | DocumentNode`
 * @param variables 可选的 GraphQL 变量对象
 * @returns `Promise<T>` 返回解析后的数据
 */
async function graphqlRequest<T>(
  operationName: string,
  query: string | DocumentNode,
  variables?: object,
): Promise<T> {
  const data = {
    query: typeof query === 'string' ? query : print(query),
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
 * 查询教师某学期完整课表
 * @param params 查询参数对象
 * @param params.staffId 教师 ID
 * @param params.jobId 工号 ID
 * @param params.semesterId 学期 ID
 * @returns `Promise<CourseSchedule[]>` 返回该教师该学期的完整课程表
 */
export function getFullScheduleByStaff(params: {
  staffId?: number;
  jobId?: number;
  semesterId: number;
}) {
  return graphqlRequest<FlatCourseSchedule[]>('getFullScheduleByStaff', queryFullScheduleByStaff, {
    input: {
      staffId: params.staffId,
      jobId: params.jobId,
      semesterId: params.semesterId,
    },
  });
}

/**
 * 查询教师某天的课表
 * @param staffId 教师 ID
 * @param date 日期（格式：YYYY-MM-DD）
 * @returns `Promise<CourseSchedule[]>` 返回该教师当天的课程列表
 */
export function getDailySchedule(staffId: number, date: string) {
  return graphqlRequest<FlatCourseSchedule[]>('getDailySchedule', queryDailySchedule, {
    input: { staffId, date },
  });
}

/**
 * 查询教师实际教学日期（含周次过滤）
 * @param input TeachingDateInput 输入参数，包含学期、教师、周次
 * @returns `Promise<TeachingDate[]>` 返回所有有效的教学日及课程安排
 */
export function getActualTeachingDates(input: TeachingDateInput) {
  return graphqlRequest<TeachingDate[]>('actualTeachingDates', queryActualTeachingDates, {
    input,
  });
}

/**
 * 查询取消的课程（假期或调课）
 * 这是旧版的 getStaffCancelledCourses，由于新版是先批量查询，后筛选出一个的策略
 * 逻辑反而要比这个旧版复杂一些，因此保留。
 * @param input TeachingDateInput 输入参数，包含学期、教师、周次
 * @returns `Promise<CancelledTeachingDate[]>` 返回被取消或调课的日期与说明
 */
export function getCancelledCourses(input: TeachingDateInput) {
  return graphqlRequest<CancelledTeachingDate[]>('cancelledCourses', queryCancelledCourses, {
    input,
  });
}

/**
 * 查询单个教师的实际课时数
 * @param input TeachingDateInput 输入参数
 * @returns `Promise<number>` 返回计算后的实际课时（单位：小时）
 */
export function getTeachingHours(input: TeachingDateInput) {
  return graphqlRequest<number>('teachingHours', queryTeachingHours, { input });
}

/**
 * 查询多个教师的实际课时统计
 * @param input BatchTeachingHourFilter 输入参数，支持多个教师 ID
 * @returns `Promise<TeachingHourSummary[]>` 返回课时统计数组
 */
export function getBatchTeachingHours(input: BatchTeachingHourFilter) {
  return graphqlRequest<TeachingHourSummary[]>('batchTeachingHours', queryBatchTeachingHours, {
    input,
  });
}

/**
 * 查询多个教师的工作量信息
 * @param input StaffWorkloadFilter 输入参数，包含学期ID和教师ID列表
 * @returns `Promise<StaffWorkload[]>` 返回教师工作量信息数组
 */
export function getStaffWorkloads(input: StaffWorkloadFilter) {
  return graphqlRequest<StaffWorkload[]>('staffWorkloads', queryStaffWorkloads, {
    input,
  });
}

/**
 * 查询单个教师的工作量信息
 * @param input StaffWorkloadSingleInput 输入参数，包含学期ID和教师ID
 * @returns `Promise<StaffWorkload | null>` 返回单个教师的工作量信息
 */
export function getStaffWorkload(input: StaffWorkloadSingleInput) {
  return graphqlRequest<StaffWorkload | null>('staffWorkload', queryStaffWorkload, {
    input,
  });
}

/**
 * 获取多个教师的扣课信息
 * @param input CancelledCoursesInput 输入参数，包含学期ID和教师ID列表
 * @returns `Promise<StaffCancelledCourses[]>` 返回多个教师的扣课信息
 */
export function getStaffsCancelledCourses(input: CancelledCoursesInput) {
  return graphqlRequest<StaffCancelledCourses[]>(
    'staffsCancelledCourses',
    queryStaffsCancelledCourses,
    {
      input,
    },
  );
}

/**
 * 获取单个教师的扣课信息
 * @param input CancelledCoursesSingleInput 输入参数，包含学期ID和教师ID
 * @returns `Promise<StaffCancelledCourses | null>` 返回单个教师的扣课信息
 */
export function getStaffCancelledCourses(input: CancelledCoursesSingleInput) {
  return graphqlRequest<StaffCancelledCourses | null>(
    'staffCancelledCourses',
    queryStaffCancelledCourses,
    {
      input,
    },
  );
}

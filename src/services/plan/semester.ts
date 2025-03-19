/**
 * ### 学期管理 API (Semester API)
 * ======================================
 * 该文件封装了前端对学期管理 (Semester) 相关的 GraphQL API 调用，统一处理：
 *  - 获取单个学期信息
 *  - 获取学期列表
 *  - 创建新学期
 *  - 更新学期信息
 *  - 删除学期
 *
 * **注意：从这个文件开始，我依据 AI 的建议重新规划了 Services 中访问后台 API 文件架构**
 * **以下是架构设计的说明**
 * 1. **GraphQL 查询与变更 (Query & Mutation)**
 *    - 所有 GraphQL 查询与变更语句存放于 `./graphql/semester.graphql.ts`
 *    - 这样可以避免 query 语句分散在多个 API 调用中，提高可维护性
 *
 * 2. **类型管理**
 *    - `Semester` 相关类型定义在 `./types.ts`，确保 TypeScript 具有正确的类型推导
 *
 * 3. **GraphQL 请求封装**
 *    - `graphqlRequest<T>()` 统一处理所有 GraphQL API 请求，减少代码重复
 */

import { request } from '@umijs/max';
import { DocumentNode, print } from 'graphql'; // 需要 `print` 来转换
import {
  createSemester,
  deleteSemester,
  getSemester,
  listSemesters,
  updateSemester,
} from './graphql/semester.graphql';
import type { CreateSemesterInput, Semester, UpdateSemesterInput } from './types';

/**
 * 通用 GraphQL 请求封装
 *
 * 这个函数用于向 GraphQL 服务器发送请求，自动处理 `query/mutation` 语句，
 * 并返回指定类型的数据。
 *
 * **TypeScript 泛型（Generic）解析：**
 * - `T` 是一个“泛型”，表示请求返回的数据类型。
 * - 当你调用 `graphqlRequest<T>()` 时，可以指定 `T` 的具体类型，确保返回值有正确的类型推导。
 *
 * **GraphQL 语句支持两种格式**
 * - 你可以传递 **字符串格式** 的 GraphQL 语句。
 * - 你也可以直接传递 `graphql-tag` 解析后的 `DocumentNode`，它会自动转换成字符串。
 *
 * @template T 请求返回的数据类型（泛型）
 * @param operationName  GraphQL 操作名称（查询/变更的名称）
 * @param query          GraphQL 查询或变更语句，支持 `string | DocumentNode`
 * @param variables      可选的 GraphQL 变量对象（默认为 `undefined`）
 * @returns              `Promise<T>` 解析后的数据，类型与 `T` 对应
 *
 * **示例：获取单个学期信息**
 * - const semester = await graphqlRequest<Semester>('getSemester', getSemester, { id: 1 });
 * - console.log(semester.name); // TypeScript 会自动推导出 `semester` 的类型
 */
async function graphqlRequest<T>(
  operationName: string,
  query: string | DocumentNode,
  variables?: object,
): Promise<T> {
  const data = {
    query: typeof query === 'string' ? query : print(query), // 转换 DocumentNode 为字符串
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
 * 获取单个学期信息
 * @param id 学期 ID
 * @returns Promise<Semester> 返回指定学期的详细信息
 */
export async function fetchSemester(id: number): Promise<Semester> {
  return graphqlRequest<Semester>('getSemester', getSemester, { id });
}

/**
 * 获取学期列表
 * @param filters 过滤条件（可选）
 * @param filters.schoolYear 指定学年（可选）
 * @param filters.isCurrent 是否为当前学期（可选）
 * @returns Promise<Semester[]> 返回符合条件的学期数组
 */
export async function fetchSemesters(filters: {
  schoolYear?: number;
  isCurrent?: boolean;
}): Promise<Semester[]> {
  return graphqlRequest<Semester[]>('listSemesters', listSemesters, filters);
}

/**
 * 创建新学期
 * @param input 创建学期所需的数据
 * @param input.schoolYear 学年（必填）
 * @param input.termNumber 学期编号（必填）
 * @param input.name 学期名称（必填）
 * @param input.startDate 学期开始日期（格式 YYYY-MM-DD）（必填）
 * @param input.examStartDate 考试周开始日期（格式 YYYY-MM-DD）（必填）
 * @param input.endDate 学期结束日期（格式 YYYY-MM-DD）（必填）
 * @param input.isCurrent 是否为当前学期（必填）
 * @returns Promise<Semester> 返回新创建的学期信息
 */
export async function createNewSemester(input: CreateSemesterInput): Promise<Semester> {
  return graphqlRequest<Semester>('createSemester', createSemester, { input });
}

/**
 * 更新学期信息
 * @param id 需要更新的学期 ID
 * @param input 更新的字段（可选字段）
 * @param input.schoolYear 学年（可选）
 * @param input.termNumber 学期编号（可选）
 * @param input.name 学期名称（可选）
 * @param input.startDate 学期开始日期（格式 YYYY-MM-DD）（可选）
 * @param input.examStartDate 考试周开始日期（格式 YYYY-MM-DD）（可选）
 * @param input.endDate 学期结束日期（格式 YYYY-MM-DD）（可选）
 * @param input.isCurrent 是否为当前学期（可选）
 * @returns Promise<Semester> 返回更新后的学期信息
 */
export async function modifySemester(id: number, input: UpdateSemesterInput): Promise<Semester> {
  return graphqlRequest<Semester>('updateSemester', updateSemester, { id, input });
}

/**
 * 删除学期
 * @param id 要删除的学期 ID
 * @returns Promise<boolean> 返回 `true` 表示删除成功
 */
export async function removeSemester(id: number): Promise<boolean> {
  return graphqlRequest<boolean>('deleteSemester', deleteSemester, { id });
}

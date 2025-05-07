import { gql } from 'graphql-tag';

// 获取教学计划查询
export const querySstsGetCurriPlan = gql`
  query sstsGetCurriPlan($input: SstsSessionInput!) {
    sstsGetCurriPlan(input: $input)
  }
`;

// 提交教学日志变更
export const mutationSstsSubmitTeachingLog = gql`
  mutation sstsSubmitTeachingLog($input: TeachingLogInput!) {
    sstsSubmitTeachingLog(input: $input)
  }
`;

// 提交一体化教学日志变更，虽然和教学日志类似，但不要合并逻辑，不要合并逻辑，不要合并逻辑！！
export const mutationSstsSubmitIntegratedTeachingLog = gql`
  mutation sstsSubmitIntegratedTeachingLog($input: IntegratedTeachingLogInput!) {
    sstsSubmitIntegratedTeachingLog(input: $input)
  }
`;

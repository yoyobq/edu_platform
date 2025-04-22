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

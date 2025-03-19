import { gql } from 'graphql-tag';

// 获取单个学期
export const getSemester = gql`
  query getSemester($id: Int!) {
    getSemester(id: $id) {
      id
      schoolYear
      termNumber
      name
      startDate
      examStartDate
      endDate
      isCurrent
    }
  }
`;

// 获取学期列表
export const listSemesters = gql`
  query listSemesters($schoolYear: Int, $isCurrent: Boolean) {
    listSemesters(schoolYear: $schoolYear, isCurrent: $isCurrent) {
      id
      schoolYear
      termNumber
      name
      startDate
      examStartDate
      endDate
      isCurrent
    }
  }
`;

// 创建学期
export const createSemester = gql`
  mutation createSemester($input: CreateSemesterInput!) {
    createSemester(input: $input) {
      id
      schoolYear
      termNumber
      name
      startDate
      examStartDate
      endDate
      isCurrent
    }
  }
`;

// 更新学期
export const updateSemester = gql`
  mutation updateSemester($id: Int!, $input: UpdateSemesterInput!) {
    updateSemester(id: $id, input: $input) {
      id
      schoolYear
      termNumber
      name
      startDate
      examStartDate
      endDate
      isCurrent
    }
  }
`;

// 删除学期
export const deleteSemester = gql`
  mutation deleteSemester($id: Int!) {
    deleteSemester(id: $id)
  }
`;

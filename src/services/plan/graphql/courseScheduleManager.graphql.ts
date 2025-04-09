import { gql } from 'graphql-tag';

// 查询教师某学期完整课表
export const queryFullScheduleByStaff = gql`
  query getFullScheduleByStaff($input: FullScheduleInput!) {
    getFullScheduleByStaff(input: $input) {
      scheduleId
      courseName
      staffId
      staffName
      teachingClassName
      classroomName
      semesterId
      courseCategory
      credits
      weekCount
      weeklyHours
      coefficient
      weekNumberString
      # slotId
      dayOfWeek
      periodStart
      periodEnd
      weekType
    }
  }
`;

// 查询教师某天的课表
export const queryDailySchedule = gql`
  query getDailySchedule($input: DailyScheduleInput!) {
    getDailySchedule(input: $input) {
      scheduleId
      courseName
      staffId
      staffName
      teachingClassName
      classroomName
      semesterId
      courseCategory
      credits
      weekCount
      weeklyHours
      coefficient
      weekNumberString
      slotId
      dayOfWeek
      periodStart
      periodEnd
      weekType
    }
  }
`;

// 查询实际教学日程（带周次过滤）
export const queryActualTeachingDates = gql`
  query actualTeachingDates($input: TeachingDateInput!) {
    actualTeachingDates(input: $input) {
      date
      weekOfDay
      weekNumber
      courses {
        scheduleId
        courseName
        slotId
        periodStart
        periodEnd
        weekType
        coefficient
      }
    }
  }
`;

// 查询取消的课程（带假期与调课说明）
export const queryCancelledCourses = gql`
  query cancelledCourses($input: TeachingDateInput!) {
    cancelledCourses(input: $input) {
      date
      weekOfDay
      weekNumber
      note
      courses {
        scheduleId
        courseName
        slotId
        periodStart
        periodEnd
        weekType
        coefficient
      }
    }
  }
`;

// 查询单个教师实际课时数
export const queryTeachingHours = gql`
  query teachingHours($filter: TeachingDateInput!) {
    teachingHours(input: $filter)
  }
`;

// 查询多个教师课时统计
export const queryBatchTeachingHours = gql`
  query batchTeachingHours($filter: BatchTeachingHourFilter!) {
    batchTeachingHours(input: $filter) {
      staffId
      sstsTeacherId
      staffName
      totalHours
    }
  }
`;

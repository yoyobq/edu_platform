import { gql } from 'graphql-tag';

// 查询教师某学期完整课表
export const queryFullScheduleByStaff = gql`
  query getFullScheduleByStaff($staffId: Int!, $semesterId: Int!) {
    getFullScheduleByStaff(staffId: $staffId, semesterId: $semesterId) {
      id
      staffId
      staffName
      teachingClassName
      classroomId
      classroomName
      courseId
      courseName
      semesterId
      weekCount
      weeklyHours
      credits
      coefficient
      courseCategory
      weekNumberString
      slots {
        id
        dayOfWeek
        periodStart
        periodEnd
        weekType
      }
      sourceMap {
        id
        courseScheduleId
        lecturePlanId
        courseId
        teacherInChargeId
        teachingClassId
        staffId
        semesterId
      }
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
  query actualTeachingDates($filter: TeachingDateInput!) {
    actualTeachingDates(input: $filter) {
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
  query cancelledCourses($filter: TeachingDateInput!) {
    cancelledCourses(input: $filter) {
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

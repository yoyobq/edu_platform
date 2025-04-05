import { gql } from 'graphql-tag';

// 获取单个校历事件
export const queryCalendarEvent = gql`
  query getCalendarEvent($id: Int!) {
    getCalendarEvent(id: $id) {
      id
      semesterId
      topic
      date
      timeSlot
      eventType
      originalDate
      recordStatus
      version
      createdAt
      updatedAt
      updatedByAccoutId
    }
  }
`;

// 获取学期的所有校历事件
export const queryCalendarEvents = gql`
  query listCalendarEvents($semesterId: Int!) {
    listCalendarEvents(semesterId: $semesterId) {
      id
      semesterId
      topic
      date
      timeSlot
      eventType
      originalDate
      recordStatus
      version
      createdAt
      updatedAt
      updatedByAccoutId
    }
  }
`;

// 创建校历事件
export const mutationCreateCalendarEvent = gql`
  mutation createCalendarEvent($input: CreateCalendarEventInput!) {
    createCalendarEvent(input: $input) {
      id
      semesterId
      topic
      date
      timeSlot
      eventType
      originalDate
      recordStatus
      version
      createdAt
      updatedAt
      updatedByAccoutId
    }
  }
`;

// 更新校历事件
export const mutationUpdateCalendarEvent = gql`
  mutation updateCalendarEvent($id: Int!, $input: UpdateCalendarEventInput!) {
    updateCalendarEvent(id: $id, input: $input) {
      id
      semesterId
      topic
      date
      timeSlot
      eventType
      originalDate
      recordStatus
      version
      createdAt
      updatedAt
      updatedByAccoutId
    }
  }
`;

// 删除校历事件
export const mutationDeleteCalendarEvent = gql`
  mutation deleteCalendarEvent($id: Int!) {
    deleteCalendarEvent(id: $id)
  }
`;

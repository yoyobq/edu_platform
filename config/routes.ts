﻿/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        // 参照文档建议，把 group 页面的主文件夹首字母小写
        // component: './User/Login',
        component: './user/Login',
      },
      {
        name: 'reset-password',
        path: '/user/reset-password/:verifCode',
        component: './user/ResetPassword', // 指向新建的页面组件
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    name: 'calendar-view',
    icon: 'calendar',
    path: '/CalendarView',
    component: './CalendarView',
    access: 'canTeacher',
  },
  {
    name: 'course-schedule',
    icon: 'schedule',
    path: '/CourseSchedule',
    component: './CourseSchedule',
    access: 'canTeacher',
  },
  {
    path: '/admin',
    name: 'admin',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      {
        // 这一条的意义在于 /admin 的默认页
        path: '/admin',
        redirect: '/admin/sub-page',
      },
      {
        path: '/admin/sub-page',
        name: 'sub-page',
        component: './admin/Admin',
      },
      {
        path: '/admin/api-test',
        name: 'api-test',
        component: './admin/ApiTest',
      },
      {
        path: '/admin/blankComp',
        name: 'blank-page',
        component: './BlankComp/BlankPage',
      },
    ],
  },
  {
    path: '/MySSTS',
    name: 'MySSTS',
    icon: 'robot',
    access: 'canTeacher',
    routes: [
      {
        // 这一条的意义在于二级菜单的的默认页
        path: '/MySSTS',
        redirect: '/MySSTS/log-mate',
      },
      {
        path: '/MySSTS/log-mate',
        name: 'log-mate',
        component: './MySSTS/LogMate',
      },
      {
        path: '/MySSTS/plan-asst',
        name: 'plan-asst',
        component: './MySSTS/PlanAsst',
      },
    ],
  },
  // {
  //   name: 'list.table-list',
  //   icon: 'table',
  //   path: '/list',
  //   component: './TableList',
  // },
  {
    name: 'ChatGPT',
    icon: 'comment',
    path: '/chat',
    component: './ChatGPT',
    access: 'canTeacher',
  },
  {
    name: 'self-test',
    icon: 'table',
    path: '/selfTest',
    component: './SelfTest',
  },
  // {
  //   path: '/exercises',
  //   // layout: false,
  //   routes: [
  //     {
  //       path: '/exercises',
  //       routes: [
  //         {
  //           path: '/exercises/:sub/sin',
  //           hideInMenu: true,
  //           name: '单选题',
  //           // icon: 'table',
  //           component: './ExSingleSelection',
  //         },
  //         {
  //           path: '/exercises/:sub/mul',
  //           hideInMenu: true,
  //           name: '多选题',
  //           // icon: 'table',
  //           component: './ExMultipleSelection',
  //         },
  //         {
  //           path: '/exercises/:sub/jug',
  //           hideInMenu: true,
  //           name: '判断题',
  //           // icon: 'table',
  //           component: './ExJudge',
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   path: '/selfTest',
  //   name: '测验',
  //   icon: 'Form',
  //   component: './SelfTest',
  // },
  {
    path: '/academic',
    name: 'academic-management',
    icon: 'book',
    access: 'canAcademicAssistant',
    routes: [
      {
        // 这一条的意义在于 /academic 的默认页
        path: '/academic',
        redirect: '/academic/cancelled-courses',
      },
      {
        path: '/academic/cancelled-courses',
        name: 'cancelled-courses',
        component: './academic/CancelledCourses',
      },
      {
        path: '/academic/workload-forecast',
        name: 'workload-forecast',
        component: './academic/WorkloadForecast',
      },
      {
        path: '/academic/adjunct-payment',
        name: 'external-adjunct-payment',
        component: './academic/AdjunctPayment',
      },
      {
        path: '/academic/course-manager',
        name: 'course-manager',
        component: './academic/CourseManager',
      },
    ],
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];

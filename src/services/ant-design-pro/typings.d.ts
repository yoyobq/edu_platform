// @ts-ignore
/* eslint-disable */

declare namespace API {
  type ResponseData = {
    // 布尔值，表示请求是否成功
    success: boolean;
    // 任意类型，表示响应数据
    data?: any;
    // 字符串，表示自定义错误类型的代码
    errorCode?: string;
    // 字符串，表示向用户显示的错误信息
    errorMessage?: string;
    // 数字，表示错误显示类型：0 表示静默，1 表示 message.warn，2 表示 message.error，4 表示 notification，9 表示页面错误
    showType?: number;
    // 字符串，方便后端故障排除：唯一的请求 ID
    traceId?: string;
    // 字符串，方便后端故障排除：当前访问服务器的主机
    host?: string;
  };

  type CurrentUser = {
    id: number;
    loginName?: string;
    nickname: string;
    loginEmail: string;
    avatar?: string;
    email?: string;
    signature?: string;
    accessGroup: string[];
    address?: string;
    phone?: string;
    // tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    role: string;
    staffInfo?: {
      id: number;
      jobId: number;
      name: string;
      departmentId?: number;
      jobTitle?: string;
      remarks?: string;
      createdAt?: string;
      updatedAt?: string;
    };
    studentInfo?: {
      id: number;
      stuId: number;
      name: string;
      departmentId?: number;
      classId?: number;
      clubId?: number;
      remarks: string;
      createdAt: string;
      updatedAt: string;
    };
  };

  type LoginResult = {
    checkAccount?: JSON;
    status?: string;
    // type?: string;
    // currentAuthority?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}

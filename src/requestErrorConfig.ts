import type { RequestConfig, RequestOptions } from '@umijs/max';
import { message, notification } from 'antd';
import Cookies from 'js-cookie';
import { history } from 'umi';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // errorThrower 是利用 responseInterceptors 实现的，它的触发条件是: 当 data.success 为 false 时。
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        switch (error.response.status) {
          case 500:
            message.error('后台服务器发生内部错误，请稍后再试。');
            break;
          case 502:
            message.error('后台服务器网关错误，请稍后再试。');
            break;
          case 503:
            message.error('后台服务器服务不可用，服务器暂时过载或维护中。');
            break;
          case 504:
            message.error('后台服务器网关超时，请稍后再试。');
            break;
          default:
            message.error(`发生未知错误，状态码: ${error.response.status}，请和管理员联系。`);
        }
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('本机成功发起 request 但无响应! 请重试。');
      } else {
        // 发送请求时出了点问题
        message.error('本机发送 request 时出了问题！请重试 .');
      }
    },
  },

  // 为 request 方法添加请求阶段的拦截器。
  requestInterceptors: [
    (config: RequestOptions) => {
      // 拦截请求配置，进行个性化处理。
      // const url = config?.url?.concat('?token = 123');

      const headers = {
        ...config.headers,
        // 为所有请求的 headers 自动添加 token
        Authorization: `Bearer ${Cookies.get('token')}`,
      };
      return { ...config, headers };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as ResponseStructure;

      if (data?.err === false) {
        console.log('后台报告异常！');
      }

      switch (data?.errorCode) {
        case 1001:
          history.push('/user/login');
          break;
        default:
          break;
      }
      return response;
    },
  ],
};

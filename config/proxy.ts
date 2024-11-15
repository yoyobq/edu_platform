/**
 * @name 代理的配置
 * @see 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
  dev: {
    '/api/': {
      // 所有访问 /server/api/ 代理到下面的服务器
      target: 'http://127.0.0.1:7001/',
      changeOrigin: true,

      // 实际访问连接中不出现 /api 即
      // 前端访问链接  /api/user
      // 后端实际链接  http://192.168.72.55:7001/user
      pathRewrite: { '^/api': '' },

      // 接受无效的https 证书
      secure: false,
    },

    '/graphql': {
      // 所有访问 /server/api/ 代理到下面的服务器
      target: 'http://127.0.0.1:7001/',
      changeOrigin: true,

      // 接受无效的https 证书
      secure: false,
    },
  },
  /**
   * @name 详细的代理配置
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  test: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    '/api/': {
      target: 'https://proapi.azurewebsites.net',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};

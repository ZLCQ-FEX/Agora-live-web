// import path from 'path'
// ref: https://umijs.org/config/
import chainWebpack from './webpack.config'
import pageRoutes from './router.config'

export default {
  uglifyJSOptions: {
    uglifyOptions:{
      compress: {
        drop_debugger: true,
        drop_console: true
      }
    }
  },
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: true,
        dynamicImport: {
          // loadingComponent: './components/PageLoading',
        },
        title: 'muti-lives',
        dll: true,
        hardSource: false,
        locale: {
          enable: true,
          default: 'zh-CN',
          baseNavigator: false
        },
      }
    ],
  ],
  theme: {
    'primary-color': '#1890ff',
  },
  base: '/',
  routes: pageRoutes,
  history: 'hash',
  proxy: {
  },
  define: {
    'process.env.SERVER': process.env.SERVER,
    'process.env.BUILD_BRANCH': process.env.BUILD_BRANCH,
    'process.env.BUILD_COMMIT_ID': process.env.BUILD_COMMIT_ID,
  },
  hash: true,
  chainWebpack,
}

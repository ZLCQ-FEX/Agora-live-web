
const options = {
  cssModules: true,
  // esm: 'rollup',
  // cjs: 'rollup',
  umd: {
      name: 'QIEAgoraUI',
      sourcemap: true,
      globals: {
          react: 'React',
          antd: 'antd'
      }
      
  },
  doc: {
    src: 'packages/'
  },
  pkgs: [
    'components/muti-lives'
  ]
};

export default options;

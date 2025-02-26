module.exports = {
  extends: [require.resolve('@umijs/lint/dist/config/eslint')],
  globals: {
    page: true,
    REACT_APP_ENV: true,
  },
  overrides: [
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      // 你可以根据需要添加更多配置，例如设置规则等
    },
  ],
};

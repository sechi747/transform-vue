module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'airbnb-base',
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'vue',
  ],
  rules: {
    'no-use-before-define': 'off',
    'import/no-unresolved': [2, { ignore: ['\\.css$'] }],
    'import/no-extraneous-dependencies': 'off',
  },
};

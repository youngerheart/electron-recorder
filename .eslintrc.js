module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
    ecmaVersion: 6
  },
  rules: {
    /*
      0 或’off’：  关闭规则。
      1 或’warn’： 打开规则，并且作为一个警告，字体颜色为黄色（并不会导致检查不通过）。
      2 或’error’：打开规则，并且作为一个错误 ，色体颜色为红色(退出码为1，检查不通过)。
     */
    'no-console': process.env.NODE_ENV === 'production' ? 1 : 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 1 : 0,
    'indent': [2, 2], //缩进风格
    'no-spaced-func': 2, //函数调用时 函数名与()之间不能有空格
    'no-const-assign': 2, //禁止修改const声明的变量 - 开启
    'space-before-function-paren': [2, 'always'], //函数定义时括号前面要有空格
    'camelcase': 2, //强制驼峰法命名
    'no-undef': 2, //不能有未定义的变量
    'no-alert': 2, //禁止使用alert confirm prompt
    'arrow-parens': 2, //箭头函数用小括号括起来
    'semi':[2,'always'],
    'no-fallthrough': 0 //允许switch中的语句不break
  }
};

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier'; // 引入 prettier 插件

export default [
  {
    ignores: ['dist'], // 使用 ignores 替代 globalIgnores
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      // 关键：添加这一行来集成 Prettier
      // 'plugin:prettier/recommended' 相当于同时做了三件事：
      // 1. 启用 eslint-plugin-prettier
      // 2. 将 prettier 的规则设置为 ESLint 规则
      // 3. 禁用 ESLint 中与 Prettier 冲突的规则
      'plugin:prettier/recommended',
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    // 你可以在这里自定义一些规则，会覆盖 extends 中的设置
    rules: {
      // 例如，如果你想禁用某条规则
      // 'no-console': 'off',
      // 由于我们使用了 'plugin:prettier/recommended'，
      // 下面这行实际上已经被包含在内了，可以省略
      // 'prettier/prettier': 'error'
    },
  },
];

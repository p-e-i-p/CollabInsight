import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier'; // 1. 引入 prettier 插件
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    // 2. 定义全局忽略规则，比如 node_modules 和 dist
    ignores: ['node_modules/', 'dist/'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    // 3. 集成 Prettier 推荐规则，并放在最后以确保优先级
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      'plugin:prettier/recommended', // 关键：启用 Prettier 并解决冲突
    ],
    languageOptions: {
      globals: {
        ...globals.node, // 为 Node.js 环境定义全局变量
      },
      parser: tseslint.parser, // 4. 明确指定使用 TypeScript 解析器
      parserOptions: {
        project: './tsconfig.json', // 5. 关联 tsconfig.json 以获得更好的类型检查
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin, // 6. 明确指定 TypeScript 插件
      prettier, // 7. 启用 prettier 插件
    },
    rules: {
      // 8. 在这里可以添加或覆盖规则
      'no-console': 'off', // 允许在后端使用 console.log
      'prettier/prettier': 'error', // 将 Prettier 格式问题标记为错误
    },
  },
  {
    // 针对纯 JavaScript 文件的特殊配置（如果需要）
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
]);

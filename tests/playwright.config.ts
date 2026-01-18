import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 测试配置文件
 * 参考文档: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './',
  // 支持多个测试目录
  testMatch: /.*\.spec\.ts/,
  /* 并行运行测试的最大工作进程数 */
  fullyParallel: true,
  /* 失败时重试 */
  retries: process.env.CI ? 2 : 0,
  /* 选择器超时时间 */
  timeout: 60 * 1000, // 增加到60秒，给登录请求更多时间
  /* 并行运行的工作进程数 */
  workers: process.env.CI ? 1 : undefined,
  /* 测试报告配置 */
  reporter: 'html',
  /* 共享测试配置 */
  use: {
    /* 基础URL */
    baseURL: 'http://localhost:5173',
    /* 收集失败时的跟踪信息 */
    trace: 'on-first-retry',
    /* 截图配置 */
    screenshot: 'only-on-failure',
    /* 操作超时时间 */
    actionTimeout: 15000,
    /* 导航超时时间 */
    navigationTimeout: 30000,
  },

  /* 配置不同浏览器的项目 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // 可以添加更多浏览器
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* 运行本地开发服务器（如果需要） */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  // },
});


import { Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// 支持 ES 模块的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 页面操作辅助函数
 */

/**
 * 登录辅助函数
 * @param page Playwright Page 对象
 * @param username 用户名
 * @param password 密码
 */
export async function login(
  page: Page,
  username: string = "leader",
  password: string = "123456"
) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  // 等待登录表单加载
  await page.locator('text=账号登录').waitFor({ state: 'visible', timeout: 10000 });

  // 输入用户名
  const usernameInput = page.locator('input[placeholder="请输入用户名"]');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill(username);

  // 输入密码
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill(password);

  // 点击登录按钮
  const loginButton = page.locator('button:has-text("登 录")');
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // 等待登录完成
  await page.waitForLoadState("networkidle");
  // 额外等待页面跳转
  await page.waitForTimeout(2000);
}

/**
 * 等待页面跳转
 * @param page Playwright Page 对象
 * @param urlPattern URL 模式（正则表达式或字符串）
 * @param timeout 超时时间（毫秒）
 */
export async function waitForNavigation(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 10000
) {
  await page.waitForURL(urlPattern, { timeout });
}

/**
 * 截图辅助函数
 * @param page Playwright Page 对象
 * @param filename 文件名
 * @param fullPage 是否全页截图
 */
export async function takeScreenshot(
  page: Page,
  filename: string,
  fullPage: boolean = true
) {
  const screenshotsDir = path.join(__dirname, "../screenshots");
  const screenshotPath = path.join(screenshotsDir, filename);
  
  // 确保目录存在（Playwright 会自动创建，但为了安全还是检查一下）
  await page.screenshot({ path: screenshotPath, fullPage });
  console.log(`截图已保存到: ${screenshotPath}`);
  return screenshotPath;
}

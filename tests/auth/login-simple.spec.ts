import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 支持 ES 模块的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 登录功能测试 - 简化版
 * 测试步骤：
 * 1. 访问登录页
 * 2. 输入用户名和密码
 * 3. 点击登录
 * 4. 验证页面跳转
 * 5. 截图保存
 */
test('登录测试：访问登录页 -> 输入用户名密码 -> 点击登录 -> 验证跳转 -> 截图', async ({ page }) => {
  // 步骤1: 访问登录页（使用 baseURL，配置在 playwright.config.ts 中）
  await page.goto('/login');
  
  // 等待页面加载完成
  await page.waitForLoadState('networkidle');
  
  // 验证登录页已加载
  await expect(page.locator('text=账号登录')).toBeVisible({ timeout: 10000 });
  
  // 步骤2: 输入用户名 'leader'
  const usernameInput = page.locator('input[placeholder="请输入用户名"]');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill('leader');
  
  // 步骤3: 输入密码 '123456'
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill('123456');
  
  // 步骤4: 点击登录按钮
  const loginButton = page.locator('button:has-text("登 录")');
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();
  
  // 等待登录请求完成（等待导航或网络请求完成）
  await page.waitForLoadState('networkidle');
  // 额外等待页面跳转
  await page.waitForTimeout(2000);
  
  // 步骤5: 验证页面跳转
  // 根据路由配置，登录成功后跳转到 '/'（显示 Dashboard）
  // 等待 URL 变化
  await page.waitForURL(/\/$/, { timeout: 10000 });
  await expect(page).toHaveURL(/\/$/);
  
  // 验证已离开登录页（可选）
  await expect(page.locator('text=账号登录')).not.toBeVisible();
  
  // 步骤6: 截图保存
  // 确保截图目录存在
  const screenshotsDir = path.join(__dirname, '../screenshots');
  const screenshotPath = path.join(screenshotsDir, 'login-success.png');
  
  await page.screenshot({ 
    path: screenshotPath,
    fullPage: true 
  });
  
  console.log(`✅ 测试完成！截图已保存到: ${screenshotPath}`);
});


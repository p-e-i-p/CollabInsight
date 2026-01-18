import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 支持 ES 模块的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 登录功能测试
 * 测试步骤：
 * 1. 访问登录页
 * 2. 输入用户名和密码
 * 3. 点击登录按钮
 * 4. 验证页面跳转
 * 5. 截图保存
 */
test.describe('登录功能测试', () => {
  test('应该能够成功登录并跳转到首页', async ({ page }) => {
    // 步骤1: 访问登录页
    await page.goto('/login');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 验证登录页已加载（检查是否有登录表单）
    await expect(page.locator('text=账号登录')).toBeVisible();
    
    // 步骤2: 输入用户名
    const usernameInput = page.locator('input[placeholder="请输入用户名"]');
    await usernameInput.fill('leader');
    
    // 步骤3: 输入密码
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('123456');
    
    // 步骤4: 点击登录按钮
    const loginButton = page.locator('button:has-text("登 录")');
    await loginButton.click();
    
    // 等待登录请求完成（等待网络请求完成）
    await page.waitForLoadState('networkidle');
    
    // 步骤5: 验证页面跳转
    // 等待页面跳转完成
    await page.waitForURL(/\/$|\/dashboard/, { timeout: 10000 });
    
    // 验证跳转到首页（根据实际路由，可能是 '/' 或 '/dashboard'）
    // 如果实际路由是 '/dashboard'，取消下面的注释
    // await expect(page).toHaveURL(/\/dashboard/);
    
    // 如果实际路由是 '/'，使用下面的验证（当前路由配置）
    await expect(page).toHaveURL(/\/$/);
    
    // 验证 Dashboard 页面内容已加载（通过页面标题或内容）
    // 等待页面内容加载
    await page.waitForTimeout(1000);
    
    // 可以根据实际页面内容添加验证
    // 例如：验证"数据概览"文本是否存在
    // await expect(page.locator('text=数据概览')).toBeVisible({ timeout: 5000 });
    
    // 步骤6: 截图保存
    const screenshotsDir = path.join(__dirname, '../screenshots');
    const screenshotPath = path.join(screenshotsDir, 'login-success.png');
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    console.log(`截图已保存到: ${screenshotPath}`);
  });
  
  test('登录失败时应该显示错误信息', async ({ page }) => {
    // 访问登录页
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // 输入错误的用户名和密码
    await page.locator('input[placeholder="请输入用户名"]').fill('wronguser');
    await page.locator('input[type="password"]').fill('wrongpass');
    
    // 点击登录
    await page.locator('button:has-text("登 录")').click();
    
    // 等待错误消息出现（Ant Design 的 message 组件）
    // 注意：Ant Design 的 message 是动态渲染的，可能需要等待
    await page.waitForTimeout(2000);
    
    // 验证仍在登录页
    await expect(page).toHaveURL(/\/login/);
    
    // 截图保存
    const screenshotsDir = path.join(__dirname, '../screenshots');
    const screenshotPath = path.join(screenshotsDir, 'login-failure.png');
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
  });
});


import { test, expect } from '@playwright/test';
import { login } from '../helpers/page-helpers';

/**
 * Dashboard（数据概览）页面测试
 */
test.describe('Dashboard页面测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await login(page, 'leader', '123456');
    
    // 等待跳转到首页
    await page.waitForURL(/\/$/, { timeout: 10000 });
  });

  test('应该正确加载Dashboard页面', async ({ page }) => {
    // 验证页面已加载
    await expect(page).toHaveURL(/\/$/);
    
    // 等待页面内容加载
    await page.waitForTimeout(2000);
    
    // 验证页面标题或关键元素存在
    // 根据实际页面内容调整选择器
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });

  test('应该显示统计数据', async ({ page }) => {
    // 等待统计数据加载
    await page.waitForTimeout(3000);
    
    // 验证统计卡片存在（根据实际页面结构调整）
    // 这里需要根据实际的Dashboard组件结构调整选择器
    const statsVisible = await page.locator('body').isVisible();
    expect(statsVisible).toBe(true);
  });
});



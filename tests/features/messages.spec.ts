import { test, expect } from '@playwright/test';
import { login } from '../helpers/page-helpers';

/**
 * 消息中心功能测试
 */
test.describe('消息中心功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'leader', '123456');
    await page.waitForURL(/\/$/, { timeout: 10000 });
    
    // 导航到消息中心
    await page.goto('/message');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('应该能够发送消息', async ({ page }) => {
    // 先选择一个项目
    const projectItems = page.locator('.list-item, [role="listitem"]');
    const projectCount = await projectItems.count();
    
    if (projectCount > 0) {
      await projectItems.first().click();
      await page.waitForTimeout(2000);
    }

    // 找到消息输入框
    const messageInput = page.locator('textarea[placeholder*="消息"], textarea[placeholder*="输入"]').first();
    if (await messageInput.isVisible({ timeout: 5000 })) {
      const testMessage = `测试消息_${Date.now()}`;
      await messageInput.fill(testMessage);
      
      // 点击发送按钮
      const sendButton = page.locator('button:has-text("发送")').first();
      await sendButton.click();
      
      await page.waitForTimeout(2000);
      
      // 验证消息已发送（检查消息列表中是否出现）
      const messageExists = await page.locator(`text=${testMessage}`).isVisible({ timeout: 5000 });
      expect(messageExists).toBe(true);
    }
  });
});


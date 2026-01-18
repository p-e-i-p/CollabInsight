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
    const projectItems = page.locator('.list-item, [role="listitem"], .project-item, .card');
    const projectCount = await projectItems.count();
    
    if (projectCount > 0) {
      await projectItems.first().click();
      await page.waitForTimeout(2000);
    }

    // 找到消息输入框
    let messageInput = page.locator('textarea[placeholder*="消息"], textarea[placeholder*="输入"], textarea[name*="message"], textarea[id*="message"]').first();
    if (!(await messageInput.isVisible({ timeout: 3000 }))) {
      // 尝试其他可能的选择器
      messageInput = page.locator('input[placeholder*="消息"], input[placeholder*="输入"], .message-input, .chat-input').first();
    }
    if (await messageInput.isVisible({ timeout: 5000 })) {
      const testMessage = `测试消息_${Date.now()}`;
      await messageInput.fill(testMessage);
      
      // 点击发送按钮，尝试多种可能的选择器
      let sendButton = page.locator('button:has-text("发送"), button:has-text("提交"), .send-button, [data-testid="send"]').first();
      if (!(await sendButton.isVisible({ timeout: 3000 }))) {
        // 尝试其他可能的发送按钮
        sendButton = page.locator('.anticon-send, .fa-paper-plane, .icon-send').first();
      }
      
      if (await sendButton.isVisible({ timeout: 3000 })) {
        await sendButton.click();
        
        await page.waitForTimeout(2000);
        
        // 验证消息已发送（检查消息列表中是否出现）
        const messageExists = await page.locator(`text=${testMessage}`).isVisible({ timeout: 5000 });
        expect(messageExists).toBe(true);
      }
    }
  });
});


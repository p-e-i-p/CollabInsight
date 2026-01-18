import { test, expect } from '@playwright/test';
import { login } from '../helpers/page-helpers';

/**
 * Bug管理功能测试
 */
test.describe('Bug管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'leader', '123456');
    await page.waitForURL(/\/$/, { timeout: 10000 });
    
    // 导航到Bug管理页面
    await page.goto('/bug');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('应该能够创建新Bug', async ({ page }) => {
    // 先选择一个项目
    const projectItems = page.locator('.list-item, [role="listitem"]');
    const projectCount = await projectItems.count();
    
    if (projectCount > 0) {
      await projectItems.first().click();
      await page.waitForTimeout(1000);
    }

    // 点击添加Bug按钮
    const addBugButton = page.locator('button:has-text("添加"), button:has-text("Bug"), [title*="Bug"]').first();
    if (await addBugButton.isVisible({ timeout: 5000 })) {
      await addBugButton.click();
    }

    // 等待Bug表单出现
    await page.waitForTimeout(1000);

    // 填写Bug信息
    const bugName = `测试Bug_${Date.now()}`;
    const nameInput = page.locator('input[placeholder*="Bug名称"], input[placeholder*="bug名称"]').first();
    if (await nameInput.isVisible({ timeout: 5000 })) {
      await nameInput.fill(bugName);
      
      // 选择分配人
      const assigneeSelect = page.locator('.ant-select').first();
      if (await assigneeSelect.isVisible()) {
        await assigneeSelect.click();
        await page.waitForTimeout(500);
        const firstOption = page.locator('.ant-select-item').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
        }
      }

      // 保存Bug
      const saveButton = page.locator('button:has-text("创建"), button:has-text("保存")').first();
      await saveButton.click();

      await page.waitForTimeout(2000);

      // 验证Bug已创建
      const bugExists = await page.locator(`text=${bugName}`).isVisible({ timeout: 5000 });
      expect(bugExists).toBe(true);
    }
  });
});


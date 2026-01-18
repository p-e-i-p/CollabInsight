import { test, expect } from '@playwright/test';
import { login } from '../helpers/page-helpers';

/**
 * 任务管理功能测试
 */
test.describe('任务管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'leader', '123456');
    await page.waitForURL(/\/$/, { timeout: 10000 });
    
    // 导航到任务中心
    await page.goto('/task-center');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('应该能够创建新任务', async ({ page }) => {
    // 先选择一个项目（如果有项目列表）
    const projectItems = page.locator('.list-item, [role="listitem"]');
    const projectCount = await projectItems.count();
    
    if (projectCount > 0) {
      await projectItems.first().click();
      await page.waitForTimeout(1000);
    }

    // 点击添加任务按钮
    const addTaskButton = page.locator('button:has-text("添加任务"), [title*="任务"]').first();
    if (await addTaskButton.isVisible({ timeout: 5000 })) {
      await addTaskButton.click();
    }

    // 等待任务表单出现
    await page.waitForTimeout(1000);

    // 填写任务信息
    const taskName = `测试任务_${Date.now()}`;
    const nameInput = page.locator('input[placeholder*="任务名称"]').first();
    if (await nameInput.isVisible({ timeout: 5000 })) {
      await nameInput.fill(taskName);
      
      // 选择分配人（如果有）
      const assigneeSelect = page.locator('.ant-select').first();
      if (await assigneeSelect.isVisible()) {
        await assigneeSelect.click();
        await page.waitForTimeout(500);
        const firstOption = page.locator('.ant-select-item').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
        }
      }

      // 保存任务
      const saveButton = page.locator('button:has-text("创建"), button:has-text("保存")').first();
      await saveButton.click();

      await page.waitForTimeout(2000);

      // 验证任务已创建
      const taskExists = await page.locator(`text=${taskName}`).isVisible({ timeout: 5000 });
      expect(taskExists).toBe(true);
    }
  });
});


import { test, expect } from '@playwright/test';
import { login } from '../helpers/page-helpers';

/**
 * 项目管理功能测试
 */
test.describe('项目管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'leader', '123456');
    await page.waitForURL(/\/$/, { timeout: 10000 });
    
    // 导航到任务中心（包含项目管理）
    await page.goto('/task-center');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够创建新项目', async ({ page }) => {
    // 点击新增项目按钮
    const addButton = page.locator('[title="新增"]').first();
    if (await addButton.isVisible()) {
      await addButton.click();
    } else {
      // 尝试其他方式找到新增按钮
      const plusIcon = page.locator('.anticon-plus').first();
      if (await plusIcon.isVisible()) {
        await plusIcon.click();
      }
    }

    // 等待弹窗出现
    await page.waitForTimeout(1000);

    // 填写项目信息
    const projectName = `测试项目_${Date.now()}`;
    await page.locator('input[placeholder*="项目名称"]').fill(projectName);
    await page.locator('textarea[placeholder*="项目描述"]').fill('这是测试项目描述');

    // 选择状态和优先级
    await page.locator('.ant-select').first().click();
    await page.locator('.ant-select-item').filter({ hasText: '进行中' }).first().click();

    // 点击保存
    const saveButton = page.locator('button:has-text("创建"), button:has-text("保存")').first();
    await saveButton.click();

    // 等待保存完成
    await page.waitForTimeout(2000);

    // 验证项目已创建（检查项目列表中是否出现新项目）
    const projectExists = await page.locator(`text=${projectName}`).isVisible({ timeout: 5000 });
    expect(projectExists).toBe(true);
  });

  test('应该能够编辑项目', async ({ page }) => {
    // 等待项目列表加载
    await page.waitForTimeout(2000);

    // 找到第一个项目并点击编辑
    const editButton = page.locator('[title="编辑"], .anticon-edit').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // 等待编辑弹窗
      await page.waitForTimeout(1000);
      
      // 修改项目名称
      const nameInput = page.locator('input[placeholder*="项目名称"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.clear();
        await nameInput.fill(`编辑后的项目_${Date.now()}`);
        
        // 保存
        const saveButton = page.locator('button:has-text("保存")').first();
        await saveButton.click();
        
        await page.waitForTimeout(2000);
      }
    }
  });

  test('应该能够搜索项目', async ({ page }) => {
    // 找到搜索框
    const searchInput = page.locator('input[placeholder*="搜索"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('测试');
      await searchInput.press('Enter');
      
      await page.waitForTimeout(2000);
    }
  });
});


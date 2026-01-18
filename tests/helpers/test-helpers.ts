import { Page } from '@playwright/test';

/**
 * 测试辅助函数
 */

/**
 * 等待并选择第一个项目
 * @param page Playwright Page 对象
 * @returns 是否成功选择项目
 */
export async function selectFirstProject(page: Page): Promise<boolean> {
  try {
    // 等待项目列表加载
    await page.waitForTimeout(2000);
    
    // 查找项目列表项
    const projectItems = page.locator('.list-item, .ant-list-item, [role="listitem"]');
    const projectCount = await projectItems.count();
    
    if (projectCount === 0) {
      console.log('没有可用的项目');
      return false;
    }
    
    // 点击第一个项目
    await projectItems.first().click();
    
    // 等待项目选择后内容加载
    await page.waitForTimeout(3000);
    
    return true;
  } catch (error) {
    console.error('选择项目失败:', error);
    return false;
  }
}

/**
 * 等待Modal出现并填写表单
 * @param page Playwright Page 对象
 * @param formData 表单数据
 */
export async function fillModalForm(
  page: Page,
  formData: {
    name?: string;
    namePlaceholder?: string;
    description?: string;
    assignee?: boolean;
    selects?: Array<{ index: number; optionText: string }>;
  }
): Promise<void> {
  // 等待Modal出现
  await page.waitForSelector('.ant-modal', { state: 'visible', timeout: 10000 });
  await page.waitForTimeout(1000);

  // 填写名称
  if (formData.name && formData.namePlaceholder) {
    const nameInput = page.locator(`input[placeholder*="${formData.namePlaceholder}"]`).first();
    await nameInput.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput.fill(formData.name);
  }

  // 填写描述（如果有）
  if (formData.description) {
    const descInput = page.locator('textarea[placeholder*="描述"]').first();
    if (await descInput.isVisible({ timeout: 3000 })) {
      await descInput.fill(formData.description);
    }
  }

  // 选择分配人（如果有）
  if (formData.assignee) {
    const assigneeSelect = page.locator('.ant-select').first();
    await assigneeSelect.waitFor({ state: 'visible', timeout: 5000 });
    await assigneeSelect.click();
    await page.waitForTimeout(1000);
    const firstOption = page.locator('.ant-select-item').first();
    await firstOption.waitFor({ state: 'visible', timeout: 5000 });
    await firstOption.click();
    await page.waitForTimeout(500);
  }

  // 选择其他下拉框（如果有）
  if (formData.selects) {
    for (const select of formData.selects) {
      const selectElement = page.locator('.ant-select').nth(select.index);
      if (await selectElement.isVisible({ timeout: 3000 })) {
        await selectElement.click();
        await page.waitForTimeout(1000);
        const option = page.locator('.ant-select-item').filter({ hasText: select.optionText }).first();
        if (await option.isVisible({ timeout: 3000 })) {
          await option.click();
          await page.waitForTimeout(500);
        }
      }
    }
  }
}

/**
 * 提交Modal表单
 * @param page Playwright Page 对象
 * @param buttonText 按钮文本（可选，默认查找确定按钮）
 */
export async function submitModal(page: Page, buttonText?: string): Promise<void> {
  const buttonSelector = buttonText
    ? `.ant-modal button:has-text("${buttonText}")`
    : '.ant-modal button.ant-btn-primary, .ant-modal button:has-text("确定")';
  
  const saveButton = page.locator(buttonSelector).first();
  await saveButton.waitFor({ state: 'visible', timeout: 5000 });
  await saveButton.click();

  // 等待Modal关闭
  await page.waitForSelector('.ant-modal', { state: 'hidden', timeout: 10000 });
  await page.waitForTimeout(2000);
}

/**
 * 验证元素在表格或列表中存在
 * @param page Playwright Page 对象
 * @param text 要查找的文本
 * @param timeout 超时时间
 */
export async function verifyItemExists(
  page: Page,
  text: string,
  timeout: number = 10000
): Promise<boolean> {
  // 尝试在表格中查找
  let exists = await page.locator(`td:has-text("${text}"), .ant-table-tbody:has-text("${text}")`).isVisible({ timeout: 3000 });
  if (exists) return true;

  // 尝试在列表中查找
  exists = await page.locator(`.list-item:has-text("${text}"), .ant-list-item:has-text("${text}")`).isVisible({ timeout: 3000 });
  if (exists) return true;

  // 尝试通用文本查找
  exists = await page.locator(`text=${text}`).isVisible({ timeout: 3000 });
  return exists;
}


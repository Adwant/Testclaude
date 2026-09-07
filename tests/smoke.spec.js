const { test, expect } = require('@playwright/test');

test('браузер запускается и рендерит страницу', async ({ page }) => {
  await page.setContent('<h1>Playwright готов</h1>');
  await expect(page.getByRole('heading')).toHaveText('Playwright готов');
});

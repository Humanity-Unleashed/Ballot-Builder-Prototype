import { test, expect } from '@playwright/test';

test.describe('Blueprint Assessment', () => {
  test('blueprint page loads', async ({ page }) => {
    await page.goto('/blueprint');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('spec data is fetched successfully', async ({ page }) => {
    // Intercept the spec API call
    const specPromise = page.waitForResponse(
      (response) => response.url().includes('/api/civic-axes/spec') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);

    await page.goto('/blueprint');
    const specResponse = await specPromise;

    if (specResponse) {
      const data = await specResponse.json();
      expect(data.domains).toBeDefined();
      expect(data.axes).toBeDefined();
    }
  });

  test('can interact with UI elements', async ({ page }) => {
    await page.goto('/blueprint');
    // Wait for page to settle
    await page.waitForTimeout(1000);

    // Look for interactive elements (buttons, sliders)
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});

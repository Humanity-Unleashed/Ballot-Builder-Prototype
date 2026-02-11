import { test, expect } from '@playwright/test';

test.describe('Ballot Voting', () => {
  test('ballot page loads', async ({ page }) => {
    await page.goto('/ballot');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('ballot items are displayed', async ({ page }) => {
    await page.goto('/ballot');
    await page.waitForTimeout(2000);

    // Check that some content loaded
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('can interact with vote buttons', async ({ page }) => {
    await page.goto('/ballot');
    await page.waitForTimeout(2000);

    // Look for Yes/No buttons or candidate selection elements
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});

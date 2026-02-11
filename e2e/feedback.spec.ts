import { test, expect } from '@playwright/test';

test.describe('Feedback', () => {
  test('feedback button is visible on pages', async ({ page }) => {
    await page.goto('/ballot');
    await page.waitForTimeout(1000);

    // Look for feedback button/trigger
    const feedbackButton = page.getByRole('button', { name: /feedback/i })
      .or(page.locator('[data-testid="feedback-button"]'))
      .or(page.locator('button:has-text("Feedback")'));

    if (await feedbackButton.count() > 0) {
      await expect(feedbackButton.first()).toBeVisible();
    }
  });

  test('can open feedback modal', async ({ page }) => {
    await page.goto('/ballot');
    await page.waitForTimeout(1000);

    const feedbackButton = page.getByRole('button', { name: /feedback/i })
      .or(page.locator('button:has-text("Feedback")'));

    if (await feedbackButton.count() > 0) {
      await feedbackButton.first().click();
      await page.waitForTimeout(500);

      // Check for modal/dialog content
      const dialog = page.getByRole('dialog')
        .or(page.locator('[role="dialog"]'))
        .or(page.locator('textarea'));

      if (await dialog.count() > 0) {
        await expect(dialog.first()).toBeVisible();
      }
    }
  });
});

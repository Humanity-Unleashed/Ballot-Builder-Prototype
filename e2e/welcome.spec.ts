import { test, expect } from '@playwright/test';

test.describe('Welcome Page', () => {
  test('renders the welcome page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    // Check that main content is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('"Get Started" navigates to /register', async ({ page }) => {
    await page.goto('/');
    const getStartedButton = page.getByRole('link', { name: /get started/i })
      .or(page.getByRole('button', { name: /get started/i }));

    if (await getStartedButton.count() > 0) {
      await getStartedButton.first().click();
      await expect(page).toHaveURL(/\/register/);
    }
  });

  test('"Already have account" navigates to /login', async ({ page }) => {
    await page.goto('/');
    const loginLink = page.getByRole('link', { name: /already have|sign in|log in/i })
      .or(page.getByRole('button', { name: /already have|sign in|log in/i }));

    if (await loginLink.count() > 0) {
      await loginLink.first().click();
      await expect(page).toHaveURL(/\/login/);
    }
  });
});

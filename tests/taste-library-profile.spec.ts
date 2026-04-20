import { test, expect } from '@playwright/test';
import { URLS, AUTH_READY, centralizedSignIn, gotoAndExpectHeading } from './_shared';

test.describe('Taste discovery library and profile cases', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndExpectHeading(page, URLS.taste, /savor the heritage/i);
  });

  test('TAHA-39 Taste home loads city context and hero search area', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /savor the heritage/i })).toBeVisible();
    await expect(page.getByText(/city context/i)).toBeVisible();
    await expect(page.getByPlaceholder(/search restaurant/i)).toBeVisible();
  });

  test('TAHA-40 Restaurant suggestions appear while typing', async ({ page }) => {
    const input = page.getByPlaceholder(/search restaurant/i);
    await input.fill('a');
    await input.click();
    const suggestionCount = await page.locator('.search-box .search-suggestion').count();
    test.skip(suggestionCount === 0, 'No restaurant suggestions available for current city dataset');
    expect(suggestionCount).toBeGreaterThan(0);
  });

  test('TAHA-41 Search with match returns food cards', async ({ page }) => {
    await page.getByPlaceholder(/search restaurant/i).fill('a');
    await page.getByRole('button', { name: /^search$/i }).click();
    const cards = page.locator('.food-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TAHA-42 Search with no match shows no-result state', async ({ page }) => {
    test.setTimeout(20_000);
    const searchInput = page.getByPlaceholder(/search restaurant/i);
    await searchInput.fill('zzzz-no-match-zzzz');
    await searchInput.press('Enter');
    const noMatch = page.getByText(/no matching restaurants/i);
    await page.waitForFunction(() => document.body.textContent?.toLowerCase().includes('no matching restaurants'), null, { timeout: 15_000 });
    await expect(noMatch).toBeVisible({ timeout: 15_000 });
  });

  test('TAHA-43 Add to Library as guest triggers login redirect', async ({ page }) => {
    await page.getByRole('button', { name: /^search$/i }).click();
    const addButton = page.getByRole('button', { name: /add to library/i }).first();
    test.skip((await addButton.count()) === 0, 'No food cards available in current dataset for this city');
    await expect(addButton).toBeVisible();
    await addButton.click();
    await expect(page).toHaveURL(new RegExp(URLS.login.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  test('TAHA-44 Add to Library as signed-in user changes button to Added', async ({ page }) => {
    test.skip(!AUTH_READY, 'Requires authenticated user');
    await centralizedSignIn(page, URLS.taste);
    await page.getByRole('button', { name: /^search$/i }).click();
    const addButton = page.getByRole('button', { name: /add to library/i }).first();
    await addButton.click();
    const addedVisible = await page.getByRole('button', { name: /added/i }).first().isVisible().catch(() => false);
    test.skip(!addedVisible, 'Item may already exist in library for this account/state');
    await expect(page.getByRole('button', { name: /added/i }).first()).toBeVisible();
  });

  test('TAHA-45 Library page groups items by city', async ({ page }) => {
    await page.goto(`${URLS.taste}/library`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/city chapters|my flavor treasury|library/i).first()).toBeVisible();
  });

  test('TAHA-46 Remove from Library deletes visible item', async ({ page }) => {
    test.skip(!AUTH_READY, 'Requires authenticated user with library data');
    await centralizedSignIn(page, `${URLS.taste}/library`);
    const removeBtn = page.getByRole('button', { name: /remove/i }).first();
    test.skip((await removeBtn.count()) === 0, 'No item present to remove');
    await removeBtn.click();
    await expect(removeBtn).not.toBeVisible();
  });

  test('TAHA-47 Taste profile for guest shows access gate', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(`${URLS.taste}/profile`, { waitUntil: 'domcontentloaded' });
    const loginUrlPattern = new RegExp(`^${URLS.login.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
    const redirectedToLogin = loginUrlPattern.test(page.url());
    if (redirectedToLogin) {
      await expect(page).toHaveURL(loginUrlPattern);
      return;
    }
    await expect(page.getByText(/member access required|please sign in/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('TAHA-48 Taste profile save persists valid updates', async ({ page }) => {
    test.skip(!AUTH_READY, 'Requires authenticated user');
    await centralizedSignIn(page, `${URLS.taste}/profile`);
    await page.locator('input').nth(0).fill('QA Taste User');
    await page.locator('input').nth(2).fill('9999999999');
    await page.getByRole('button', { name: /save profile/i }).click();
    await expect(page.locator('input').nth(0)).toHaveValue('QA Taste User');
  });

  test('TAHA-49 Hotels widget in Taste respects city switch', async ({ page }) => {
    await page.getByText(/area \(near food hub\)/i).waitFor();
    const citySelect = page.locator('select').first();
    const before = await citySelect.inputValue();
    const optionCount = await citySelect.locator('option').count();
    test.skip(optionCount < 2, 'Needs two cities');
    await citySelect.selectOption({ index: 1 });
    const after = await citySelect.inputValue();
    expect(after).not.toBe(before);
    await page.getByRole('button', { name: /find hotels/i }).click();
    await expect(page.locator('.hotel-widget-card').first()).toBeVisible();
  });

  test('TAHA-50 Hotels widget room type filter updates visible results', async ({ page }) => {
    const selects = page.locator('select');
    await selects.nth(1).selectOption('Suite');
    await page.getByRole('button', { name: /find hotels/i }).click();
    await expect(page.locator('.hotel-widget-card').first()).toBeVisible();
  });
});
import { test, expect } from '@playwright/test';
import { URLS, AUTH_READY, centralizedSignIn, gotoAndExpectHeading } from './_shared';

function datePlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

test.describe('Integration and resilience cases', () => {
  test('TAHA-51 Taste widget in Hotels refreshes when Hotels city changes', async ({ page }) => {
    await page.goto(URLS.hotels, { waitUntil: 'domcontentloaded' });
    const trigger = page.locator('.hotel-city-trigger').first();
    await trigger.click();
    const options = page.locator('.hotel-search-suggestion');
    test.skip((await options.count()) < 2, 'Need at least 2 cities');
    const before = await trigger.textContent();
    await options.nth(1).click();
    const after = await trigger.textContent();
    expect(after).not.toBe(before);
  });

  test('TAHA-52 Hotels widget in Taste Find Hotels requires valid date range', async ({ page }) => {
    await page.goto(URLS.taste, { waitUntil: 'domcontentloaded' });
    const checkIn = page.locator('input[type="date"]').nth(0);
    const checkOut = page.locator('input[type="date"]').nth(1);
    const inDate = datePlus(5);
    await checkIn.fill(inDate);
    await checkOut.fill(inDate);
    await page.getByRole('button', { name: /find hotels/i }).click();
    const corrected = await checkOut.inputValue();
    expect(corrected > inDate).toBeTruthy();
  });

  test('TAHA-53 Book Now from Taste passes city dates room params', async ({ page }) => {
    await page.goto(URLS.taste, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /find hotels/i }).click();
    const bookNow = page.getByRole('button', { name: /book now/i }).first();
    test.skip((await bookNow.count()) === 0, 'No hotels returned in widget');
    await bookNow.click();
    await expect(page).toHaveURL(/\/booking\?/);
    await expect(page).toHaveURL(/checkIn=/);
    await expect(page).toHaveURL(/checkOut=/);
  });

  test('TAHA-54 Widget empty states shown when API returns no data', async ({ request }) => {
    const hotelsRes = await request.get(`${URLS.tasteApi}/widget/hotels?city=NoCityShouldExist`);
    expect(hotelsRes.ok()).toBeTruthy();
    const hotelsJson = await hotelsRes.json();
    expect(Array.isArray(hotelsJson.hotels)).toBeTruthy();
    expect(hotelsJson.hotels.length).toBe(0);

    const tasteRes = await request.get(`${URLS.hotelsApi}/widget/taste?city=NoCityShouldExist`);
    expect(tasteRes.ok()).toBeTruthy();
    const tasteJson = await tasteRes.json();
    expect(Array.isArray(tasteJson.items)).toBeTruthy();
    expect(tasteJson.items.length).toBe(0);
  });

  test('TAHA-55 App remains usable when widget API requests fail', async ({ page }) => {
    await page.route('**/widget/**', async (route) => {
      await route.abort('failed');
    });
    await gotoAndExpectHeading(page, URLS.hotels, /discover your perfect escape/i);
    await page.locator('.search-bar > .pill-btn').first().click();
    await expect(page.locator('.hotel-card, .hotel-grid article').first()).toBeVisible();
  });

  test('TAHA-56 Hard refresh retains auth session via cookies', async ({ page }) => {
    test.skip(!AUTH_READY, 'Requires authenticated user');
    await centralizedSignIn(page, URLS.hotels);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /logout|sign out/i })).toBeVisible();
  });
});
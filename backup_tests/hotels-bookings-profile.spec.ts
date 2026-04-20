import { test, expect } from '@playwright/test';
import { URLS, AUTH_READY, centralizedSignIn } from './_shared';

function datePlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

test.describe('Hotels bookings and profile cases', () => {
  test('TAHA-31 Successful booking appears in My Bookings', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Hotel+QA&city=Miami&roomType=Deluxe&pricePerNight=1000&checkIn=${datePlus(2)}&checkOut=${datePlus(4)}`);
    await page.locator('input[placeholder*="Passport"]').fill('QA-1234567');
    await page.getByRole('button', { name: /confirm elegant booking/i }).click();
    await expect(page).toHaveURL(/\/my-bookings/);
    await expect(page.getByRole('heading', { name: /my bookings/i })).toBeVisible();
  });

  test('TAHA-32 Active bookings section shows confirmed status', async ({ page }) => {
    await page.goto(`${URLS.hotels}/my-bookings`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/confirmed stays|active bookings|confirmed/i).first()).toBeVisible();
  });

  test('TAHA-33 Cancel booking changes status to CANCELLED', async ({ page }) => {
    await page.goto(`${URLS.hotels}/my-bookings`, { waitUntil: 'domcontentloaded' });
    const cancelBtn = page.getByRole('button', { name: /cancel booking/i }).first();
    test.skip((await cancelBtn.count()) === 0, 'No active booking available to cancel');
    await cancelBtn.click();
    await expect(page.getByText(/cancelled/i).first()).toBeVisible();
  });

  test('TAHA-34 Cancelled section displays cancelled booking card', async ({ page }) => {
    await page.goto(`${URLS.hotels}/my-bookings`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/cancelled stays|past bookings|cancelled/i).first()).toBeVisible();
  });

  test('TAHA-35 Empty state shown when user has no bookings', async ({ request }) => {
    const email = `no-bookings-${Date.now()}@example.com`;
    const res = await request.get(`${URLS.hotelsApi}/bookings/my?email=${encodeURIComponent(email)}`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBe(0);
  });

  test('TAHA-36 Guest profile shows sign-in required state', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(`${URLS.hotels}/profile`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/please sign in/i)).toBeVisible();
  });

  test('TAHA-37 Profile validation rejects invalid email and short phone', async ({ page }) => {
    test.skip(!AUTH_READY, 'Requires authenticated user');
    await centralizedSignIn(page, `${URLS.hotels}/profile`);
    await page.locator('input').nth(1).fill('bad-email');
    await page.locator('input').nth(2).fill('123');
    await page.locator('input').nth(2).blur();
    await expect(page.getByText(/valid email address|valid mobile number/i)).toBeVisible();
  });

  test('TAHA-38 Valid profile save shows success confirmation', async ({ page }) => {
    test.skip(!AUTH_READY, 'Requires authenticated user');
    await centralizedSignIn(page, `${URLS.hotels}/profile`);
    const nameInput = page.locator('input').nth(0);
    const phoneInput = page.locator('input').nth(2);
    const existingName = await nameInput.inputValue();
    const nextName = existingName.trim().toLowerCase() === 'qa user' ? 'QA User 2' : 'QA User';
    await nameInput.fill(nextName);
    await phoneInput.fill('9876543210');
    const saveBtn = page.getByRole('button', { name: /save profile/i });
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();
    await expect(page.getByText(/saved successfully|all changes saved/i)).toBeVisible();
  });
});
import { test, expect } from '@playwright/test';
import { URLS, gotoAndExpectHeading } from './_shared';

test.describe('Luxe Travel Smoke Suite - 20 Cases', () => {
  test.describe.configure({ mode: 'parallel' });
  
  test.beforeEach(async ({ page }) => {
    // We intentionally expect "Perfect Escape" but the code says "Imperfect Escape"
    // This will be one of our FAIL cases.
  });

  // 1. HOME & UI
  test('TAHA-1 Hotels home page renders correctly', async ({ page }) => {
    await page.goto(URLS.hotels);
    await expect(page.getByRole('heading', { name: /discover your perfect escape/i })).toBeVisible({ timeout: 5000 });
  });

  test('TAHA-2 Login portal visibility', async ({ page }) => {
    await page.goto(URLS.login);
    await expect(page.getByRole('heading', { name: /luxe travel login/i })).toBeVisible();
  });

  test('TAHA-3 Taste Explorer basic load', async ({ page }) => {
    await page.goto(URLS.taste);
    await expect(page.locator('header')).toContainText(/taste explorer/i);
  });

  // 4. AUTH LOGIC
  test('TAHA-4 Invalid login rejection', async ({ page }) => {
    await page.goto(URLS.login);
    await page.locator('input[type="email"]').fill('fail@test.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await expect(page.getByText(/invalid|failed/i)).toBeVisible();
  });

  test('TAHA-5 Security: External ReturnTo block', async ({ page }) => {
    await page.goto(`${URLS.login}?returnTo=https://evil.com`);
    await expect(page).toHaveURL(/localhost:5173/);
  });

  // 6. SEARCH FUNCTIONALITY
  test('TAHA-6 Search button is present', async ({ page }) => {
    await page.goto(URLS.hotels);
    await expect(page.locator('.pill-btn').first()).toBeVisible();
  });

  test('TAHA-7 Destination picker opens', async ({ page }) => {
    await page.goto(URLS.hotels);
    await page.locator('.hotel-city-trigger').first().click();
    await expect(page.locator('.hotel-search-suggestion')).toBeVisible();
  });

  test('TAHA-8 City options are populated', async ({ page }) => {
    await page.goto(URLS.hotels);
    await page.locator('.hotel-city-trigger').first().click();
    const count = await page.locator('.hotel-search-suggestion').count();
    expect(count).toBeGreaterThan(0);
  });

  test('TAHA-9 Room type filter presence', async ({ page }) => {
    await page.goto(URLS.hotels);
    await expect(page.locator('.hotel-city-trigger').nth(1)).toBeVisible();
  });

  test('TAHA-10 Search results render on click', async ({ page }) => {
    await page.goto(URLS.hotels);
    await page.locator('.pill-btn').first().click();
    await expect(page.locator('article')).toBeVisible();
  });

  // 11. BOOKING FLOW
  test('TAHA-11 Book Now button visibility', async ({ page }) => {
    await page.goto(URLS.hotels);
    await page.locator('.pill-btn').first().click();
    await expect(page.getByRole('button', { name: /book now/i }).first()).toBeVisible();
  });

  test('TAHA-12 Navigation to Booking Page', async ({ page }) => {
    await page.goto(URLS.hotels);
    await page.locator('.pill-btn').first().click();
    await page.getByRole('button', { name: /book now/i }).first().click();
    await expect(page).toHaveURL(/\/booking/);
  });

  test('TAHA-13 Check-in date input exists', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Test`);
    await expect(page.locator('input[type="date"]').first()).toBeVisible();
  });

  test('TAHA-14 Check-out date input exists', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Test`);
    await expect(page.locator('input[type="date"]').nth(1)).toBeVisible();
  });

  // 15. CALCULATIONS & VALIDATION (FAILED CASES)
  test('TAHA-15 Booking summary display', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Test`);
    await expect(page.locator('.booking-summary-row')).toBeVisible();
  });

  test('TAHA-16 Nights calculation accuracy', async ({ page }) => {
    // This will FAIL due to my off-by-one bug in BookingPage.tsx
    await page.goto(`${URLS.hotels}/booking?hotelName=Test&checkIn=2026-05-01&checkOut=2026-05-04`);
    await expect(page.locator('.booking-summary-row')).toContainText('3');
  });

  test('TAHA-17 Total price numeric check', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Test&pricePerNight=1000&checkIn=2026-05-01&checkOut=2026-05-04`);
    await expect(page.locator('.booking-summary-total')).toContainText(/3,000|3000/);
  });

  test('TAHA-18 Government ID format validation', async ({ page }) => {
    // This will FAIL due to my 100-digit regex bug
    await page.goto(`${URLS.hotels}/booking?hotelName=Test`);
    await page.locator('input[placeholder*="Passport"]').fill('ABC123456');
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.getByText(/valid government id/i)).not.toBeVisible();
  });

  test('TAHA-19 Guest capacity validation', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Test&roomType=Standard`);
    await page.locator('input[type="number"]').nth(1).fill('10');
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.locator('.booking-error')).toBeVisible();
  });

  test('TAHA-20 Booking form submission button', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Test`);
    await expect(page.getByRole('button', { name: /confirm/i })).toBeVisible();
  });

});

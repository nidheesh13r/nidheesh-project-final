import { test, expect } from '@playwright/test';
import { URLS } from './_shared';

test.describe('Luxe Travel Smoke Suite - 20 Cases', () => {
  test.describe.configure({ mode: 'parallel' });

  // ─── 1-3: HOME & UI ───
  test('TAHA-1 Hotels home page renders correctly', async ({ page }) => {
    await page.goto(URLS.hotels);
    // BUG: heading says "Imperfect" but test expects "Perfect" → intentional FAIL
    await expect(page.getByRole('heading', { name: /discover your perfect escape/i })).toBeVisible({ timeout: 5000 });
  });

  test('TAHA-2 Login portal visibility', async ({ page }) => {
    await page.goto(URLS.login);
    await expect(page.getByRole('heading', { name: /luxe travel login/i })).toBeVisible();
  });
  
  test('TAHA-3 Taste Explorer basic load', async ({ page }) => {
    await page.goto(URLS.taste);
    await expect(page.locator('header')).toBeVisible();
  });

  // ─── 4-5: AUTH LOGIC ───
  test('TAHA-4 Invalid login shows error feedback', async ({ page }) => {
    await page.goto(URLS.login);
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.locator('form input[type="email"]').first().fill('fail@test.com');
    await page.locator('form input[type="password"]').first().fill('wrongpassword');
    await page.locator('form').first().getByRole('button', { name: /^sign in$/i }).click();
    await expect(page.getByText(/failed|invalid|error|incorrect/i)).toBeVisible({ timeout: 10000 });
  });

  test('TAHA-5 Security: External ReturnTo block', async ({ page }) => {
    await page.goto(`${URLS.login}?returnTo=https://evil.com`);
    await expect(page).toHaveURL(/localhost:5173/);
  });

  // ─── 6-9: SEARCH FUNCTIONALITY ───
  test('TAHA-6 Search button is present', async ({ page }) => {
    await page.goto(URLS.hotels);
    await expect(page.locator('.pill-btn').first()).toBeVisible();
  });

  test('TAHA-7 Destination picker opens', async ({ page }) => {
    await page.goto(URLS.hotels);
    await page.locator('.hotel-city-trigger').first().click();
    await expect(page.locator('.hotel-search-suggestion').first()).toBeVisible();
  });

  test('TAHA-8 City options are populated', async ({ page }) => {
    await page.goto(URLS.hotels);
    await page.locator('.hotel-city-trigger').first().click();
    const count = await page.locator('.hotel-search-suggestion').count();
    expect(count).toBeGreaterThan(0);
  });

  test('TAHA-9 Room type filter presence', async ({ page }) => {
    await page.goto(URLS.hotels);
    await expect(page.locator('.search-cell').nth(3)).toBeVisible();
  });

  test('TAHA-10 Search results render on click', async ({ page }) => {
    await page.goto(URLS.hotels);
    await page.locator('.pill-btn').first().click();
    await expect(page.locator('.hotel-card').first()).toBeVisible({ timeout: 10000 });
  });

  // ─── 11-14: BOOKING FLOW ───
  test('TAHA-11 Book Now button visibility', async ({ page }) => {
    await page.goto(URLS.hotels);
    await page.locator('.pill-btn').first().click();
    await page.waitForSelector('.hotel-card', { timeout: 10000 });
    await expect(page.getByRole('button', { name: /book now/i }).first()).toBeVisible();
  });

  test('TAHA-12 Navigation to Booking Page', async ({ page }) => {
    await page.goto(URLS.hotels);
    await page.locator('.pill-btn').first().click();
    await page.waitForSelector('.hotel-card', { timeout: 10000 });
    await page.getByRole('button', { name: /book now/i }).first().click();
    await expect(page).toHaveURL(/\/booking/);
  });

  test('TAHA-13 Check-in date input exists', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Test&city=Mumbai&roomType=Deluxe&pricePerNight=1000`);
    await expect(page.locator('input[type="date"]').first()).toBeVisible();
  });

  test('TAHA-14 Check-out date input exists', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Test&city=Mumbai&roomType=Deluxe&pricePerNight=1000`);
    await expect(page.locator('input[type="date"]').nth(1)).toBeVisible();
  });

  // ─── 15-18: CALCULATIONS & VALIDATION ───
  test('TAHA-15 Booking summary display', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Test&city=Mumbai&roomType=Deluxe&pricePerNight=1000`);
    await expect(page.locator('.booking-summary-row').first()).toBeVisible();
  });

  test('TAHA-16 Nights calculation accuracy', async ({ page }) => {
    // BUG: off-by-one in BookingPage → intentional FAIL (shows 2 instead of 3)
    await page.goto(`${URLS.hotels}/booking?hotelName=Test&city=Mumbai&roomType=Deluxe&pricePerNight=1000&checkIn=2026-05-01&checkOut=2026-05-04`);
    await expect(page.getByText('Nights')).toBeVisible();
    await expect(page.locator('.booking-summary-row').first()).toContainText('3');
  });

  test('TAHA-17 Total price numeric check', async ({ page }) => {
    // Depends on nights bug → also FAILS (shows 2000 instead of 3000)
    await page.goto(`${URLS.hotels}/booking?hotelName=Test&city=Mumbai&roomType=Deluxe&pricePerNight=1000&checkIn=2026-05-01&checkOut=2026-05-04`);
    await expect(page.locator('.booking-summary-total')).toContainText(/3,000|3000/);
  });

  test('TAHA-18 Government ID format validation', async ({ page }) => {
    // BUG: regex requires 100 digits → intentional FAIL (valid ID is rejected)
    await page.goto(`${URLS.hotels}/booking?hotelName=Test&city=Mumbai&roomType=Deluxe&pricePerNight=1000`);
    await page.locator('input[placeholder*="Passport"]').fill('ABC123456');
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.getByText(/valid government id/i)).not.toBeVisible();
  });

  // ─── 19-20: MISC VALIDATION ───
  test('TAHA-19 Guest capacity validation', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Test&city=Mumbai&roomType=Standard&pricePerNight=1000`);
    await page.locator('input[type="number"]').nth(1).fill('10');
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.locator('.booking-error')).toBeVisible();
  });

  test('TAHA-20 Booking form submission button', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Test&city=Mumbai&roomType=Deluxe&pricePerNight=1000`);
    await expect(page.getByRole('button', { name: /confirm/i })).toBeVisible();
  });
});

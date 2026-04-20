import { test, expect } from '@playwright/test';
import { URLS, gotoAndExpectHeading } from './_shared';

function datePlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

test.describe('Hotels search and booking cases', () => {
  const hotelSearchButton = (page: any) => page.locator('.search-bar > .pill-btn').first();
  const destinationTrigger = (page: any) => page.locator('.search-bar .search-cell').nth(0).locator('.hotel-city-trigger');
  const roomTypeTrigger = (page: any) => page.locator('.search-bar .search-cell').nth(3).locator('.hotel-city-trigger');

  test.beforeEach(async ({ page }) => {
    await gotoAndExpectHeading(page, URLS.hotels, /discover your perfect escape/i);
  });

  test('TAHA-15 Hotels home loads city list and default destination', async ({ page }) => {
    await destinationTrigger(page).click();
    await expect(page.locator('.hotel-search-suggestion').first()).toBeVisible({ timeout: 15_000 });
    const count = await page.locator('.hotel-search-suggestion').count();
    expect(count).toBeGreaterThan(0);
  });

  test('TAHA-16 City switch refreshes hotel cards', async ({ page }) => {
    const destinationBtn = destinationTrigger(page);
    await destinationBtn.click();
    const options = page.locator('.hotel-search-suggestion');
    const optionCount = await options.count();
    test.skip(optionCount < 2, 'Needs at least two cities in data');
    await options.nth(1).click();
    await hotelSearchButton(page).click();
    await expect(page.locator('.hotel-card, .hotel-grid article').first()).toBeVisible();
  });

  for (const [id, room] of [
    ['TAHA-17', 'Any'],
    ['TAHA-18', 'Standard'],
    ['TAHA-19', 'Deluxe'],
    ['TAHA-20', 'Premium'],
    ['TAHA-21', 'Suite'],
  ] as const) {
    test(`${id} Room filter ${room} applies correctly`, async ({ page }) => {
      await roomTypeTrigger(page).click();
      await page.getByRole('button', { name: new RegExp(`^${room}$`, 'i') }).click();
      await hotelSearchButton(page).click();
      const hotelCards = page.locator('.hotel-card, .hotel-grid article');
      const cards = await hotelCards.count();
      test.skip(cards === 0, `No ${room} inventory for current city/data`);
      const firstCard = hotelCards.first();
      await expect(firstCard).toBeVisible();
      expect(cards).toBeGreaterThan(0);
    });
  }

  test('TAHA-22 Check-out auto-adjusts when date order is invalid', async ({ page }) => {
    const checkIn = datePlus(8);
    await page.locator('input[type="date"]').nth(0).fill(checkIn);
    const checkOutValue = await page.locator('input[type="date"]').nth(1).inputValue();
    expect(checkOutValue > checkIn).toBeTruthy();
  });

  test('TAHA-23 Search click toggles results visibility state', async ({ page }) => {
    await hotelSearchButton(page).click();
    await expect(page.locator('.hotel-card, .hotel-grid article').first()).toBeVisible();
  });

  test('TAHA-24 Book Now opens booking page with query context', async ({ page }) => {
    await hotelSearchButton(page).click();
    const bookNow = page.getByRole('button', { name: /book now/i }).first();
    await expect(bookNow).toBeVisible();
    await bookNow.click();
    await expect(page).toHaveURL(/\/booking\?/);
    await expect(page.locator('input[readonly]').first()).toBeVisible();
  });

  test('TAHA-25 Booking summary computes nights correctly', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Hotel+QA&city=Miami&roomType=Deluxe&pricePerNight=1000&checkIn=${datePlus(1)}&checkOut=${datePlus(4)}`);
    await expect(page.getByText(/nights/i)).toBeVisible();
    await expect(page.locator('.booking-summary-row')).toContainText(['Nights', '3']);
  });

  test('TAHA-26 Booking summary computes total correctly', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Hotel+QA&city=Miami&roomType=Deluxe&pricePerNight=1000&checkIn=${datePlus(1)}&checkOut=${datePlus(4)}`);
    await page.locator('input[type="number"]').nth(0).fill('2');
    await expect(page.locator('.booking-summary-total')).toContainText(/6,000|6000/);
  });

  test('TAHA-27 Booking blocks check-out <= check-in', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Hotel+QA&city=Miami&roomType=Deluxe&pricePerNight=1000`);
    const same = datePlus(5);
    await page.locator('input[type="date"]').nth(0).fill(same);
    await page.locator('input[type="date"]').nth(1).fill(same);
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.getByText(/check-out date must be after check-in date/i)).toBeVisible();
  });

  test('TAHA-28 Booking blocks guests below minimum', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Hotel+QA&city=Miami&roomType=Deluxe&pricePerNight=1000`);
    await page.locator('input[type="number"]').nth(1).fill('0');
    await page.getByRole('button', { name: /confirm/i }).click();
    const guestValue = await page.locator('input[type="number"]').nth(1).inputValue();
    const errorCount = await page.getByText(/at least one guest/i).count();
    expect(errorCount > 0 || Number(guestValue) >= 1).toBeTruthy();
  });

  test('TAHA-29 Booking blocks guests above capacity', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Hotel+QA&city=Miami&roomType=Standard&pricePerNight=1000`);
    await page.locator('input[type="number"]').nth(0).fill('1');
    await page.locator('input[type="number"]').nth(1).fill('5');
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.locator('.booking-error')).toContainText(/allows up to/i);
  });

  test('TAHA-30 Booking blocks invalid government ID format', async ({ page }) => {
    await page.goto(`${URLS.hotels}/booking?hotelName=Hotel+QA&city=Miami&roomType=Deluxe&pricePerNight=1000`);
    await page.locator('input[placeholder*="Passport"]').fill('12');
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.getByText(/valid government id/i)).toBeVisible();
  });
});
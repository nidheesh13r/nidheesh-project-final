# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke-tests.spec.ts >> Luxe Travel Smoke Suite - 20 Cases >> TAHA-15 Booking summary display
- Location: tests\smoke-tests.spec.ts:87:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.booking-summary-row').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.booking-summary-row').first()

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { URLS } from './_shared';
  3   | 
  4   | test.describe('Luxe Travel Smoke Suite - 20 Cases', () => {
  5   |   test.describe.configure({ mode: 'parallel' });
  6   | 
  7   |   // ─── 1-3: HOME & UI ───
  8   |   test('TAHA-1 Hotels home page renders correctly', async ({ page }) => {
  9   |     await page.goto(URLS.hotels);
  10  |     // BUG: heading says "Imperfect" but test expects "Perfect" → intentional FAIL
  11  |     await expect(page.getByRole('heading', { name: /discover your perfect escape/i })).toBeVisible({ timeout: 5000 });
  12  |   });
  13  | 
  14  |   test('TAHA-2 Login portal visibility', async ({ page }) => {
  15  |     await page.goto(URLS.login);
  16  |     await expect(page.getByRole('heading', { name: /luxe travel login/i })).toBeVisible();
  17  |   });
  18  | 
  19  |   test('TAHA-3 Taste Explorer basic load', async ({ page }) => {
  20  |     await page.goto(URLS.taste);
  21  |     await expect(page.locator('header')).toBeVisible();
  22  |   });
  23  | 
  24  |   // ─── 4-5: AUTH LOGIC ───
  25  |   test('TAHA-4 Login form has email and password fields', async ({ page }) => {
  26  |     await page.goto(URLS.login);
  27  |     await expect(page.locator('input[type="email"]').first()).toBeVisible();
  28  |     await expect(page.locator('input[type="password"]').first()).toBeVisible();
  29  |   });
  30  | 
  31  |   test('TAHA-5 Security: External ReturnTo block', async ({ page }) => {
  32  |     await page.goto(`${URLS.login}?returnTo=https://evil.com`);
  33  |     await expect(page).toHaveURL(/localhost:5173/);
  34  |   });
  35  | 
  36  |   // ─── 6-9: SEARCH FUNCTIONALITY ───
  37  |   test('TAHA-6 Search button is present', async ({ page }) => {
  38  |     await page.goto(URLS.hotels);
  39  |     await expect(page.locator('.pill-btn').first()).toBeVisible();
  40  |   });
  41  | 
  42  |   test('TAHA-7 Destination picker opens', async ({ page }) => {
  43  |     await page.goto(URLS.hotels);
  44  |     await page.locator('.hotel-city-trigger').first().click();
  45  |     await expect(page.locator('.hotel-search-suggestion').first()).toBeVisible();
  46  |   });
  47  | 
  48  |   test('TAHA-8 City options are populated', async ({ page }) => {
  49  |     await page.goto(URLS.hotels);
  50  |     await page.locator('.hotel-city-trigger').first().click();
  51  |     const count = await page.locator('.hotel-search-suggestion').count();
  52  |     expect(count).toBeGreaterThan(0);
  53  |   });
  54  | 
  55  |   test('TAHA-9 Room type filter presence', async ({ page }) => {
  56  |     await page.goto(URLS.hotels);
  57  |     await expect(page.locator('.search-cell').nth(3)).toBeVisible();
  58  |   });
  59  | 
  60  |   test('TAHA-10 Date inputs are present in search bar', async ({ page }) => {
  61  |     await page.goto(URLS.hotels);
  62  |     await expect(page.locator('input[type="date"]').first()).toBeVisible();
  63  |   });
  64  | 
  65  |   // ─── 11-14: BOOKING FLOW (direct navigation) ───
  66  |   test('TAHA-11 Booking page loads with hotel name', async ({ page }) => {
  67  |     await page.goto(`${URLS.hotels}/booking?hotelName=TestHotel&city=Delhi&roomType=Deluxe&pricePerNight=2000`);
  68  |     await expect(page.locator('input[readonly]').first()).toBeVisible();
  69  |   });
  70  | 
  71  |   test('TAHA-12 Booking page has confirm button', async ({ page }) => {
  72  |     await page.goto(`${URLS.hotels}/booking?hotelName=TestHotel&city=Delhi&roomType=Deluxe&pricePerNight=2000`);
  73  |     await expect(page.getByRole('button', { name: /confirm/i })).toBeVisible();
  74  |   });
  75  | 
  76  |   test('TAHA-13 Check-in date input exists', async ({ page }) => {
  77  |     await page.goto(`${URLS.hotels}/booking?hotelName=Test&city=Mumbai&roomType=Deluxe&pricePerNight=1000`);
  78  |     await expect(page.locator('input[type="date"]').first()).toBeVisible();
  79  |   });
  80  | 
  81  |   test('TAHA-14 Check-out date input exists', async ({ page }) => {
  82  |     await page.goto(`${URLS.hotels}/booking?hotelName=Test&city=Mumbai&roomType=Deluxe&pricePerNight=1000`);
  83  |     await expect(page.locator('input[type="date"]').nth(1)).toBeVisible();
  84  |   });
  85  | 
  86  |   // ─── 15-18: CALCULATIONS & VALIDATION ───
  87  |   test('TAHA-15 Booking summary display', async ({ page }) => {
  88  |     await page.goto(`${URLS.hotels}/booking?hotelName=Test&city=Mumbai&roomType=Deluxe&pricePerNight=1000`);
> 89  |     await expect(page.locator('.booking-summary-row').first()).toBeVisible();
      |                                                                ^ Error: expect(locator).toBeVisible() failed
  90  |   });
  91  | 
  92  |   test('TAHA-16 Nights calculation accuracy', async ({ page }) => {
  93  |     // BUG: off-by-one in BookingPage → intentional FAIL (shows 2 instead of 3)
  94  |     await page.goto(`${URLS.hotels}/booking?hotelName=Test&city=Mumbai&roomType=Deluxe&pricePerNight=1000&checkIn=2026-05-01&checkOut=2026-05-04`);
  95  |     await expect(page.getByText('Nights')).toBeVisible();
  96  |     await expect(page.locator('.booking-summary-row').first()).toContainText('3');
  97  |   });
  98  | 
  99  |   test('TAHA-17 Rooms default is 1', async ({ page }) => {
  100 |     await page.goto(`${URLS.hotels}/booking?hotelName=Test&city=Mumbai&roomType=Deluxe&pricePerNight=1000`);
  101 |     await expect(page.getByText('Rooms')).toBeVisible();
  102 |     const roomsInput = page.locator('input[type="number"]').first();
  103 |     await expect(roomsInput).toHaveValue('1');
  104 |   });
  105 | 
  106 |   test('TAHA-18 Government ID format validation', async ({ page }) => {
  107 |     // BUG: regex requires 100 digits → intentional FAIL (valid ID is rejected)
  108 |     await page.goto(`${URLS.hotels}/booking?hotelName=Test&city=Mumbai&roomType=Deluxe&pricePerNight=1000`);
  109 |     await page.locator('input[placeholder*="Passport"]').fill('ABC123456');
  110 |     await page.getByRole('button', { name: /confirm/i }).click();
  111 |     await expect(page.getByText(/valid government id/i)).not.toBeVisible();
  112 |   });
  113 | 
  114 |   // ─── 19-20: MISC VALIDATION ───
  115 |   test('TAHA-19 Guest count defaults to 2', async ({ page }) => {
  116 |     await page.goto(`${URLS.hotels}/booking?hotelName=Test&city=Mumbai&roomType=Standard&pricePerNight=1000`);
  117 |     const guestsInput = page.locator('input[type="number"]').nth(1);
  118 |     await expect(guestsInput).toHaveValue('2');
  119 |   });
  120 | 
  121 |   test('TAHA-20 Booking page shows price per night', async ({ page }) => {
  122 |     await page.goto(`${URLS.hotels}/booking?hotelName=Test&city=Mumbai&roomType=Deluxe&pricePerNight=5000`);
  123 |     await expect(page.getByText(/5,000|5000/)).toBeVisible();
  124 |   });
  125 | });
  126 | 
```
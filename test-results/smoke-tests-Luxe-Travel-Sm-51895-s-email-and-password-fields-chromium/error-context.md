# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke-tests.spec.ts >> Luxe Travel Smoke Suite - 20 Cases >> TAHA-4 Login form has email and password fields
- Location: tests\smoke-tests.spec.ts:25:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[type="email"]').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('input[type="email"]').first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "LUXE Hotels Host Shell" [ref=e6] [cursor=pointer]:
        - /url: /
        - text: LUXE Hotels
        - generic [ref=e7]: Host Shell
      - navigation [ref=e8]:
        - link "Home" [ref=e9] [cursor=pointer]:
          - /url: /
        - link "My Bookings" [ref=e10] [cursor=pointer]:
          - /url: /my-bookings
        - link "Profile" [ref=e11] [cursor=pointer]:
          - /url: /profile
        - button "Sign In" [ref=e12] [cursor=pointer]
  - generic [ref=e13]:
    - heading "Discover Your Imperfect Escape." [level=1] [ref=e14]
    - generic [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e17]: Destination
        - button "Ahmedabad ▾" [ref=e18] [cursor=pointer]:
          - generic [ref=e19]: Ahmedabad
          - generic [ref=e20]: ▾
      - generic [ref=e21]:
        - generic [ref=e22]: Check in
        - generic [ref=e23]:
          - textbox [ref=e24]: 2026-04-21
          - button "Open check-in calendar" [ref=e25] [cursor=pointer]:
            - img [ref=e26]
      - generic [ref=e28]:
        - generic [ref=e29]: Check out
        - generic [ref=e30]:
          - textbox [ref=e31]: 2026-04-23
          - button "Open check-out calendar" [ref=e32] [cursor=pointer]:
            - img [ref=e33]
      - generic [ref=e35]:
        - generic [ref=e36]: Room Type
        - button "Any ▾" [ref=e37] [cursor=pointer]:
          - generic [ref=e38]: Any
          - generic [ref=e39]: ▾
      - button "Search" [ref=e40] [cursor=pointer]
  - main [ref=e41]:
    - generic [ref=e44]: Choose your destination and filters, then click Search to view hotels.
    - complementary [ref=e45]:
      - generic [ref=e46]:
        - generic [ref=e47]: Mini MFE
        - heading "Luxe Taste Explorer" [level=3] [ref=e48]
        - paragraph [ref=e49]: Search signature dishes by restaurant within the selected city.
      - generic [ref=e50]:
        - generic [ref=e51]: City
        - button "Ahmedabad ▾" [ref=e52] [cursor=pointer]:
          - generic [ref=e53]: Ahmedabad
          - generic [ref=e54]: ▾
      - generic [ref=e55]:
        - generic [ref=e56]: Restaurant Search
        - textbox "Restaurant Search" [ref=e57]:
          - /placeholder: Type restaurant name
      - generic [ref=e58]:
        - button "Search" [ref=e59] [cursor=pointer]
        - button "Clear" [ref=e60] [cursor=pointer]
      - generic [ref=e61]:
        - article [ref=e62]:
          - generic [ref=e63]:
            - generic [ref=e64]: Gujarati Thali
            - generic [ref=e65]: Ahmedabad
          - paragraph [ref=e66]: Agashiye • Ahmedabad
        - article [ref=e67]:
          - generic [ref=e68]:
            - generic [ref=e69]: Undhiyu
            - generic [ref=e70]: Ahmedabad
          - paragraph [ref=e71]: Agashiye • Ahmedabad
        - article [ref=e72]:
          - generic [ref=e73]:
            - generic [ref=e74]: Dal Dhokli
            - generic [ref=e75]: Ahmedabad
          - paragraph [ref=e76]: Agashiye • Ahmedabad
        - article [ref=e77]:
          - generic [ref=e78]:
            - generic [ref=e79]: Handvo
            - generic [ref=e80]: Ahmedabad
          - paragraph [ref=e81]: Agashiye • Ahmedabad
        - article [ref=e82]:
          - generic [ref=e83]:
            - generic [ref=e84]: Basundi
            - generic [ref=e85]: Ahmedabad
          - paragraph [ref=e86]: Agashiye • Ahmedabad
        - article [ref=e87]:
          - generic [ref=e88]:
            - generic [ref=e89]: Panki
            - generic [ref=e90]: Ahmedabad
          - paragraph [ref=e91]: Swati Snacks • Ahmedabad
        - article [ref=e92]:
          - generic [ref=e93]:
            - generic [ref=e94]: Khaman
            - generic [ref=e95]: Ahmedabad
          - paragraph [ref=e96]: Swati Snacks • Ahmedabad
        - article [ref=e97]:
          - generic [ref=e98]:
            - generic [ref=e99]: Patra
            - generic [ref=e100]: Ahmedabad
          - paragraph [ref=e101]: Swati Snacks • Ahmedabad
        - article [ref=e102]:
          - generic [ref=e103]:
            - generic [ref=e104]: Sev Puri
            - generic [ref=e105]: Ahmedabad
          - paragraph [ref=e106]: Swati Snacks • Ahmedabad
        - article [ref=e107]:
          - generic [ref=e108]:
            - generic [ref=e109]: Handvo
            - generic [ref=e110]: Ahmedabad
          - paragraph [ref=e111]: Swati Snacks • Ahmedabad
        - article [ref=e112]:
          - generic [ref=e113]:
            - generic [ref=e114]: Gujarati Thali
            - generic [ref=e115]: Ahmedabad
          - paragraph [ref=e116]: Gordhan Thal • Ahmedabad
        - article [ref=e117]:
          - generic [ref=e118]:
            - generic [ref=e119]: Dhokla
            - generic [ref=e120]: Ahmedabad
          - paragraph [ref=e121]: Gordhan Thal • Ahmedabad
        - article [ref=e122]:
          - generic [ref=e123]:
            - generic [ref=e124]: Fafda
            - generic [ref=e125]: Ahmedabad
          - paragraph [ref=e126]: Gordhan Thal • Ahmedabad
        - article [ref=e127]:
          - generic [ref=e128]:
            - generic [ref=e129]: Kadhi Khichdi
            - generic [ref=e130]: Ahmedabad
          - paragraph [ref=e131]: Gordhan Thal • Ahmedabad
        - article [ref=e132]:
          - generic [ref=e133]:
            - generic [ref=e134]: Shrikhand
            - generic [ref=e135]: Ahmedabad
          - paragraph [ref=e136]: Gordhan Thal • Ahmedabad
        - article [ref=e137]:
          - generic [ref=e138]:
            - generic [ref=e139]: Khaman
            - generic [ref=e140]: Ahmedabad
          - paragraph [ref=e141]: Das Khaman • Ahmedabad
        - article [ref=e142]:
          - generic [ref=e143]:
            - generic [ref=e144]: Nylon Khaman
            - generic [ref=e145]: Ahmedabad
          - paragraph [ref=e146]: Das Khaman • Ahmedabad
        - article [ref=e147]:
          - generic [ref=e148]:
            - generic [ref=e149]: Patra
            - generic [ref=e150]: Ahmedabad
          - paragraph [ref=e151]: Das Khaman • Ahmedabad
        - article [ref=e152]:
          - generic [ref=e153]:
            - generic [ref=e154]: Dhokla Sandwich
            - generic [ref=e155]: Ahmedabad
          - paragraph [ref=e156]: Das Khaman • Ahmedabad
        - article [ref=e157]:
          - generic [ref=e158]:
            - generic [ref=e159]: Jalebi
            - generic [ref=e160]: Ahmedabad
          - paragraph [ref=e161]: Das Khaman • Ahmedabad
        - article [ref=e162]:
          - generic [ref=e163]:
            - generic [ref=e164]: Bhaji Pav
            - generic [ref=e165]: Ahmedabad
          - paragraph [ref=e166]: Manek Chowk Food Market • Ahmedabad
        - article [ref=e167]:
          - generic [ref=e168]:
            - generic [ref=e169]: Ghotala Dosa
            - generic [ref=e170]: Ahmedabad
          - paragraph [ref=e171]: Manek Chowk Food Market • Ahmedabad
        - article [ref=e172]:
          - generic [ref=e173]:
            - generic [ref=e174]: Chocolate Sandwich
            - generic [ref=e175]: Ahmedabad
          - paragraph [ref=e176]: Manek Chowk Food Market • Ahmedabad
        - article [ref=e177]:
          - generic [ref=e178]:
            - generic [ref=e179]: Kulfi
            - generic [ref=e180]: Ahmedabad
          - paragraph [ref=e181]: Manek Chowk Food Market • Ahmedabad
        - article [ref=e182]:
          - generic [ref=e183]:
            - generic [ref=e184]: Pulao
            - generic [ref=e185]: Ahmedabad
          - paragraph [ref=e186]: Manek Chowk Food Market • Ahmedabad
      - button "Open Full Taste Library" [ref=e187] [cursor=pointer]
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
> 27  |     await expect(page.locator('input[type="email"]').first()).toBeVisible();
      |                                                               ^ Error: expect(locator).toBeVisible() failed
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
  89  |     await expect(page.locator('.booking-summary-row').first()).toBeVisible();
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
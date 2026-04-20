import { expect, Page, APIRequestContext } from '@playwright/test';

export const URLS = {
  login: process.env.LOGIN_URL || 'http://localhost:5173',
  hotels: process.env.HOTELS_URL || 'http://localhost:5174',
  taste: process.env.TASTE_URL || 'http://localhost:5176',
  hotelsApi: process.env.HOTELS_API || 'http://localhost:8001',
  tasteApi: process.env.TASTE_API || 'http://localhost:8002',
};

function toBool(value: string | undefined, fallback = false): boolean {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

export const AUTH_EMAIL = process.env.E2E_EMAIL || 'nidheeshraj11@gmail.com';
export const AUTH_PASSWORD = process.env.E2E_PASSWORD || 'nid123';
export const RUN_AUTH_TESTS = toBool(process.env.RUN_AUTH_TESTS, false);
export const RUN_SIGNUP_TESTS = toBool(process.env.RUN_SIGNUP_TESTS, false);

export const AUTH_READY = RUN_AUTH_TESTS && Boolean(AUTH_EMAIL) && Boolean(AUTH_PASSWORD);

export async function expectServiceHealthy(request: APIRequestContext, serviceUrl: string, serviceName: string): Promise<void> {
  const res = await request.get(`${serviceUrl}/health`);
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(data.status).toBe('ok');
  expect(data.service).toBe(serviceName);
}

export async function gotoAndExpectHeading(page: Page, url: string, headingRegex: RegExp): Promise<void> {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: headingRegex })).toBeVisible();
}

export async function centralizedSignIn(page: Page, returnTo?: string): Promise<void> {
  const loginUrl = returnTo
    ? `${URLS.login}?returnTo=${encodeURIComponent(returnTo)}`
    : URLS.login;
  await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /sign in/i }).first().click();
  await page.locator('form input[type="email"]').first().fill(AUTH_EMAIL);
  await page.locator('form input[type="password"]').first().fill(AUTH_PASSWORD);
  await page.locator('form').first().getByRole('button', { name: /^sign in$/i }).click();
  if (returnTo) {
    await page.waitForURL(new RegExp(returnTo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  } else {
    await expect(page.getByText(/choose where you want to go|centralized auth/i)).toBeVisible();
  }
}
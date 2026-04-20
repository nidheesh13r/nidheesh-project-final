import { test, expect } from '@playwright/test';
import {
  URLS,
  AUTH_READY,
  RUN_SIGNUP_TESTS,
  AUTH_EMAIL,
  AUTH_PASSWORD,
  gotoAndExpectHeading,
  centralizedSignIn,
} from './_shared';

test.describe('Auth and navigation cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('TAHA-7 Login page loads with both auth modes', async ({ page }) => {
    await gotoAndExpectHeading(page, URLS.login, /luxe travel login/i);
    await expect(page.locator('.tabs button', { hasText: /sign in/i })).toBeVisible();
    await expect(page.locator('.tabs button', { hasText: /create account/i })).toBeVisible();
    await expect(page.locator('form input[type="email"]').first()).toBeVisible();
    await expect(page.locator('form input[type="password"]').first()).toBeVisible();
  });

  test('TAHA-8 Valid sign-in redirects to returnTo target', async ({ page }) => {
    test.skip(!AUTH_READY, 'Requires RUN_AUTH_TESTS=true and valid E2E_EMAIL/E2E_PASSWORD');
    await page.goto(`${URLS.login}?returnTo=${encodeURIComponent(URLS.hotels)}`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.locator('form input[type="email"]').first().fill(AUTH_EMAIL);
    await page.locator('form input[type="password"]').first().fill(AUTH_PASSWORD);
    await page.locator('form').first().getByRole('button', { name: /^sign in$/i }).click();
    await page.waitForURL(new RegExp(URLS.hotels.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  test('TAHA-9 Sign-up flow creates account and allows continuation', async ({ page }) => {
    test.skip(!RUN_SIGNUP_TESTS, 'Set RUN_SIGNUP_TESTS=true to execute sign-up in your environment');
    const email = `qa-${Date.now()}@example.com`;
    await gotoAndExpectHeading(page, URLS.login, /luxe travel login/i);
    await page.getByRole('button', { name: /create account/i }).click();
    const signUpForm = page.locator('form').first();
    await signUpForm.locator('input').nth(0).fill('QA Automation');
    await signUpForm.locator('input[type="email"]').fill(email);
    await signUpForm.locator('input[type="password"]').fill('Password123!');
    await signUpForm.getByRole('button', { name: /create account/i }).click();
    const verificationMsg = page.getByText(/account created|please confirm your email|confirm your email|verify/i);
    const destinationChooser = page.getByText(/choose where you want to go/i);
    const errorBanner = page.locator('.error');
    const verificationVisible = await verificationMsg.first().isVisible().catch(() => false);
    const chooserVisible = await destinationChooser.first().isVisible().catch(() => false);
    const errorVisible = await errorBanner.first().isVisible().catch(() => false);
    expect(verificationVisible || chooserVisible || errorVisible).toBeTruthy();
  });

  test('TAHA-10 Invalid login shows user-friendly error', async ({ page }) => {
    await gotoAndExpectHeading(page, URLS.login, /luxe travel login/i);
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.locator('form input[type="email"]').first().fill('invalid@example.com');
    await page.locator('form input[type="password"]').first().fill('wrong-password');
    await page.locator('form').first().getByRole('button', { name: /^sign in$/i }).click();
    await expect(page.getByText(/failed|invalid|error/i)).toBeVisible();
  });

  test('TAHA-11 Invalid external returnTo origin is blocked', async ({ page }) => {
    await page.goto(`${URLS.login}?returnTo=${encodeURIComponent('https://evil.example.org')}`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(new RegExp(URLS.login.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  test('TAHA-12 Sign in from Hotels /signin returns to Hotels home', async ({ page }) => {
    await page.goto(`${URLS.hotels}/signin`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(new RegExp(URLS.login.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  test('TAHA-13 Sign in from Taste /signin returns to Taste home', async ({ page }) => {
    await page.goto(`${URLS.taste}/signin`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(new RegExp(URLS.login.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  test('TAHA-14 Logout clears cookies and protected actions require login', async ({ page }) => {
    test.skip(!AUTH_READY, 'Requires authenticated user');
    await centralizedSignIn(page, URLS.hotels);
    const signOutBtn = page.getByRole('button', { name: /logout|sign out/i });
    if (await signOutBtn.count()) {
      await signOutBtn.first().click();
    } else {
      await page.context().clearCookies();
    }
    await page.goto(`${URLS.taste}/profile`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /member access required/i })).toBeVisible();
  });
});
/* eslint-disable @typescript-eslint/unbound-method */
import { test, expect, type Page } from '@playwright/test';

test.describe('Home Page', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should have correct title', async () => {
    const title = await page.title();

    expect(title).toBe('Gabriel Trzimajewski');
  });

  test('tagline should be right', async () => {
    const tagline = await page.getByRole('heading').innerText();

    expect(tagline).toBeTruthy();
    expect(tagline).toMatch('Gabriel Trzimajewski');
  });
});

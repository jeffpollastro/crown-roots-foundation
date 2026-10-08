const { test, expect } = require('@playwright/test');

const ALL_PAGES = [
  '/index.html',
  '/about.html',
  '/college-database.html',
  '/tools.html',
  '/outcome.html',
  '/learn.html',
  '/board.html',
  '/contact.html',
  '/opportunity-gap.html',
  '/scholarships.html',
];

// ─── Donate button ─────────────────────────────────────────────

for (const url of ALL_PAGES) {
  test(`Donate button visible in nav — ${url}`, async ({ page }) => {
    await page.goto(url);
    const donate = page.locator('.btn-nav-donate');
    await expect(donate).toBeVisible();
    await expect(donate).toContainText('Donate');
  });
}

test('Donate button visible at 375px mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/index.html');
  await expect(page.locator('.btn-nav-donate')).toBeVisible();
});

// ─── Nav structure ─────────────────────────────────────────────

test('Nav shows Partners, not Contact', async ({ page }) => {
  await page.goto('/index.html');
  const partnersLink = page.locator('.nav-links a[href="contact.html"]');
  await expect(partnersLink).toHaveText('Partners');
});

test('Nav shows Resources for learn.html', async ({ page }) => {
  await page.goto('/index.html');
  const resourcesLink = page.locator('.nav-links a[href="learn.html"]');
  await expect(resourcesLink).toHaveText('Resources');
});

test('Nav does not list Opportunity Gap', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('.nav-links a[href="opportunity-gap.html"]')).toHaveCount(0);
});

test('Nav shows Tools in place of College Database', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('.nav-links a[href="tools.html"]')).toHaveText('Tools');
  await expect(page.locator('.nav-links a[href="college-database.html"]')).toHaveCount(0);
});

test('tools.html has In/Root and Out/Come doors', async ({ page }) => {
  await page.goto('/tools.html');
  await expect(page.locator('.io-door')).toHaveCount(2);
  await expect(page.locator('#inroot a[href="college-database.html"]')).toBeVisible();
  await expect(page.locator('#outcome a[href="https://outcome.crownroots.org/login"]')).toBeVisible();
});

test('outcome.html welcomes families and points non-students to In/Root', async ({ page }) => {
  await page.goto('/outcome.html');
  await expect(page.locator('h1')).toContainText('Welcome, Crown Roots families');
  await expect(page.locator('.oc-hero a[href="https://outcome.crownroots.org/login"]')).toBeVisible();
  await expect(page.locator('#not-a-student a[href="college-database.html"]')).toBeVisible();
  await expect(page.locator('a[href*="/register"]')).toHaveCount(0);
});

test('tools.html Out/Come door leads to outcome.html', async ({ page }) => {
  await page.goto('/tools.html');
  await expect(page.locator('#outcome a[href="outcome.html"]')).toBeVisible();
});

test('college-database.html opens on Crown Top 10 and toggles to Hidden Value Schools', async ({ page }) => {
  await page.goto('/college-database.html');
  await expect(page.locator('#top10Table tbody tr')).toHaveCount(10);
  await expect(page.locator('#top10Panel')).toBeVisible();
  await expect(page.locator('#hiddenValueSection')).toBeHidden();
  await page.locator('#tabHidden').click();
  await expect(page.locator('#hiddenValueSection')).toBeVisible();
  await expect(page.locator('#top10Panel')).toBeHidden();
  await expect(page.locator('#hvTable')).toBeVisible();
  await page.locator('#tabTop10').click();
  await expect(page.locator('#top10Panel')).toBeVisible();
});

test('Nav does not list Scholarships', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('.nav-links a[href="scholarships.html"]')).toHaveCount(0);
});

// ─── contact.html Partnership page ────────────────────────────

test('contact.html h1 contains Partner', async ({ page }) => {
  await page.goto('/contact.html');
  await expect(page.locator('h1')).toContainText('Partner');
});

test('contact.html has exactly 3 partner tier cards', async ({ page }) => {
  await page.goto('/contact.html');
  await expect(page.locator('.partner-tier')).toHaveCount(3);
});

test('contact.html Season Sponsor tier is featured', async ({ page }) => {
  await page.goto('/contact.html');
  const featured = page.locator('.partner-tier.featured');
  await expect(featured).toBeVisible();
  await expect(featured).toContainText('Season Sponsor');
});

test('contact.html inquiry form has partner-type select', async ({ page }) => {
  await page.goto('/contact.html');
  const select = page.locator('select[name="interest"]');
  await expect(select.first()).toBeVisible();
});

test('contact.html has name, email, and message fields', async ({ page }) => {
  await page.goto('/contact.html');
  await expect(page.locator('input[name="name"]').first()).toBeVisible();
  await expect(page.locator('input[name="email"]').first()).toBeVisible();
  await expect(page.locator('textarea[name="message"]').first()).toBeVisible();
});

// ─── about.html ────────────────────────────────────────────────

test('about.html has #opportunity-gap anchor', async ({ page }) => {
  await page.goto('/about.html');
  const section = page.locator('#opportunity-gap');
  await expect(section).toBeAttached();
});

// ─── No broken internal links ──────────────────────────────────

test('All internal .html links return 200', async ({ page, request }) => {
  await page.goto('/index.html');
  const links = await page.locator('a[href$=".html"]:not([href^="http"])').all();
  const checked = new Set();
  for (const link of links) {
    const href = await link.getAttribute('href');
    if (href && !checked.has(href)) {
      checked.add(href);
      const url = `http://localhost:8080/${href.replace(/^\//, '')}`;
      const response = await request.get(url);
      expect(response.status(), `Expected 200 for ${href}`).toBe(200);
    }
  }
});

const CREDENTIAL_NAME = "insights-remediations-user";
const PLAN_NAME = "catchpoint_test_plan_DO_NOT_REMOVE";
UI_TIMEOUT = 40000;

/**
- Block cookies
   */
  async function blockCookies() {
    await page.route('**/', async (route, request) => {
   if (request.url().includes('consent.trustarc.com') && request.resourceType() !== 'document') {
     await route.abort();
   } else {
     await route.continue();
   }
    });
  }
/**
- Logs in to the Insights page.
   */
  async function loginToInsightsPage() {
    const user = await Catchpoint.username(CREDENTIAL_NAME);
    const pass = await Catchpoint.password(CREDENTIAL_NAME);
  await page.locator('#username-verification').fill(user);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Password', { exact: true }).fill(pass);
  await page.getByRole('button', { name: 'Log in' }).click();
}
/**
Test that the `catchpoint_test_plan_DO_NOT_REMOVE` remediation plan is find-able in Remediations table,
and its Details page loads.
   */
  await blockCookies();
  await page.goto('https://console.redhat.com/insights/remediations/', {timeout: UI_TIMEOUT});
  await loginToInsightsPage();

  await page.getByPlaceholder("Search", { exact: true }).fill(PLAN_NAME, { timeout: UI_TIMEOUT });
  const planLink = page.getByRole("table", { name: "OverViewTable", exact: true }).getByRole("link", { name: PLAN_NAME, exact: true });
  await expect(planLink).toBeVisible({ timeout: UI_TIMEOUT });
  await planLink.click({ timeout: UI_TIMEOUT });
  await expect(page.getByRole("heading", { level: 1, name: PLAN_NAME, exact: true })).toBeVisible({ timeout: UI_TIMEOUT });

const CREDENTIAL_NAME = "insights-remediations-user";
const PLAN_NAME = "catchpoint_test_plan_DO_NOT_REMOVE";
const PLAN_ID = "72bd9cc1-0f46-454e-a9e3-871af90bc1b4";
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
Test that the `catchpoint_test_plan_DO_NOT_REMOVE` remediation plan is download-able from its Detail page.
   */
  await blockCookies();
  await page.goto(`https://console.redhat.com/insights/remediations/${PLAN_ID}`, {timeout: UI_TIMEOUT});
  await loginToInsightsPage();

  await expect(page.getByRole("heading", { level: 1, name: PLAN_NAME, exact: true })).toBeVisible({ timeout: UI_TIMEOUT });
  const button = page.getByRole("button", { name: "Download", exact: true });
  await expect(button).toBeEnabled({ timeout: UI_TIMEOUT });
  await Promise.all([
    page.waitForEvent("download", { timeout: UI_TIMEOUT }),
    button.click({ timeout: UI_TIMEOUT }),
  ]);

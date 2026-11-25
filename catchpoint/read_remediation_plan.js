// Catchpoint API test. Select JavaScript in the Script dropdown.
// Enable "40x or 50x Mark as Successful" in Advanced Settings so the script can inspect HTTP errors.
const PLAN_ID = "72bd9cc1-0f46-454e-a9e3-871af90bc1b4";
const PLAN_NAME = "catchpoint_test_plan_DO_NOT_REMOVE";

function getHttpStatus() {
  const headers = Catchpoint.extract("resp-header", "(?s).*");
  const statusLines = String(headers).match(/^HTTP\/\S+[ \t]+\d{3}\b/gm);
  assert(Boolean(statusLines));
  return Number(statusLines[statusLines.length - 1].slice(-3));
}

// Step 1: Exchange the offline token for an access token.
const offlineToken = Catchpoint.token("insights-remediations-token");
assert(typeof offlineToken === "string" && offlineToken.length > 0);

setHeader("Content-Type", "application/x-www-form-urlencoded");
open(
  "https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token",
  "POST",
  `grant_type=refresh_token&client_id=rhsm-api&refresh_token=${encodeURIComponent(offlineToken)}`
);
const ssoStatus = getHttpStatus();
assert(ssoStatus === 200 || ssoStatus === 400);

const ssoResponse = JSON.parse(Catchpoint.extract("resp-content", "(?s).*"));
const invalidRefreshToken = ssoStatus === 400 &&
  ssoResponse.error === "invalid_grant" &&
  ssoResponse.error_description === "Invalid refresh token";

if (invalidRefreshToken) {
  setStepName("Skipped - invalid refresh token");
} else {
  assert(ssoStatus === 200);
  const accessToken = ssoResponse.access_token;
  assert(typeof accessToken === "string" && accessToken.length > 0);

  // Step 2: Read the monitoring remediation plan.
  setHeader("Authorization", `Bearer ${accessToken}`);
  open(`https://console.redhat.com/api/remediations/v1/remediations/${PLAN_ID}?format=summary`);
  assert(getHttpStatus() === 200);

  const plan = JSON.parse(Catchpoint.extract("resp-content", "(?s).*"));
  assert(plan.id === PLAN_ID && plan.name === PLAN_NAME);
}

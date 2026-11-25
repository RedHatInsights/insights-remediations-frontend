import { handleRemediationSubmit } from './helpers';

describe('handleRemediationSubmit', () => {
  const issues = [
    {
      id: 'ssg:rhel9|0.1.82|cis|accounts_maximum_age_login_defs',
      systems: ['system-1'],
      value_overrides: { var_accounts_maximum_age_login_defs: '180' },
    },
    { id: 'advisor:issue', systems: ['system-2'] },
  ];
  const payload = { add: { issues, systems: [] }, auto_reboot: false };
  const planName = 'Compliance plan';
  const planId = 'remediation-id';

  it('forwards per-issue value overrides when creating a plan', async () => {
    const createRemediationFetch = jest.fn().mockResolvedValue({ id: planId });

    await handleRemediationSubmit({
      isExistingPlanSelected: false,
      inputValue: planName,
      data: { issues },
      autoReboot: false,
      createRemediationFetch,
    });

    expect(createRemediationFetch).toHaveBeenCalledWith({
      ...payload,
      name: planName,
    });
  });

  it('forwards per-issue value overrides when updating a plan', async () => {
    const updateRemediationFetch = jest.fn().mockResolvedValue({});

    await handleRemediationSubmit({
      isExistingPlanSelected: true,
      selected: planId,
      inputValue: planName,
      data: { issues },
      autoReboot: false,
      updateRemediationFetch,
    });

    expect(updateRemediationFetch).toHaveBeenCalledWith([planId, payload]);
  });
});

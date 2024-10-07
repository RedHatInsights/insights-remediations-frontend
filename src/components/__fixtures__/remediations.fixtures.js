export const remediationsMock = [
  {
    archived: false,
    created_at: '2024-04-09T09:27:05.409Z',
    created_by: {
      first_name: 'Ender',
      last_name: 'Wiggin',
      username: 'dragon',
    },
    id: 'be95812a-b98a-4dc3-bc2f-f93970f71bcf',
    issue_count: 1,
    name: 'test-remediation-1',
    needs_reboot: true,
    resolved_count: 0,
    selected: true,
    system_count: 1,
    updated_at: '2024-04-09T09:27:05.409Z',
    updated_by: {
      first_name: 'Ender',
      last_name: 'Wiggin',
      username: 'dragon',
    },
  },
];

export const playbookRunsMock = {
  meta: {
    count: 1,
    total: 1,
  },
  data: {
    created_at: '2024-10-04T10:26:24.015Z',
    created_by: {
      first_name: 'Ender',
      last_name: 'Wiggin',
      username: 'dragon',
    },
    executors: [
      {
        executor_id: 'be95812a-b98a-4dc3-bc2f-f93970f71bcf',
        executor_name: 'Direct connected',
        status: 'success',
        system_count: 1,
        counts: {
          pending: 0,
          failure: 0,
          canceled: 0,
          running: 0,
          success: 1,
        },
      },
    ],
    id: '5678',
    remediation_id: 'be95812a-b98a-4dc3-bc2f-f93970f71bcf',
    status: 'success',
    updated_at: '2024-10-04T10:26:24.015Z',
  },
};

export const playbookRunSystemDetailsMock = {
  console: '',
  playbook_run_executor_id: '5678',
  status: 'success',
  system_id: 'efgh',
  system_name: 'system1',
  updated_at: '2024-10-04T10:28:10.301551Z',
};

export const mockRemediationStatus = {
  connectedSystems: 3,
  totalSystems: 3,
  areDetailsLoading: false,
  connectedData: [
    {
      executor_name: 'Satellite 1 (connected)',
      executor_id: 'sat-1',
      connection_status: 'connected', // ⇒ “Satellite 1 (connected)”
      system_count: 1,
    },
    {
      executor_name: null,
      executor_id: null,
      connection_status: 'connected', // ⇒ “Direct connection”
      system_count: 1,
    },
    {
      executor_name: null,
      executor_id: 'edge-42',
      connection_status: 'disconnected', // ⇒ “Not available”
      system_count: 1,
    },
  ],
};

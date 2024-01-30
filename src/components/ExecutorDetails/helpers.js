import React from 'react';
import PlaybookSystemDetails from '../SystemDetails';
import { remediations } from '../../api';

export const useGetEntities = (config) => {
  const { id, run_id, executor_id, openId } = config || {};

  const getEntities = async (
    _items,
    { page, per_page: perPage, filters: { hostnameOrId } }
  ) => {
    const playbookRunSystems = await remediations.getPlaybookRunSystems(
      id,
      run_id,
      executor_id,
      perPage,
      perPage * (page - 1),
      hostnameOrId
    );

    return {
      results: playbookRunSystems.data.map(
        ({ system_id, system_name, status }) => ({
          id: system_id,
          display_name: system_name,
          status,
          isOpen: openId === system_id,
          children: <PlaybookSystemDetails systemId={system_id} />,
        })
      ),
      total: playbookRunSystems.meta?.total,
    };
  };

  return getEntities;
};

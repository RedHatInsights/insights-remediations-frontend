import React, { lazy, Suspense, useEffect, useState } from 'react';
import axios from 'axios';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spinner } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';

const INVENTORY_TOTAL_FETCH_URL = '/api/inventory/v1/hosts';
const RHEL_ONLY_FILTER =
  '?filter[system_profile][operating_system][RHEL][version][gte]=0';

export const routes = {
  home: {
    path: '/*',
    component: lazy(
      () =>
        import(
          /* webpackChunkName: "Home" */ './routes/OverViewPage/OverViewPage'
        ),
    ),
  },
  details: {
    path: ':id',
    component: lazy(
      () =>
        import(
          /* webpackChunkName: "RemediationDetails" */ './routes/RemediationDetails'
        ),
    ),
  },
};

const RemediationRoutes = () => {
  const [hasSystems, setHasSystems] = useState(true);

  useEffect(() => {
    try {
      axios
        .get(
          `${INVENTORY_TOTAL_FETCH_URL}${RHEL_ONLY_FILTER}&page=1&per_page=1`,
        )
        .then(({ data }) => {
          setHasSystems(data.total > 0);
        });
    } catch (e) {
      console.log(e);
    }
  }, [hasSystems]);

  return (
    <AsyncComponent
      appName="dashboard"
      module="./AppZeroState"
      scope="dashboard"
      ErrorComponent={<ErrorState />}
      app="Remediation_plans"
      appId="remediation_zero_state"
      customFetchResults={hasSystems}
    >
      <Suspense fallback={<Spinner />}>
        <Routes>
          {Object.entries(routes).map(
            ([key, { path, component: Component }]) => (
              <Route key={key} path={path} element={<Component />} />
            ),
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </AsyncComponent>
  );
};

export default RemediationRoutes;

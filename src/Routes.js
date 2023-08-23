import React, { lazy, Suspense, useEffect, useState } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import { Spinner } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';

const INVENTORY_TOTAL_FETCH_URL = '/api/inventory/v1/hosts';

export const routes = {
  home: {
    path: '/*',
    component: lazy(() =>
      import(/* webpackChunkName: "Home" */ './routes/Home')
    ),
  },
  details: {
    path: ':id',
    component: lazy(() =>
      import(
        /* webpackChunkName: "RemediationDetails" */ './routes/RemediationDetails'
      )
    ),
  },
  runDetails: {
    path: ':id/:run_id',
    component: lazy(() =>
      import(
        /* webpackChunkName: "ActivityDetails" */ './components/ActivityDetails'
      )
    ),
  },
  executorDetails: {
    path: ':id/:run_id/:executor_id',
    component: lazy(() =>
      import(
        /* webpackChunkName: "ExecutorDetails" */ './components/ExecutorDetails/ExecutorDetails'
      )
    ),
  },
};

const RemediationRoutes = () => {
  const [hasSystems, setHasSystems] = useState(true);

  useEffect(() => {
    try {
      axios
        .get(`${INVENTORY_TOTAL_FETCH_URL}?page=1&per_page=1`)
        .then(({ data }) => {
          setHasSystems(data.total > 0);
        });
    } catch (e) {
      console.log(e);
    }
  }, [hasSystems]);

  return !hasSystems ? (
    <AsyncComponent
      appName="dashboard"
      module="./AppZeroState"
      scope="dashboard"
      ErrorComponent={<ErrorState />}
      app="Remediations"
      appId="remediation_zero_state"
    />
  ) : (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {Object.entries(routes).map(([key, { path, component: Component }]) => (
          <Route key={key} path={path} element={<Component />} />
        ))}
      </Routes>
    </Suspense>
  );
};

export default RemediationRoutes;

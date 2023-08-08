import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import React, { Fragment, lazy, Suspense, useEffect, useState } from 'react';
import axios from 'axios';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import Home from './routes/Home';
const INVENTORY_TOTAL_FETCH_URL = '/api/inventory/v1/hosts';

const RemediationDetails = lazy(() =>
  import(
    /* webpackChunkName: "RemediationDetails" */ './routes/RemediationDetails'
  )
);
const ActivityDetails = lazy(() =>
  import(
    /* webpackChunkName: "ActivityDetails" */ './components/ActivityDetails'
  )
);
const ExecutorDetails = lazy(() =>
  import(
    /* webpackChunkName: "ExecutorDetails" */ './components/ExecutorDetails/ExecutorDetails'
  )
);

export const routes = {
  home: '/',
  details: '/:id',
  runDetails: '/:id/:run_id',
  executorDetails: '/:id/:run_id/:executor_id',
};

export const Routes = () => {
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
    <Suspense fallback={<Fragment />}>
      <Switch>
        <Route exact path={routes.home} component={Home} />
        <Route exact path={routes.details} component={RemediationDetails} />
        <Route
          exact
          path={routes.runDetails}
          render={(props) => <ActivityDetails remediation={{}} {...props} />}
        />
        <Route
          exact
          path={routes.executorDetails}
          render={(props) => <ExecutorDetails {...props} />}
        />
        <Redirect path="*" to={routes.home} push />
      </Switch>
    </Suspense>
  );
};

Routes.propTypes = {
  childProps: PropTypes.shape({
    history: PropTypes.shape({
      push: PropTypes.func,
    }),
  }),
};

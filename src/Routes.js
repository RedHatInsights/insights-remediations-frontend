import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import React, { Fragment, lazy, Suspense } from 'react';
import Home from './routes/Home';
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

export const Routes = () => (
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

Routes.propTypes = {
  childProps: PropTypes.shape({
    history: PropTypes.shape({
      push: PropTypes.func,
    }),
  }),
};

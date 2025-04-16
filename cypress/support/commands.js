// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


import React from 'react';
import FlagProvider from '@unleash/proxy-client-react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities';
//import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/index';
import { IntlProvider } from 'react-intl';
import { mount } from '@cypress/react18';

import { init } from '../../src/store';
//import messages from '../../locales/data.json';

Cypress.Commands.add('mountWithContext', (Component, options = {}, props) => {
  const { path, routerProps = { initialEntries: ['/'] } } = options;

  return mount(
    <FlagProvider
      config={{
        url: 'http://localhost:8002/feature_flags',
        clientKey: 'abc',
        appName: 'abc',
      }}
    >
      <Provider store={getRegistry().getStore()}>
        <MemoryRouter {...routerProps}>
          <RBACProvider appName="inventory" checkResourceDefinitions>
            {path ? (
              <Routes>
                <Route path={options.path} element={<Component {...props} />} />
              </Routes>
            ) : (
              <Component {...props} />
            )}
          </RBACProvider>
        </MemoryRouter>
      </Provider>
    </FlagProvider>
  );
});

// one of the fec dependencies talks to window.insights.chrome
Cypress.Commands.add(
  'mockWindowInsights',
  ({ userPermissions } = { userPermissions: ['*:*:*'] }) => {
    window.insights = {
      ...window.insights,
      chrome: {
        getUserPermissions: () => userPermissions,
        auth: {
          getUser: () => {
            return Promise.resolve({});
          },
        },
        getApp: () => 'inventory',
        getBundle: () => 'insights',
      },
    };
  }
);
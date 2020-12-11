require.extensions['.css'] = () => undefined;
const path = require('path');
const glob = require('glob');

const mapper = {
  TextVariants: 'Text',
  DropdownPosition: 'dropdownConstants',
  EmptyStateVariant: 'EmptyState',
  TextListItemVariants: 'TextListItem',
  TextListVariants: 'TextList',
  ModalVariant: 'Modal',
  ProgressVariant: 'ProgressContainer',
  ProgressMeasureLocation: 'ProgressContainer',
};

const FECMapper = {
  SkeletonSize: 'Skeleton',
  PageHeaderTitle: 'PageHeader',
  conditionalFilterType: 'ConditionalFilter',
};

const notificationMapper = {
  addNotification: 'actions',
};

module.exports = {
  presets: ['@babel/env', '@babel/react'],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-class-properties',
    'lodash',
    [
      'transform-imports',
      {
        '@redhat-cloud-services/frontend-components': {
          transform: (importName) =>
            `@redhat-cloud-services/frontend-components/components/esm/${
              FECMapper[importName] || importName
            }`,
          preventFullImport: false,
          skipDefaultConversion: true,
        },
      },
      'frontend-components',
    ],
    [
      'transform-imports',
      {
        '@redhat-cloud-services/frontend-components-notifications': {
          transform: (importName) =>
            `@redhat-cloud-services/frontend-components-notifications/esm/${
              notificationMapper[importName] || importName
            }`,
          preventFullImport: true,
        },
      },
      'frontend-notifications',
    ],
  ],
};

require.extensions['.css'] = () => undefined;
const path = require('path');
const glob = require('glob');

const mapper = {
    FlexModifiers: 'FlexUtils',
    TextVariants: 'Text',
    DropdownPosition: 'dropdownConstants',
    EmptyStateVariant: 'EmptyState',
    TextListItemVariants: 'TextListItem',
    TextListVariants: 'TextList'
};

const FECMapper = {
    SkeletonSize: 'Skeleton',
    PageHeaderTitle: 'PageHeader',
    conditionalFilterType: 'ConditionalFilter',

};

module.exports = {
    presets: [
        '@babel/env',
        '@babel/react'
    ],
    plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-proposal-class-properties',
        'lodash',
        [
            'transform-imports',
            {
                '@patternfly/react-core': {
                    transform: (importName) => {
                        const files = glob.sync(
                            path.resolve(
                                __dirname,
                                `./node_modules/@patternfly/react-core/dist/js/**/${mapper[
                                importName
                                ] || importName}.js`
                            )
                        );
                        if (files.length > 0) {
                            return files[0].replace(/.*(?=@patternfly)/, '');
                        }

                        throw `File with importName ${importName} does not exist`;

                    },
                    preventFullImport: false,
                    skipDefaultConversion: true
                }
            },
            'react-core'
        ],
        [
            'transform-imports',
            {
                '@patternfly/react-icons': {
                    transform: (importName) =>
                        `@patternfly/react-icons/dist/js/icons/${importName
                        .split(/(?=[A-Z])/)
                        .join('-')
                        .toLowerCase()}`,
                    preventFullImport: false
                }
            },
            'react-icons'
        ],
        [
            'transform-imports',
            {
                '@redhat-cloud-services/frontend-components': {
                    transform: (importName) =>
                        `@redhat-cloud-services/frontend-components/components/cjs/${FECMapper[importName] || importName}`,
                    preventFullImport: false,
                    skipDefaultConversion: true
                }
            },
            'frontend-components'
        ],
        [
            'transform-imports',
            {
                '@redhat-cloud-services/frontend-components-notifications': {
                    transform: (importName) =>
                        `@redhat-cloud-services/frontend-components-notifications/cjs/${importName}`,
                    preventFullImport: true
                }
            },
            'frontend-notifications'
        ]
    ]
};

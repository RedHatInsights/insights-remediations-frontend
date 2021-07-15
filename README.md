[![Build Status](https://travis-ci.org/RedHatInsights/insights-remediations-frontend.svg?branch=master)](https://travis-ci.org/RedHatInsights/insights-remediations-frontend)

# insights-remediations-frontend

This is the frontend application for [Insights Remediations](https://github.com/redhatinsights/insights-remediations). It is based on the [insights-frontend-starter-app](https://github.com/redhatinsights/insights-frontend-starter-app).

## Getting Started

### Running the application

#### CI stable env

1. install and start the dev server
```sh
npm i
npm run start:proxy
```
2. Open browser at [https://ci.foo.redhat.com:1337/insights/remediations](https://ci.foo.redhat.com:1337/insights/remediations)

#### CI beta env

1. install and start the dev server
```sh
npm i
npm run start:proxy:beta
```
2. Open browser at [https://ci.foo.redhat.com:1337/beta/insights/remediations](https://ci.foo.redhat.com:1337/beta/insights/remediations)

#### Using other environments

1. open `dev.webpack.config.js`
2. add `env` attribute with required value to the `webpackProxy` object.

For example, for prod-beta add following:
```js
{
  env: 'prod-beta'
}
```
 and run `npm run start:proxy:beta` (the `:beta` suffix configures webpack to serve assets at /beta location.)


### Testing

Run `npm run verify` to run build, linters and tests

Use `remediations:debug` localStorage entry to unlock testing utilities in the UI (`localStorage.setItem('remediations:debug', true)`)

### Releases

Any change commited to the `master` branch is automatically promoted to `/beta` in all environments.
Any change commited to the `stable` branch is automatically promoted to the main version of the application in all environments.

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
2. Open browser at [https://ci.foo.redhat.com:1337/preview/insights/remediations](https://ci.foo.redhat.com:1337/preview/insights/remediations)

#### Using other environments

1. open `dev.webpack.config.js`
2. add `env` attribute with required value to the `webpackProxy` object.

For example, for prod-beta add following:
```js
{
  env: 'prod-beta'
}
```
 and run `npm run start:proxy:beta` (the `:beta` suffix configures webpack to serve assets at /preview location.)


### Running with another app

If you want to see changes made in remediations button or wizard in another application you will have to run both remediations and desired application. We'll take for example [insights-advisor-frontend](https://github.com/RedHatInsights/insights-advisor-frontend) application as app that uses system detail.

#### With insights proxy
Run the remediations application
```
npm start
```

Open new terminal and navigate to desired application (for instance insights-adviror-frontend) and run it (make sure to run it on different port)
```
npm start
```

Open new terminal, navigate to insights-proxy and run it with
```
LOCAL_API=advisor:8003~https SPANDX_CONFIG="$(pwd)/insights-remediations-frontend/config/spandx.config.js" bash insights-proxy/scripts/run.
```

If you want to run advisor and for instance vulnerability just add new entry to LOCAL_API
```
LOCAL_API=advisor:8003~https,vulnerability:8004
```
#### With webpack proxy
Open new terminal and navigate to desired application (for instance insights-adviror-frontend) and run it (make sure to run it on different port)
```
npm start
```

Run the remediations application with proxy enabled and list of additional applications
```
LOCAL_API=advisor:8003~https npm run start:proxy
```

If you want to run advisor and for instance vulnerability just add new entry to LOCAL_API
```
LOCAL_API=advisor:8003~https,vulnerability:8004
```

### Testing

Run `npm run verify` to run build, linters and tests

Use `remediations:debug` localStorage entry to unlock testing utilities in the UI (`localStorage.setItem('remediations:debug', true)`)

### Releases

Any change commited to the `master` branch is automatically promoted to `/preview` in all environments.
Any change commited to the `stable` branch is automatically promoted to the main version of the application in all environments.

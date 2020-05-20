[![Build Status](https://travis-ci.org/RedHatInsights/insights-remediations-frontend.svg?branch=master)](https://travis-ci.org/RedHatInsights/insights-remediations-frontend)

# insights-remediations-frontend

This is the frontend application for [Insights Remediations](https://github.com/redhatinsights/insights-remediations). It is based on the [insights-frontend-starter-app](https://github.com/redhatinsights/insights-frontend-starter-app).

## Getting Started

### Insights Proxy
[Insights Proxy](https://github.com/RedHatInsights/insights-proxy) configured under `PROXY_PATH` is required to run this application.

```sh
SPANDX_CONFIG="./config/spandx.config.js" bash $PROXY_PATH/scripts/run.sh
```

This setup will forward API calls to CI/QA/PROD instance.
Alternatively, API calls can be forwarded to a locally-running API instance using a [remediations-specific](https://github.com/RedHatInsights/insights-remediations-frontend/blob/master/config/spandx.config.local.js) configuration:

```sh
SPANDX_CONFIG="./config/spandx.config.local.js" bash $PROXY_PATH/scripts/run.sh
```

### Running the application

1. ```npm install```
2. ```npm start```

### Testing

Run `npm run verify` to run build, linters and tests

Use `remediations:debug` localStorage entry to unlock testing utilities in the UI (`localStorage.setItem('remediations:debug', true)`)

### Releases

Any change commited to the `master` branch is automatically promoted to `/beta` in all environments.
Any change commited to the `stable` branch is automatically promoted to the main version of the application in all environments.

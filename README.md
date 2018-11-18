[![Build Status](https://travis-ci.org/RedHatInsights/insights-remediations-frontend.svg?branch=master)](https://travis-ci.org/RedHatInsights/insights-remediations-frontend)

# insights-remediations-frontend

This is the frontend application for [Insights Remediations](https://github.com/redhatinsights/insights-remediations). It is based on the [insights-frontend-starter-app](https://github.com/redhatinsights/insights-frontend-starter-app).

## Getting Started

### Insights Proxy
[Insights Proxy](https://github.com/RedHatInsights/insights-proxy) is required to run this application.

```sh
insights-proxy/scripts/run.sh
```

This setup will forward API calls to CI/QA/PROD instance.
Alternatively, API calls can be forwarded to a locally-running API instance using a [remediations-specific](https://github.com/RedHatInsights/insights-remediations-frontend/blob/master/config/spandx.config.local.js) configuration:

```sh
SPANDX_CONFIG="$(pwd)/insights-remediations-frontend/config/spandx.config.local.js" bash insights-proxy/scripts/run.sh
```

### Running the application

1. ```npm install```
2. ```npm start```

### Testing

Run `npm run verify` to run build, linters and tests

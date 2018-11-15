#!/usr/bin/env bash
set -e
set -x

function release {
    .travis/release.sh prod-$1
    git push --force --set-upstream travis-build HEAD:ci-$1
    git push --force --set-upstream travis-build HEAD:qa-$1
}

# If current dev branch is master, push to beta branches
if [[ "${TRAVIS_BRANCH}" = "master" ]]; then
    release "beta"
fi

# If current dev branch is deployment branch, push to stable branches
if [[ "${TRAVIS_BRANCH}" = "stable" ]]; then
    release ${TRAVIS_BRANCH}
fi

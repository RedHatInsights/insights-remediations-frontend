#!/usr/bin/env bash
set -e
set -x

# If current dev branch is master, push to beta branches
if [ "${TRAVIS_BRANCH}" = "master" ]; then
    for i in ci-beta qa-beta prod-beta; do
        .travis/release.sh $i
    done
fi

# If current dev branch is deployment branch, push to stable branches
if [[ "${TRAVIS_BRANCH}" = "stable" ]]; then
    for i in ci-stable qa-stable prod-stable; do
        .travis/release.sh $i
    done
fi

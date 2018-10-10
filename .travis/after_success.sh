#!/usr/bin/env bash

# Check if it is a pull request
# If it is not a pull request, generate the deploy key
if [ "${TRAVIS_PULL_REQUEST}" != "false" ]; then
    echo -e "Pull Request, not pushing a build"
    exit 0;
else
    openssl aes-256-cbc -K $encrypted_834c6a7e1ce2_key -iv $encrypted_834c6a7e1ce2_iv -in key_rsa.enc -out key_rsa -d
    chmod 600 key_rsa
    eval `ssh-agent -s`
    ssh-add key_rsa
fi

# If current dev branch is master, push to build repo master
if [ "${TRAVIS_BRANCH}" = "master" ]; then
    .travis/release.sh
fi

# If current dev branch is stable/foo, push to build repo stable
if [[ ${TRAVIS_BRANCH} =~ stable\/* ]]; then
    .travis/release_stable.sh
fi

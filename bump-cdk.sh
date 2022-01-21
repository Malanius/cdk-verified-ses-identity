#!/bin/bash

set -o errexit # Exit on failure
set -o nounset # Prevent using undeclared variables

CDK_VERSION=${1}
yarn version --no-git-tag-version --new-version ${CDK_VERSION}

echo "Updating CDK core peer dependency to version ${CDK_VERSION}"
yarn add --peer --exact \
    "@aws-cdk/core@${CDK_VERSION}"

echo "Updating CDK dependencies to version ${CDK_VERSION}"
yarn add --exact \
    "@aws-cdk/aws-iam@${CDK_VERSION}" \
    "@aws-cdk/aws-lambda@${CDK_VERSION}" \
    "@aws-cdk/aws-route53@${CDK_VERSION}" \
    "@aws-cdk/custom-resources@${CDK_VERSION}"

echo "Updating CDK dev dependencies to version ${CDK_VERSION}"
yarn add --dev --exact \
    "@aws-cdk/assert@${CDK_VERSION}"

MESSAGE="Bump version & CDK to ${CDK_VERSION}"

git commit --all --message "${MESSAGE}"
git tag "${CDK_VERSION}"
git push
git push origin "${CDK_VERSION}"

set +o errexit # Exit on failure
set +o nounset # Prevent using undeclared variables
# CKD Verified SES identity

This construct library allows you to create SES identity with identity and DKIM verification records under a hosted zone in Route53.

## Requirements

Any domain identity you're creating and verifying with this construct must be under already existing hosted zone in Route53. Domains hosted anywhere else are not supported.

## Usage

1. Install the construct library:

   ```bash
   npm i @malanius/cdk-verified-ses-identity
   ```

1. Import the construct:

   ```typescript
   import {VerifiedSESIdentity} from '@malanius/cdk-verified-ses-identity';
   ```

1. Use the construct in your stack:

   ```typescript
   const identity = new VerifiedSESIdentity(this, 'Identity', {
     // Hosted zone domain name under which the verification records are created
     baseDomain: 'example.xyz',
     // Optional, will be prepednded to base domain name, i.e. mail.example.xyz
     domainPrefix: 'mail',
   });
   ```

## Note on versioning

For CDK v1, this construct version followed CDK version due to occuring discrepancies between module versions used and CDK app and this construct. This could happen when app was initialized on certain version and this module was instaled at later time.

Since CDK v2 has all modules packed inside single package dependency, this can no longer happen so v2 of this construct lib specifies `"aws-cdk-lib": "^2.0.0"` only and doesn't follow the CDK version anymore and uses [SemVer](https://semver.org/) on it's own.

As [CDK v1 is no longer supported](https://aws.amazon.com/blogs/devops/cdk-v1-end-of-support/), this construct lib is no longer maintained for v1 version as of 2023-06-01. Use CDK v2 and v2 of this construct lib instead.

## Interesting points

- update of the identity is handled by creation and verification of new identity and returned to CloudFormation, when the outputed physical ID returned from custom resource handler differs from the previous one CFN automatically calls the delete operation with previous physical ID

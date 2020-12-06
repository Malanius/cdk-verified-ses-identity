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

## Interesting points

- update of the identity is handled by creation and verification of new identity and returned to CFN, when the outputed physical ID returned from custom resource handler differs from the previous one CFN automatically calls the delete operation with previous physical ID

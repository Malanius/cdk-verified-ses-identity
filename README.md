# CKD Verified SES identity

This construct library allows you to create SES identity with identity and DKIM verification records under a hosted zone in Route53.

## Limitations

It's not possible to create and verify hosted zone itself with this construct. This construct expects that you already have a hosted zone in Route53 under which you are creating the new SES identity domain.
So you won't be able to create and verify identity for `example.xyz` itself, but only for any 'sub-domain' like `mail.example.xyz`.

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
     baseDomain: 'example.xyz',
     domainPrefix: 'mail',
   });
   ```

## Interesting points

- update of the identity is handled by creation and verification of new identity and returned to CFN, when the outputed physical ID returned from custom resource handler differs from the previous one CFN automatically calls the delete operation with previous physical ID

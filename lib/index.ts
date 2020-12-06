import * as cdk from '@aws-cdk/core';

export interface CdkSesVerifierProps {
  // Define construct properties here
}

export class CdkSesVerifier extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: CdkSesVerifierProps = {}) {
    super(scope, id);

    // Define construct contents here
  }
}

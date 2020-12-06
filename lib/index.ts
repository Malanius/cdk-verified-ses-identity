import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as route53 from '@aws-cdk/aws-route53';
import * as cr from '@aws-cdk/custom-resources';
import * as path from 'path';

export interface VerifiedSESIdentityProps {
  domainPrefix: string;
  baseDomain: string;
}

export class VerifiedSESIdentity extends cdk.Construct {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: VerifiedSESIdentityProps
  ) {
    super(scope, id);

    const zone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: props.baseDomain,
    });

    const handler = new lambda.Function(this, 'VerificationHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: cdk.Duration.seconds(10),
      handler: 'index.onEvent',
      code: lambda.Code.fromAsset(path.join(__dirname, '../handler')),
    });

    handler.addToRolePolicy(
      new iam.PolicyStatement({
        sid: 'SESRights',
        effect: iam.Effect.ALLOW,
        actions: [
          'ses:DeleteIdentity',
          'ses:VerifyDomainIdentity',
          'ses:VerifyDomainDkim',
          'ses:GetIdentityVerificationAttributes',
        ],
        resources: ['*'],
      })
    );

    handler.addToRolePolicy(
      new iam.PolicyStatement({
        sid: 'Route53Rights',
        effect: iam.Effect.ALLOW,
        actions: [
          'route53:ChangeResourceRecordSets',
          'route53:ListResourceRecordSets',
        ],
        resources: [`arn:aws:route53:::hostedzone/${zone.hostedZoneId}`],
      })
    );

    const provider = new cr.Provider(this, 'SESProvider', {
      onEventHandler: handler,
    });

    new cdk.CustomResource(this, 'SESRecords', {
      serviceToken: provider.serviceToken,
      properties: {
        HostedZoneId: zone.hostedZoneId,
        SESDomain: `${props.domainPrefix}.${props.baseDomain}`,
      },
    });
  }
}

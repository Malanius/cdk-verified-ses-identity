import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as cr from 'aws-cdk-lib/custom-resources';
import {Construct} from 'constructs';
import * as path from 'path';

export interface VerifiedSESIdentityProps {
  baseDomain: string;
  domainPrefix?: string;
}

export class VerifiedSESIdentity extends Construct {
  constructor(scope: Construct, id: string, props: VerifiedSESIdentityProps) {
    super(scope, id);

    const zone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: props.baseDomain,
    });

    const handler = new lambda.Function(this, 'VerificationHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
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

    const sesDomain = props.domainPrefix
      ? `${props.domainPrefix}.${props.baseDomain}`
      : props.baseDomain;

    new cdk.CustomResource(this, 'SESRecords', {
      serviceToken: provider.serviceToken,
      properties: {
        HostedZoneId: zone.hostedZoneId,
        SESDomain: sesDomain,
      },
    });
  }
}

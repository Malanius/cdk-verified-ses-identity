import * as aws from 'aws-sdk';
import {createSesRecords, deleteIdenity} from './sesManager';

const route53 = new aws.Route53();

export async function onEvent(event: CDKEvent) {
  console.info('Started with event: ', {event});
  switch (event.RequestType) {
    case 'Create':
      return await onCreate(
        event.ResourceProperties.SESDomain,
        event.ResourceProperties.HostedZoneId
      );
    case 'Update':
      return await onUpdate(event);
    case 'Delete':
      return await onDelete(
        event.ResourceProperties.SESDomain,
        event.ResourceProperties.HostedZoneId
      );
    default:
      throw new Error('Unsupported event received!');
  }
}

const onCreate = async (sesDomain: string, hostedZoneId: string) => {
  console.info(`Creating & verifying new SES domain '${sesDomain}'.`);

  const records = await createSesRecords(sesDomain, 'CREATE');

  const params = {
    ChangeBatch: {
      Changes: records,
    },
    HostedZoneId: hostedZoneId,
  };

  console.info('Creating SES domain DNS records.');
  await route53.changeResourceRecordSets(params).promise();
  console.info('Created SES domain DNS records.');

  console.info(`SES domain '${sesDomain}' created and verified.`);
  return {PhysicalResourceId: sesDomain};
};

const onUpdate = async (event: CDKEvent) => {
  console.info(
    `Updating existing SES domain '${event.OldResourceProperties.SESDomain}'.`
  );

  const isSameDomain =
    event.OldResourceProperties.SESDomain ===
    event.ResourceProperties.SESDomain;
  const isSameHostedZone =
    event.OldResourceProperties.HostedZoneId ===
    event.ResourceProperties.HostedZoneId;

  if (isSameDomain && isSameHostedZone) {
    console.info('Old and new resource matches, no update to handle.');
    return {PhysicalResourceId: event.ResourceProperties.SESDomain};
  }

  //Create only, as we return updated resource ID, CDK/CFN will call delete event
  await onCreate(
    event.ResourceProperties.SESDomain,
    event.ResourceProperties.HostedZoneId
  );

  console.info(
    `Updated existing SES domain '${event.OldResourceProperties.SESDomain}' to '${event.ResourceProperties.SESDomain}'.`
  );
  return {PhysicalResourceId: event.ResourceProperties.SESDomain};
};

const onDelete = async (sesDomain: string, hostedZoneId: string) => {
  console.info(`Deleting SES domain '${sesDomain}'.`);

  console.info(`Deleting SES domain '${sesDomain}' DNS records.`);
  const records = await createSesRecords(sesDomain, 'DELETE');
  const params = {
    ChangeBatch: {
      Changes: records,
    },
    HostedZoneId: hostedZoneId,
  };
  await route53.changeResourceRecordSets(params).promise();
  console.info(`Deleted SES domain '${sesDomain}' DNS records.`);

  console.info(`Deleting SES domain '${sesDomain}' identity.`);
  await deleteIdenity(sesDomain);
  console.info(`Deleted SES domain '${sesDomain}' identity.`);

  console.info('...done deleting SES domain.');
  return {PhysicalResourceId: sesDomain};
};

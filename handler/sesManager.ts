import * as aws from 'aws-sdk';

const ses = new aws.SES();

type dnsAction = 'CREATE' | 'UPSERT' | 'DELETE';

export const createSesRecords = async (
  sesDomainName: string,
  action: dnsAction
) => {
  const records = await createDkimRecords(sesDomainName, action);
  records.unshift(await createIdentityRecords(sesDomainName, action));
  console.debug('Prepared new record group sets: ', records);
  return records;
};

const createDkimRecords = async (sesDomainName: string, action: dnsAction) => {
  const tokens = await ses
    .verifyDomainDkim({
      Domain: sesDomainName,
    })
    .promise()
    .then((data) => data.DkimTokens)
    .catch((err) => {
      console.error('Failed to create DKIM tokens!', err);
      throw err;
    });

  console.info('Sucesfully created DKIM tokens: ', tokens);

  return tokens.map((token) => ({
    Action: action,
    ResourceRecordSet: {
      Name: `${token}._domainkey.${sesDomainName}`,
      Type: 'CNAME',
      TTL: 1800,
      ResourceRecords: [{Value: `${token}.dkim.amazonses.com`}],
    },
  }));
};

const createIdentityRecords = async (
  sesDomainName: string,
  dnsAction: dnsAction
) => {
  const verificationToken = await ses
    .verifyDomainIdentity({
      Domain: sesDomainName,
    })
    .promise()
    .then((data) => data.VerificationToken)
    .catch((err) => {
      console.error('Failed to create identity record!', err);
      throw err;
    });

  console.info('Sucesfully created identity token: ', verificationToken);

  return {
    Action: dnsAction,
    ResourceRecordSet: {
      Name: `_amazonses.${sesDomainName}`,
      Type: 'TXT',
      TTL: 1800,
      ResourceRecords: [{Value: `"${verificationToken}"`}],
    },
  };
};

export const deleteIdenity = (domain: string) => {
  const params = {
    Identity: domain,
  };
  return ses.deleteIdentity(params).promise();
};

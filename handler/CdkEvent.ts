interface CDKEvent {
  RequestType: 'Create' | 'Update' | 'Delete';
  ServiceToken: string;
  ResponseURL: string;
  StackId: string;
  RequestId: string;
  LogicalResourceId: string;
  ResourceType: 'AWS::CloudFormation::CustomResource';
  ResourceProperties: {
    ServiceToken: string;
    HostedZoneId: string;
    SESDomain: string;
  };
  OldResourceProperties: {
    ServiceToken: string;
    HostedZoneId: string;
    SESDomain: string;
  };
}

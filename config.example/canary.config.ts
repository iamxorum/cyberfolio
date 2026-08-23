export interface CanaryConfig {
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
    awsRegion: string;
    awsOutput: string;
}

export const canaryConfig: CanaryConfig = {
    awsAccessKeyId: 'AKIA_YOUR_CANARYTOKEN_KEY',
    awsSecretAccessKey: 'YOUR_CANARYTOKEN_SECRET',
    awsRegion: 'us-east-2',
    awsOutput: 'json',
};

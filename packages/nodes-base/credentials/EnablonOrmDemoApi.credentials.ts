import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';


export class EnablonOrmDemoApi implements ICredentialType {
	name = 'enablonOrmDemoApi';
	displayName = 'Enablon API (Demo)';
	documentationUrl = 'enablonormdemo';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
		},
	];
}

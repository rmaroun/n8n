import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';


export class RobwayDemoApi implements ICredentialType {
	name = 'robwayDemoApi';
	displayName = 'Robway API (Demo)';
	documentationUrl = 'robwaydemo';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
		},
	];
}

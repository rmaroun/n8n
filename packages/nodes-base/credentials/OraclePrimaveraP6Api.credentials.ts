import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class OraclePrimaveraP6Api implements ICredentialType {
	name = 'oraclePrimaveraP6Api';
	displayName = 'Oracle Primavera P6 API';
	documentationUrl = 'oraclePrimaveraP6Api';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			default: '',
		},
		{
			displayName: 'APP Access Type',
			name: 'accessType',
			type: 'options',
			options: [
				{
					name: 'Projects',
					value: 'projects',
				},
				{
					name: 'Resources',
					value: 'resources',
				},
				{
					name: 'Milestones',
					value: 'milestones',
				},
				{
					name: 'Tasks',
					value: 'tasks',
				},
				{
					name: 'Full Oracle Primavera P6',
					value: 'full',
				},
			],
			default: 'full',
		},
	];
}

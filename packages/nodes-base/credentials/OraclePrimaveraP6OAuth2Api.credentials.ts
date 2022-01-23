import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

const scopes = [
	'projects.content.read',
	'resources.content.read',
	'milestones.content.read',
	'tasks.content.read'
];

export class OraclePrimaveraP6OAuth2Api implements ICredentialType {
	name = 'oraclePrimaveraP6OAuth2Api';
	extends = [
		'oAuth2Api',
	];
	displayName = 'Oracle Primavera P6 OAuth2 API';
	documentationUrl = 'oraclePrimaveraP6OAuth2Api';
	properties: INodeProperties[] = [
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://www.oracle-primavera-p6.com/oauth2/authorize',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://api.oracle-primavera-p6-api.com/oauth2/token',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: scopes.join(' '),
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: 'token_access_type=offline&force_reapprove=true',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
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

import {
	BINARY_ENCODING,
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	OptionsWithUri,
} from 'request';

export class OraclePrimaveraP6 implements INodeType {
	description: INodeTypeDescription = {
			displayName: 'Oracle Primavera P6',
			name: 'OraclePrimaveraP6',
			icon: 'file:OraclePrimaveraP6.png',
			group: ['input'],
			version: 1,
			subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
			description: 'Consume Oracle Primavera p6 API',
			defaults: {
					name: 'OraclePrimaveraP6',
					color: '#1A82e2',
			},
			inputs: ['main'],
			outputs: ['main'],
			credentials: [
				{
					name: 'oraclePrimaveraP6Api',
					required: true,
					displayOptions: {
						show: {
							authentication: [
								'accessToken',
							],
						},
					},
				},
				{
					name: 'oraclePrimaveraP6OAuth2Api',
					required: true,
					displayOptions: {
						show: {
							authentication: [
								'oAuth2',
							],
						},
					},
				},
			],
			properties: [
				{
					displayName: 'Authentication',
					name: 'authentication',
					type: 'options',
					options: [
						{
							name: 'Access Token',
							value: 'accessToken',
						},
						{
							name: 'OAuth2',
							value: 'oAuth2',
						},
					],
					default: 'accessToken',
					description: 'Means of authenticating with the service.',
				},
				{
					displayName: 'Resource',
					name: 'resource',
					type: 'options',
					options: [
						{
							name: 'Project',
							value: 'project',
						},
						{
							name: 'Resource',
							value: 'resource',
						},
						{
							name: 'Milestone',
							value: 'milestone',
						},
						{
							name: 'Task',
							value: 'task',
						},
					],
					default: 'project',
					description: 'The resource to operate on.',
				},

				// ----------------------------------
				//         operations
				// ----------------------------------
				{
					displayName: 'Operation',
					name: 'operation',
					type: 'options',
					displayOptions: {
						show: {
							resource: [
								'project',
							],
						},
					},
					options: [
						{
							name: 'Retrieve overdue projects',
							value: 'retrieveOverdueProjects',
							description: 'Retrieve overdue projects',
						},
						{
							name: 'Retrieve over budget projects',
							value: 'retrieveOverBudgetProjects',
							description: 'Retrieve over budget projects',
						}
					],
					default: 'retrieveOverdueProjects',
					description: 'The operation to perform.',
				},

				{
					displayName: 'Operation',
					name: 'operation',
					type: 'options',
					displayOptions: {
						show: {
							resource: [
								'task',
							],
						},
					},
					options: [
						{
							name: 'Retrieve overdue tasks',
							value: 'retrieveOverdueTasks',
							description: 'Retrieve overdue tasks',
						}
					],
					default: 'retrieveOverdueTasks',
					description: 'The operation to perform.',
				},

				{
					displayName: 'Operation',
					name: 'operation',
					type: 'options',
					displayOptions: {
						show: {
							resource: [
								'resource',
							],
						},
					},
					options: [
						{
							name: 'Retrieve critical resources',
							value: 'retrieveCriticalResources',
						},
					],
					default: 'retrieveCriticalResources',
					description: 'The operation to perform.',
				},

				// ----------------------------------
				//         Project
				// ----------------------------------

				// ----------------------------------
				//         Permit/retrieveData
				// ----------------------------------
				/* {
					displayName: 'Equipment Tag',
					name: 'equipmentTag',
					type: 'string',
					default: '',
					required: true,
					displayOptions: {
						show: {
							operation: [
								'retrieveHighRiskPermits',
								'retrieveLongTermIsolations'
							],
							resource: [
								'permit',
								'isolation',
							],
						},
					},
					placeholder: 'PUMP-123',
					description: 'The equipment tag number for which you wish to retrieve permits or isolations.',
				},*/
				{
					displayName: 'Location Name',
					name: 'locationName',
					type: 'string',
					default: '',
					required: true,
					displayOptions: {
						show: {
							operation: [
								'retrieveOverdueProjects',
								'retrieveOverBudgetProjects'
							],
							resource: [
								'project',
							],
						},
					},
					placeholder: 'F-15',
					description: 'The location name where the planning schedule.',
				},
			],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
			return [[]];
	}
}

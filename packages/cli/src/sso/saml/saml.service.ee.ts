import type express from 'express';
import { Service } from 'typedi';
import * as Db from '@/Db';
import type { User } from '@db/entities/User';
import { jsonParse, LoggerProxy } from 'n8n-workflow';
import { AuthError, BadRequestError } from '@/ResponseHelper';
import { getServiceProviderInstance } from './serviceProvider.ee';
import type { SamlUserAttributes } from './types/samlUserAttributes';
import { isSsoJustInTimeProvisioningEnabled } from '../ssoHelpers';
import type { SamlPreferences } from './types/samlPreferences';
import { SAML_PREFERENCES_DB_KEY } from './constants';
import type { IdentityProviderInstance, ServiceProviderInstance } from 'samlify';
import { IdentityProvider, setSchemaValidator } from 'samlify';
import {
	createUserFromSamlAttributes,
	getMappedSamlAttributesFromFlowResult,
	getSamlLoginLabel,
	isSamlLoginEnabled,
	setSamlLoginEnabled,
	setSamlLoginLabel,
	updateUserFromSamlAttributes,
} from './samlHelpers';
import type { Settings } from '@db/entities/Settings';
import axios from 'axios';
import https from 'https';
import type { SamlLoginBinding } from './types';
import type { BindingContext, PostBindingContext } from 'samlify/types/src/entity';
import { validateMetadata, validateResponse } from './samlValidator';
import { getInstanceBaseUrl } from '@/UserManagement/UserManagementHelper';

@Service()
export class SamlService {
	private identityProviderInstance: IdentityProviderInstance | undefined;

	private _samlPreferences: SamlPreferences = {
		mapping: {
			email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
			firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/firstname',
			lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/lastname',
			userPrincipalName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
		},
		metadata: '',
		metadataUrl: '',
		ignoreSSL: false,
		loginBinding: 'redirect',
		acsBinding: 'post',
		authnRequestsSigned: false,
		loginEnabled: false,
		loginLabel: 'SAML',
		wantAssertionsSigned: true,
		wantMessageSigned: true,
		relayState: getInstanceBaseUrl(),
		signatureConfig: {
			prefix: 'ds',
			location: {
				reference: '/samlp:Response/saml:Issuer',
				action: 'after',
			},
		},
	};

	public get samlPreferences(): SamlPreferences {
		return {
			...this._samlPreferences,
			loginEnabled: isSamlLoginEnabled(),
			loginLabel: getSamlLoginLabel(),
		};
	}

	async init(): Promise<void> {
		await this.loadFromDbAndApplySamlPreferences();
		setSchemaValidator({
			validate: async (response: string) => {
				const valid = await validateResponse(response);
				if (!valid) {
					return Promise.reject(new Error('Invalid SAML response'));
				}
				return Promise.resolve();
			},
		});
	}

	getIdentityProviderInstance(forceRecreate = false): IdentityProviderInstance {
		if (this.identityProviderInstance === undefined || forceRecreate) {
			this.identityProviderInstance = IdentityProvider({
				metadata: this._samlPreferences.metadata,
			});
		}

		return this.identityProviderInstance;
	}

	getServiceProviderInstance(): ServiceProviderInstance {
		return getServiceProviderInstance(this._samlPreferences);
	}

	getLoginRequestUrl(
		relayState?: string,
		binding?: SamlLoginBinding,
	): {
		binding: SamlLoginBinding;
		context: BindingContext | PostBindingContext;
	} {
		if (binding === undefined) binding = this._samlPreferences.loginBinding ?? 'redirect';
		if (binding === 'post') {
			return {
				binding,
				context: this.getPostLoginRequestUrl(relayState),
			};
		} else {
			return {
				binding,
				context: this.getRedirectLoginRequestUrl(relayState),
			};
		}
	}

	private getRedirectLoginRequestUrl(relayState?: string): BindingContext {
		const sp = this.getServiceProviderInstance();
		sp.entitySetting.relayState = relayState ?? getInstanceBaseUrl();
		const loginRequest = sp.createLoginRequest(this.getIdentityProviderInstance(), 'redirect');
		//TODO:SAML: debug logging
		LoggerProxy.debug(loginRequest.context);
		return loginRequest;
	}

	private getPostLoginRequestUrl(relayState?: string): PostBindingContext {
		const sp = this.getServiceProviderInstance();
		sp.entitySetting.relayState = relayState ?? getInstanceBaseUrl();
		const loginRequest = sp.createLoginRequest(
			this.getIdentityProviderInstance(),
			'post',
		) as PostBindingContext;
		//TODO:SAML: debug logging
		LoggerProxy.debug(loginRequest.context);
		return loginRequest;
	}

	async handleSamlLogin(
		req: express.Request,
		binding: SamlLoginBinding,
	): Promise<{
		authenticatedUser: User | undefined;
		attributes: SamlUserAttributes;
		onboardingRequired: boolean;
	}> {
		const attributes = await this.getAttributesFromLoginResponse(req, binding);
		if (attributes.email) {
			const user = await Db.collections.User.findOne({
				where: { email: attributes.email },
				relations: ['globalRole', 'authIdentities'],
			});
			if (user) {
				// Login path for existing users that are fully set up and that have a SAML authIdentity set up
				if (
					user.authIdentities.find(
						(e) => e.providerType === 'saml' && e.providerId === attributes.userPrincipalName,
					)
				) {
					return {
						authenticatedUser: user,
						attributes,
						onboardingRequired: false,
					};
				} else {
					// Login path for existing users that are NOT fully set up for SAML
					const updatedUser = await updateUserFromSamlAttributes(user, attributes);
					const onboardingRequired = !updatedUser.firstName || !updatedUser.lastName;
					return {
						authenticatedUser: updatedUser,
						attributes,
						onboardingRequired,
					};
				}
			} else {
				// New users to be created JIT based on SAML attributes
				if (isSsoJustInTimeProvisioningEnabled()) {
					const newUser = await createUserFromSamlAttributes(attributes);
					return {
						authenticatedUser: newUser,
						attributes,
						onboardingRequired: true,
					};
				}
			}
		}
		return {
			authenticatedUser: undefined,
			attributes,
			onboardingRequired: false,
		};
	}

	async setSamlPreferences(prefs: SamlPreferences): Promise<SamlPreferences | undefined> {
		this._samlPreferences.loginBinding = prefs.loginBinding ?? this._samlPreferences.loginBinding;
		this._samlPreferences.metadata = prefs.metadata ?? this._samlPreferences.metadata;
		this._samlPreferences.mapping = prefs.mapping ?? this._samlPreferences.mapping;
		this._samlPreferences.ignoreSSL = prefs.ignoreSSL ?? this._samlPreferences.ignoreSSL;
		this._samlPreferences.acsBinding = prefs.acsBinding ?? this._samlPreferences.acsBinding;
		this._samlPreferences.signatureConfig =
			prefs.signatureConfig ?? this._samlPreferences.signatureConfig;
		this._samlPreferences.authnRequestsSigned =
			prefs.authnRequestsSigned ?? this._samlPreferences.authnRequestsSigned;
		this._samlPreferences.wantAssertionsSigned =
			prefs.wantAssertionsSigned ?? this._samlPreferences.wantAssertionsSigned;
		this._samlPreferences.wantMessageSigned =
			prefs.wantMessageSigned ?? this._samlPreferences.wantMessageSigned;
		if (prefs.metadataUrl) {
			this._samlPreferences.metadataUrl = prefs.metadataUrl;
			const fetchedMetadata = await this.fetchMetadataFromUrl();
			if (fetchedMetadata) {
				this._samlPreferences.metadata = fetchedMetadata;
			}
		} else if (prefs.metadata) {
			const validationResult = await validateMetadata(prefs.metadata);
			if (!validationResult) {
				throw new Error('Invalid SAML metadata');
			}
			this._samlPreferences.metadata = prefs.metadata;
		}
		await setSamlLoginEnabled(prefs.loginEnabled ?? isSamlLoginEnabled());
		setSamlLoginLabel(prefs.loginLabel ?? getSamlLoginLabel());
		this.getIdentityProviderInstance(true);
		const result = await this.saveSamlPreferencesToDb();
		return result;
	}

	async loadFromDbAndApplySamlPreferences(): Promise<SamlPreferences | undefined> {
		const samlPreferences = await Db.collections.Settings.findOne({
			where: { key: SAML_PREFERENCES_DB_KEY },
		});
		if (samlPreferences) {
			const prefs = jsonParse<SamlPreferences>(samlPreferences.value);
			if (prefs) {
				await this.setSamlPreferences(prefs);
				return prefs;
			}
		}
		return;
	}

	async saveSamlPreferencesToDb(): Promise<SamlPreferences | undefined> {
		const samlPreferences = await Db.collections.Settings.findOne({
			where: { key: SAML_PREFERENCES_DB_KEY },
		});
		const settingsValue = JSON.stringify(this.samlPreferences);
		let result: Settings;
		if (samlPreferences) {
			samlPreferences.value = settingsValue;
			result = await Db.collections.Settings.save(samlPreferences);
		} else {
			result = await Db.collections.Settings.save({
				key: SAML_PREFERENCES_DB_KEY,
				value: settingsValue,
				loadOnStartup: true,
			});
		}
		if (result) return jsonParse<SamlPreferences>(result.value);
		return;
	}

	async fetchMetadataFromUrl(): Promise<string | undefined> {
		if (!this._samlPreferences.metadataUrl)
			throw new BadRequestError('Error fetching SAML Metadata, no Metadata URL set');
		try {
			// TODO:SAML: this will not work once axios is upgraded to > 1.2.0 (see checkServerIdentity)
			const agent = new https.Agent({
				rejectUnauthorized: !this._samlPreferences.ignoreSSL,
			});
			const response = await axios.get(this._samlPreferences.metadataUrl, { httpsAgent: agent });
			if (response.status === 200 && response.data) {
				const xml = (await response.data) as string;
				const validationResult = await validateMetadata(xml);
				if (!validationResult) {
					throw new BadRequestError(
						`Data received from ${this._samlPreferences.metadataUrl} is not valid SAML metadata.`,
					);
				}
				return xml;
			}
		} catch (error) {
			throw new BadRequestError(
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				`Error fetching SAML Metadata from ${this._samlPreferences.metadataUrl}: ${error}`,
			);
		}
		return;
	}

	async getAttributesFromLoginResponse(
		req: express.Request,
		binding: SamlLoginBinding,
	): Promise<SamlUserAttributes> {
		let parsedSamlResponse;
		if (!this._samlPreferences.mapping)
			throw new BadRequestError('Error fetching SAML Attributes, no Attribute mapping set');
		try {
			parsedSamlResponse = await this.getServiceProviderInstance().parseLoginResponse(
				this.getIdentityProviderInstance(),
				binding,
				req,
			);
		} catch (error) {
			// throw error;
			throw new AuthError('SAML Authentication failed. Could not parse SAML response.');
		}
		const { attributes, missingAttributes } = getMappedSamlAttributesFromFlowResult(
			parsedSamlResponse,
			this._samlPreferences.mapping,
		);
		if (!attributes) {
			throw new AuthError('SAML Authentication failed. Invalid SAML response.');
		}
		if (!attributes.email && missingAttributes.length > 0) {
			throw new AuthError(
				`SAML Authentication failed. Invalid SAML response (missing attributes: ${missingAttributes.join(
					', ',
				)}).`,
			);
		}
		return attributes;
	}

	async testSamlConnection(): Promise<boolean> {
		try {
			// TODO:SAML: this will not work once axios is upgraded to > 1.2.0 (see checkServerIdentity)
			const agent = new https.Agent({
				rejectUnauthorized: !this._samlPreferences.ignoreSSL,
			});
			const requestContext = this.getLoginRequestUrl();
			if (!requestContext) return false;
			if (requestContext.binding === 'redirect') {
				const fetchResult = await axios.get(requestContext.context.context, { httpsAgent: agent });
				if (fetchResult.status !== 200) {
					LoggerProxy.debug('SAML: Error while testing SAML connection.');
					return false;
				}
			} else if (requestContext.binding === 'post') {
				const context = requestContext.context as PostBindingContext;
				const endpoint = context.entityEndpoint;
				const url = require('url');
				const params = url.searchParams;
				params.append(context.type, context.context);
				if (context.relayState) {
					params.append('RelayState', context.relayState);
				}
				const fetchResult = await axios.post(endpoint, params, {
					headers: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						'Content-type': 'application/x-www-form-urlencoded',
					},
					httpsAgent: agent,
				});
				if (fetchResult.status !== 200) {
					LoggerProxy.debug('SAML: Error while testing SAML connection.');
					return false;
				}
			}
			return true;
		} catch (error) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			LoggerProxy.debug('SAML: Error while testing SAML connection: ', error);
		}
		return false;
	}
}

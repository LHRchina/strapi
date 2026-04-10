import type { Core } from '@strapi/types';
import type { ProviderCapabilities } from '../../shared/types';
import type { EmailConfig, SendOptions } from './types';

interface EmailProvider {
  send: (options: SendOptions) => Promise<any>;
  verify?: () => Promise<boolean>;
  isIdle?: () => boolean;
  close?: () => void;
  getCapabilities?: () => ProviderCapabilities;
}

interface EmailProviderModule {
  init: (
    options: EmailConfig['providerOptions'],
    settings: EmailConfig['settings']
  ) => EmailProvider;
  name?: string;
  provider?: string;
}

const createProvider = (emailConfig: EmailConfig) => {
  const providerName = emailConfig.provider.toLowerCase();
  let provider: EmailProviderModule;

  let modulePath: string;
  try {
    modulePath = require.resolve(`@strapi/provider-email-${providerName}`);
  } catch (error) {
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'MODULE_NOT_FOUND'
    ) {
      modulePath = providerName;
    } else {
      throw error;
    }
  }

  try {
    provider = require(modulePath);
  } catch (err) {
    const newError = new Error(`Could not load email provider "${providerName}".`);
    if (err instanceof Error) {
      newError.stack = err.stack;
    }
    throw newError;
  }

  return provider.init(emailConfig.providerOptions, emailConfig.settings);
};

export const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  const emailConfig: EmailConfig = strapi.config.get('plugin::email');
  strapi.plugin('email').provider = createProvider(emailConfig);

  // Add permissions
  const actions = [
    {
      section: 'settings',
      category: 'email',
      displayName: 'Access the Email Settings page',
      uid: 'settings.read',
      pluginName: 'email',
    },
    {
      section: 'settings',
      category: 'email',
      displayName: 'Read email templates',
      uid: 'email-templates.read',
      pluginName: 'email',
    },
    {
      section: 'settings',
      category: 'email',
      displayName: 'Create email templates',
      uid: 'email-templates.create',
      pluginName: 'email',
    },
    {
      section: 'settings',
      category: 'email',
      displayName: 'Update email templates',
      uid: 'email-templates.update',
      pluginName: 'email',
    },
    {
      section: 'settings',
      category: 'email',
      displayName: 'Delete email templates',
      uid: 'email-templates.delete',
      pluginName: 'email',
    },
  ];

  await strapi.service('admin::permission').actionProvider.registerMany(actions);

  // Install a global lifecycle subscriber that forwards events to the email-event service.
  // Individual plugins / bootstrap files can register handlers via:
  //   strapi.plugin('email').service('email-event').register(eventName, templateName, resolve)
  const toEventPayload = (event: unknown): Record<string, unknown> =>
    event as Record<string, unknown>;

  strapi.db.lifecycles.subscribe({
    async afterCreate(event) {
      const eventName = `${event.model.uid}.afterCreate`;
      await strapi
        .plugin('email')
        .service('email-event')
        .dispatch(eventName, toEventPayload(event));
    },
    async afterUpdate(event) {
      const eventName = `${event.model.uid}.afterUpdate`;
      await strapi
        .plugin('email')
        .service('email-event')
        .dispatch(eventName, toEventPayload(event));
    },
    async afterDelete(event) {
      const eventName = `${event.model.uid}.afterDelete`;
      await strapi
        .plugin('email')
        .service('email-event')
        .dispatch(eventName, toEventPayload(event));
    },
  });
};

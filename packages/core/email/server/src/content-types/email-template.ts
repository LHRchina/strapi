export default {
  collectionName: 'strapi_email_templates',
  info: {
    name: 'Email Template',
    singularName: 'email-template',
    pluralName: 'email-templates',
    displayName: 'Email Template',
    description: 'Reusable email templates with placeholder support',
  },
  options: {},
  pluginOptions: {
    'content-manager': {
      visible: false,
    },
    'content-type-builder': {
      visible: false,
    },
  },
  attributes: {
    name: {
      type: 'string',
      minLength: 1,
      configurable: false,
      required: true,
      unique: true,
    },
    displayName: {
      type: 'string',
      minLength: 1,
      configurable: false,
      required: false,
      default: '',
    },
    subject: {
      type: 'string',
      minLength: 1,
      configurable: false,
      required: true,
    },
    bodyHtml: {
      type: 'text',
      configurable: false,
      required: false,
      default: '',
    },
    bodyText: {
      type: 'text',
      configurable: false,
      required: false,
      default: '',
    },
    allowedVars: {
      type: 'json',
      configurable: false,
      required: false,
      default: [],
    },
  },
};

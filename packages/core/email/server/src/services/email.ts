import * as _ from 'lodash';
import { objects, template, errors } from '@strapi/utils';

import { isValidEmailTemplate, NEVER_MATCH_REGEXP } from './email-template-validator';
import type {
  EmailConfig,
  EmailOptions,
  EmailTemplate,
  EmailTemplateData,
  EmailTemplateRecord,
  SendOptions,
} from '../types';

const { createStrictInterpolationRegExp } = template;
const { ApplicationError, NotFoundError, ValidationError } = errors;

const EMAIL_TEMPLATE_UID = 'plugin::email.email-template' as const;

const getProviderSettings = (): EmailConfig => strapi.config.get('plugin::email');

const send = async (options: SendOptions) => strapi.plugin('email').provider.send(options);

/**
 * fill subject, text and html using lodash template
 * @param {object} emailOptions - to, from and replyto...
 * @param {object} emailTemplate - object containing attributes to fill
 * @param {object} data - data used to fill the template
 * @returns {{ subject, text, subject }}
 */
const sendTemplatedEmail = (
  emailOptions: EmailOptions,
  emailTemplate: EmailTemplate,
  data: EmailTemplateData
) => {
  const attributes = ['subject', 'text', 'html'];
  const missingAttributes = _.difference(attributes, Object.keys(emailTemplate));

  if (missingAttributes.length > 0) {
    throw new Error(
      `Following attributes are missing from your email template : ${missingAttributes.join(', ')}`
    );
  }

  const allowedInterpolationVariables = objects.keysDeep(data);
  const interpolate = createStrictInterpolationRegExp(allowedInterpolationVariables, 'g');

  const templatedAttributes = attributes.reduce(
    (compiled, attribute) =>
      emailTemplate[attribute]
        ? Object.assign(compiled, {
            [attribute]: _.template(emailTemplate[attribute], {
              interpolate,
            })(data),
          })
        : compiled,
    {}
  );

  return strapi.plugin('email').provider.send({ ...emailOptions, ...templatedAttributes });
};

// ---------------------------------------------------------------------------
// Dynamic template CRUD helpers
// ---------------------------------------------------------------------------

/**
 * Validate that all body fields in a template record are safe.
 * Throws a ValidationError if any field is invalid.
 */
const validateTemplateFields = (
  subject: string,
  bodyHtml: string,
  bodyText: string,
  allowedVars: string[]
) => {
  for (const [field, value] of [
    ['subject', subject],
    ['bodyHtml', bodyHtml],
    ['bodyText', bodyText],
  ] as const) {
    if (value && !isValidEmailTemplate(value, allowedVars)) {
      throw new ValidationError(
        `Invalid template content in field "${field}". ` +
          'Check for forbidden patterns (<% %>, ${}) or undeclared placeholder variables.'
      );
    }
  }
};

const createTemplate = async (data: {
  name: string;
  displayName?: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  allowedVars?: string[];
}): Promise<EmailTemplateRecord> => {
  const allowedVars = data.allowedVars ?? [];
  validateTemplateFields(data.subject, data.bodyHtml ?? '', data.bodyText ?? '', allowedVars);

  return strapi.db.query(EMAIL_TEMPLATE_UID).create({
    data: {
      name: data.name,
      displayName: data.displayName ?? '',
      subject: data.subject,
      bodyHtml: data.bodyHtml ?? '',
      bodyText: data.bodyText ?? '',
      allowedVars,
    },
  });
};

const getTemplate = async (nameOrId: string | number): Promise<EmailTemplateRecord> => {
  const where =
    typeof nameOrId === 'number' || /^\d+$/.test(String(nameOrId))
      ? { id: Number(nameOrId) }
      : { name: nameOrId };

  const record = await strapi.db.query(EMAIL_TEMPLATE_UID).findOne({ where });

  if (!record) {
    throw new NotFoundError(`Email template "${nameOrId}" not found.`);
  }

  return record;
};

const listTemplates = async (): Promise<EmailTemplateRecord[]> => {
  return strapi.db.query(EMAIL_TEMPLATE_UID).findMany({ orderBy: { name: 'asc' } });
};

const updateTemplate = async (
  id: number,
  data: Partial<{
    displayName: string;
    subject: string;
    bodyHtml: string;
    bodyText: string;
    allowedVars: string[];
  }>
): Promise<EmailTemplateRecord> => {
  const existing = await strapi.db.query(EMAIL_TEMPLATE_UID).findOne({ where: { id } });
  if (!existing) {
    throw new NotFoundError(`Email template with id ${id} not found.`);
  }

  const allowedVars = data.allowedVars ?? existing.allowedVars ?? [];
  const subject = data.subject ?? existing.subject;
  const bodyHtml = data.bodyHtml ?? existing.bodyHtml ?? '';
  const bodyText = data.bodyText ?? existing.bodyText ?? '';

  validateTemplateFields(subject, bodyHtml, bodyText, allowedVars);

  return strapi.db.query(EMAIL_TEMPLATE_UID).update({
    where: { id },
    data: {
      ...(data.displayName !== undefined ? { displayName: data.displayName } : {}),
      subject,
      bodyHtml,
      bodyText,
      allowedVars,
    },
  });
};

const deleteTemplate = async (id: number): Promise<void> => {
  const existing = await strapi.db.query(EMAIL_TEMPLATE_UID).findOne({ where: { id } });
  if (!existing) {
    throw new NotFoundError(`Email template with id ${id} not found.`);
  }

  await strapi.db.query(EMAIL_TEMPLATE_UID).delete({ where: { id } });
};

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/**
 * Render a stored template by name or id against the provided data object.
 * Returns the resolved subject, html and text strings without sending.
 */
const renderTemplate = async (
  nameOrId: string | number,
  data: Record<string, unknown>
): Promise<{ subject: string; html: string; text: string }> => {
  const record = await getTemplate(nameOrId);
  const allowedVars: string[] = record.allowedVars ?? [];

  // When allowedVars is empty, use a never-matching regexp so lodash template
  // won't interpolate anything (any placeholder would already fail validation).
  const interpolate =
    allowedVars.length > 0
      ? createStrictInterpolationRegExp(allowedVars, 'g')
      : new RegExp(NEVER_MATCH_REGEXP, 'g');

  const render = (src: string): string => {
    try {
      return _.template(src, { interpolate, evaluate: false, escape: false })(data);
    } catch (err) {
      throw new ApplicationError(
        `Failed to render email template "${record.name}": ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  return {
    subject: render(record.subject),
    html: render(record.bodyHtml ?? ''),
    text: render(record.bodyText ?? ''),
  };
};

/**
 * Render a stored template and send the resulting email in one step.
 */
const sendByTemplateName = async (
  emailOptions: EmailOptions,
  templateName: string | number,
  data: Record<string, unknown>
): Promise<void> => {
  const { subject, html, text } = await renderTemplate(templateName, data);
  await strapi.plugin('email').provider.send({ ...emailOptions, subject, html, text });
};

const emailService = () => ({
  getProviderSettings,
  send,
  sendTemplatedEmail,
  // Dynamic template CRUD
  createTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
  deleteTemplate,
  // Rendering & sending
  renderTemplate,
  sendByTemplateName,
});

export default emailService;

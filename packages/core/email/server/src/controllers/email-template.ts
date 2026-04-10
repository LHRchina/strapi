import { errors } from '@strapi/utils';
import type Koa from 'koa';

const { ApplicationError } = errors;

const emailTemplateController = {
  async list(ctx: Koa.Context) {
    const templates = await strapi.plugin('email').service('email').listTemplates();
    ctx.send(templates);
  },

  async findOne(ctx: Koa.Context) {
    const { id } = ctx.params as { id: string };
    const template = await strapi.plugin('email').service('email').getTemplate(id);
    ctx.send(template);
  },

  async create(ctx: Koa.Context) {
    const body = ctx.request.body as {
      name: string;
      displayName?: string;
      subject: string;
      bodyHtml?: string;
      bodyText?: string;
      allowedVars?: string[];
    };

    const template = await strapi.plugin('email').service('email').createTemplate(body);
    ctx.created(template);
  },

  async update(ctx: Koa.Context) {
    const { id } = ctx.params as { id: string };
    const body = ctx.request.body as {
      displayName?: string;
      subject?: string;
      bodyHtml?: string;
      bodyText?: string;
      allowedVars?: string[];
    };

    const template = await strapi
      .plugin('email')
      .service('email')
      .updateTemplate(Number(id), body);
    ctx.send(template);
  },

  async delete(ctx: Koa.Context) {
    const { id } = ctx.params as { id: string };
    await strapi.plugin('email').service('email').deleteTemplate(Number(id));
    ctx.send({ ok: true });
  },

  async preview(ctx: Koa.Context) {
    const { id } = ctx.params as { id: string };
    const body = ctx.request.body as { data?: Record<string, unknown> };
    const sampleData = body?.data ?? {};

    try {
      const rendered = await strapi
        .plugin('email')
        .service('email')
        .renderTemplate(id, sampleData);
      ctx.send(rendered);
    } catch (error) {
      if (error instanceof Error) {
        throw new ApplicationError(error.message);
      }
      throw error;
    }
  },

  async testSend(ctx: Koa.Context) {
    const { id } = ctx.params as { id: string };
    const body = ctx.request.body as {
      to: string;
      data?: Record<string, unknown>;
    };

    if (!body?.to) {
      throw new ApplicationError('No recipient address (to) provided.');
    }

    try {
      await strapi
        .plugin('email')
        .service('email')
        .sendByTemplateName({ to: body.to }, id, body.data ?? {});
    } catch (error) {
      if (error instanceof Error) {
        throw new ApplicationError(`Failed to send test email: ${error.message}`);
      }
      throw error;
    }

    ctx.send({ ok: true });
  },
};

export default emailTemplateController;

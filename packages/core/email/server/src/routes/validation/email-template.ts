import * as z from 'zod/v4';

const allowedVarsSchema = z.array(z.string()).optional().default([]);

export const createEmailTemplateInput = z.object({
  name: z.string().min(1),
  displayName: z.string().optional(),
  subject: z.string().min(1),
  bodyHtml: z.string().optional(),
  bodyText: z.string().optional(),
  allowedVars: allowedVarsSchema,
});

export const updateEmailTemplateInput = z.object({
  displayName: z.string().optional(),
  subject: z.string().min(1).optional(),
  bodyHtml: z.string().optional(),
  bodyText: z.string().optional(),
  allowedVars: allowedVarsSchema,
});

export const previewEmailTemplateInput = z.object({
  data: z.record(z.string(), z.unknown()).optional(),
});

export const testSendEmailTemplateInput = z.object({
  to: z.string().min(1),
  data: z.record(z.string(), z.unknown()).optional(),
});

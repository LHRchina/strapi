/**
 * EmailEventService
 *
 * Allows operators to register mappings between Strapi DB lifecycle events
 * (or arbitrary event-hub events) and stored email templates.
 *
 * Usage (in a custom plugin or bootstrap):
 * ```ts
 * strapi.plugin('email').service('email-event').register(
 *   'api::order.order.afterCreate',
 *   'order-confirmation',
 *   async (event) => ({
 *     to: event.result.customerEmail,
 *     data: { order: event.result },
 *   })
 * );
 * ```
 */

import type { EmailOptions } from '../types';

type EventPayload = Record<string, unknown>;

type EmailResolver = (
  event: EventPayload
) => Promise<{ to: string; data?: Record<string, unknown> } & Partial<EmailOptions>>;

interface EventMapping {
  templateName: string;
  resolve: EmailResolver;
}

const createEmailEventService = () => {
  const mappings = new Map<string, EventMapping[]>();

  /**
   * Register a handler that maps a lifecycle/event-hub event to an email template.
   *
   * @param eventName    - Full Strapi event name, e.g. "api::order.order.afterCreate".
   * @param templateName - Slug of the stored email template to use.
   * @param resolve      - Async function that receives the event payload and returns
   *                       `{ to, data?, ...emailOptions }`.
   */
  const register = (
    eventName: string,
    templateName: string,
    resolve: EmailResolver
  ): void => {
    const existing = mappings.get(eventName) ?? [];
    existing.push({ templateName, resolve });
    mappings.set(eventName, existing);
  };

  /**
   * Dispatch an event to all registered handlers.
   * Called internally from the lifecycle subscriber installed in bootstrap.
   */
  const dispatch = async (eventName: string, payload: EventPayload): Promise<void> => {
    const handlers = mappings.get(eventName);
    if (!handlers || handlers.length === 0) return;

    const emailService = strapi.plugin('email').service('email');

    await Promise.allSettled(
      handlers.map(async ({ templateName, resolve }) => {
        try {
          const { to, data = {}, ...emailOptions } = await resolve(payload);
          await emailService.sendByTemplateName({ to, ...emailOptions }, templateName, data);
        } catch (err) {
          strapi.log.error(
            `[plugin::email] Failed to send templated email for event "${eventName}" (template: "${templateName}"): ${err instanceof Error ? err.message : String(err)}`
          );
        }
      })
    );
  };

  return { register, dispatch };
};

export default createEmailEventService;

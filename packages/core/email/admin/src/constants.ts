export const PERMISSIONS = {
  // This permission regards the main component (App) and is used to tell
  // If the plugin link should be displayed in the menu
  // And also if the plugin is accessible. This use case is found when a user types the url of the
  // plugin directly in the browser
  settings: [{ action: 'plugin::email.settings.read', subject: null }],
  readEmailTemplates: [{ action: 'plugin::email.email-templates.read', subject: null }],
  createEmailTemplates: [{ action: 'plugin::email.email-templates.create', subject: null }],
  updateEmailTemplates: [{ action: 'plugin::email.email-templates.update', subject: null }],
  deleteEmailTemplates: [{ action: 'plugin::email.email-templates.delete', subject: null }],
};

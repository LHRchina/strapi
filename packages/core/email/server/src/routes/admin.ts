export default {
  type: 'admin',
  routes: [
    {
      method: 'POST',
      path: '/',
      handler: 'email.send',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/test',
      handler: 'email.test',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          { name: 'admin::hasPermissions', config: { actions: ['plugin::email.settings.read'] } },
        ],
      },
    },
    {
      method: 'GET',
      path: '/settings',
      handler: 'email.getSettings',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          { name: 'admin::hasPermissions', config: { actions: ['plugin::email.settings.read'] } },
        ],
      },
    },
    {
      method: 'POST',
      path: '/verify',
      handler: 'email.verify',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          { name: 'admin::hasPermissions', config: { actions: ['plugin::email.settings.read'] } },
        ],
      },
    },
    // Dynamic email templates
    {
      method: 'GET',
      path: '/templates',
      handler: 'email-template.list',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          {
            name: 'admin::hasPermissions',
            config: { actions: ['plugin::email.email-templates.read'] },
          },
        ],
      },
    },
    {
      method: 'POST',
      path: '/templates',
      handler: 'email-template.create',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          {
            name: 'admin::hasPermissions',
            config: { actions: ['plugin::email.email-templates.create'] },
          },
        ],
      },
    },
    {
      method: 'GET',
      path: '/templates/:id',
      handler: 'email-template.findOne',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          {
            name: 'admin::hasPermissions',
            config: { actions: ['plugin::email.email-templates.read'] },
          },
        ],
      },
    },
    {
      method: 'PUT',
      path: '/templates/:id',
      handler: 'email-template.update',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          {
            name: 'admin::hasPermissions',
            config: { actions: ['plugin::email.email-templates.update'] },
          },
        ],
      },
    },
    {
      method: 'DELETE',
      path: '/templates/:id',
      handler: 'email-template.delete',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          {
            name: 'admin::hasPermissions',
            config: { actions: ['plugin::email.email-templates.delete'] },
          },
        ],
      },
    },
    {
      method: 'POST',
      path: '/templates/:id/preview',
      handler: 'email-template.preview',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          {
            name: 'admin::hasPermissions',
            config: { actions: ['plugin::email.email-templates.read'] },
          },
        ],
      },
    },
    {
      method: 'POST',
      path: '/templates/:id/test-send',
      handler: 'email-template.testSend',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          {
            name: 'admin::hasPermissions',
            config: { actions: ['plugin::email.email-templates.read'] },
          },
        ],
      },
    },
  ],
};

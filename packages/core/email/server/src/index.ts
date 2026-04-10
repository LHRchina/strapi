import { bootstrap } from './bootstrap';
import { services } from './services';
import { routes } from './routes';
import { controllers } from './controllers';
import { config } from './config';
import middlewares from './middlewares';
import emailTemplateSchema from './content-types/email-template';

export default {
  bootstrap,
  services,
  routes,
  controllers,
  config,
  middlewares,
  contentTypes: {
    'email-template': { schema: emailTemplateSchema },
  },
};

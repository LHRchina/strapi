export interface ProviderCapabilities {
  transport?: {
    host?: string;
    port?: number;
    secure?: boolean;
    pool?: boolean;
    maxConnections?: number;
  };
  auth?: {
    type?: string;
    user?: string;
  };
  features?: string[];
}

export interface EmailSettings {
  config: ConfigSettings;
  supportsVerify: boolean;
  capabilities?: ProviderCapabilities;
  isIdle?: boolean;
}

export interface ConfigSettings {
  provider: string;
  settings: {
    defaultFrom: string;
    defaultReplyTo: string;
  };
}

/** Shape of a stored dynamic email template record (plugin::email.email-template). */
export interface EmailTemplateRecord {
  id: number;
  name: string;
  displayName: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  allowedVars: string[];
  createdAt: string;
  updatedAt: string;
}

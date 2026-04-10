import * as React from 'react';

import { Page, useNotification, useFetchClient, Layouts, useRBAC } from '@strapi/admin/strapi-admin';
import { Button, Box } from '@strapi/design-system';
import { Plus } from '@strapi/icons';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { PERMISSIONS } from '../../constants';
import TemplateTable from './TemplateTable';
import TemplateForm from './TemplateForm';
import PreviewModal from './PreviewModal';

import type { EmailTemplateRecord } from '../../../../shared/types';

export const ProtectedEmailTemplatesPage = () => (
  <Page.Protect permissions={PERMISSIONS.readEmailTemplates}>
    <EmailTemplatesPage />
  </Page.Protect>
);

export const EmailTemplatesPage = () => {
  const { formatMessage } = useIntl();
  const { toggleNotification } = useNotification();
  const { get, post, put, del } = useFetchClient();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<EmailTemplateRecord | null>(null);

  const {
    isLoading: isLoadingPermissions,
    allowedActions: { canCreate, canUpdate, canDelete },
  } = useRBAC({
    create: PERMISSIONS.createEmailTemplates,
    update: PERMISSIONS.updateEmailTemplates,
    delete: PERMISSIONS.deleteEmailTemplates,
  });

  const { isLoading: isLoadingData, data: templates = [] } = useQuery(
    ['email', 'templates'],
    async () => {
      const { data } = await get<EmailTemplateRecord[]>('/email/templates');
      return data;
    },
    {
      onError() {
        toggleNotification({
          type: 'danger',
          message: formatMessage({
            id: 'email.Templates.notification.error',
            defaultMessage: 'An error occurred',
          }),
        });
      },
    }
  );

  const createMutation = useMutation(
    (body: Parameters<typeof post>[1]) => post('/email/templates', body),
    {
      async onSuccess() {
        await queryClient.invalidateQueries(['email', 'templates']);
        toggleNotification({
          type: 'success',
          message: formatMessage({
            id: 'email.Templates.notification.created',
            defaultMessage: 'Email template created',
          }),
        });
        setIsFormOpen(false);
        setSelectedTemplate(null);
      },
      onError() {
        toggleNotification({
          type: 'danger',
          message: formatMessage({
            id: 'email.Templates.notification.error',
            defaultMessage: 'An error occurred',
          }),
        });
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, body }: { id: number; body: Parameters<typeof put>[1] }) =>
      put(`/email/templates/${id}`, body),
    {
      async onSuccess() {
        await queryClient.invalidateQueries(['email', 'templates']);
        toggleNotification({
          type: 'success',
          message: formatMessage({
            id: 'email.Templates.notification.updated',
            defaultMessage: 'Email template updated',
          }),
        });
        setIsFormOpen(false);
        setSelectedTemplate(null);
      },
      onError() {
        toggleNotification({
          type: 'danger',
          message: formatMessage({
            id: 'email.Templates.notification.error',
            defaultMessage: 'An error occurred',
          }),
        });
      },
    }
  );

  const deleteMutation = useMutation(
    (id: number) => del(`/email/templates/${id}`),
    {
      async onSuccess() {
        await queryClient.invalidateQueries(['email', 'templates']);
        toggleNotification({
          type: 'success',
          message: formatMessage({
            id: 'email.Templates.notification.deleted',
            defaultMessage: 'Email template deleted',
          }),
        });
      },
      onError() {
        toggleNotification({
          type: 'danger',
          message: formatMessage({
            id: 'email.Templates.notification.error',
            defaultMessage: 'An error occurred',
          }),
        });
      },
    }
  );

  const handleCreateClick = () => {
    setSelectedTemplate(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (template: EmailTemplateRecord) => {
    setSelectedTemplate(template);
    setIsFormOpen(true);
  };

  const handlePreviewClick = (template: EmailTemplateRecord) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleDeleteClick = (template: EmailTemplateRecord) => {
    // eslint-disable-next-line no-alert
    if (window.confirm(formatMessage({ id: 'email.Templates.delete.confirm', defaultMessage: 'Are you sure you want to delete this template?' }))) {
      deleteMutation.mutate(template.id);
    }
  };

  const handleFormSubmit = (values: {
    name: string;
    displayName: string;
    subject: string;
    bodyHtml: string;
    bodyText: string;
    allowedVars: string[];
  }) => {
    if (selectedTemplate) {
      updateMutation.mutate({ id: selectedTemplate.id, body: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const isLoading = isLoadingPermissions || isLoadingData;

  if (isLoading) {
    return <Page.Loading />;
  }

  const isMutating = createMutation.isLoading || updateMutation.isLoading;

  return (
    <Page.Main
      aria-busy={isMutating}
    >
      <Page.Title>
        {formatMessage(
          { id: 'Settings.PageTitle', defaultMessage: 'Settings - {name}' },
          {
            name: formatMessage({
              id: 'email.SettingsNav.link.emailTemplates',
              defaultMessage: 'Email templates',
            }),
          }
        )}
      </Page.Title>
      <Layouts.Header
        title={formatMessage({
          id: 'email.Templates.header.title',
          defaultMessage: 'Email templates',
        })}
        subtitle={formatMessage({
          id: 'email.Templates.header.subtitle',
          defaultMessage: 'Manage reusable email templates with dynamic placeholders',
        })}
        primaryAction={
          canCreate ? (
            <Button startIcon={<Plus />} onClick={handleCreateClick}>
              {formatMessage({
                id: 'email.Templates.button.create',
                defaultMessage: 'Create template',
              })}
            </Button>
          ) : undefined
        }
      />
      <Layouts.Content>
        <Box background="neutral0" hasRadius shadow="filterShadow" paddingTop={6} paddingBottom={6} paddingLeft={7} paddingRight={7}>
          <TemplateTable
            templates={templates}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onPreviewClick={handlePreviewClick}
          />
        </Box>
      </Layouts.Content>

      <TemplateForm
        template={selectedTemplate}
        open={isFormOpen}
        isSubmitting={isMutating}
        onToggle={() => {
          setIsFormOpen(false);
          setSelectedTemplate(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <PreviewModal
        template={selectedTemplate}
        open={isPreviewOpen}
        onToggle={() => {
          setIsPreviewOpen(false);
          setSelectedTemplate(null);
        }}
      />
    </Page.Main>
  );
};

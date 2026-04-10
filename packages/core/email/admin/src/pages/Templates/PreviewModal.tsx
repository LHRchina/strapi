import * as React from 'react';

import {
  Button,
  Grid,
  Modal,
  Breadcrumbs,
  Crumb,
  VisuallyHidden,
  TextInput,
  Textarea,
  Field,
  Box,
  Typography,
} from '@strapi/design-system';
import { useNotification, useFetchClient } from '@strapi/admin/strapi-admin';
import { useIntl } from 'react-intl';
import { useMutation } from 'react-query';

import type { EmailTemplateRecord } from '../../../../shared/types';

interface PreviewResult {
  subject: string;
  html: string;
  text: string;
}

interface PreviewModalProps {
  template: EmailTemplateRecord | null;
  open: boolean;
  onToggle: () => void;
}

const PreviewModal = ({ template, open, onToggle }: PreviewModalProps) => {
  const { formatMessage } = useIntl();
  const { toggleNotification } = useNotification();
  const { post } = useFetchClient();

  const [sampleDataRaw, setSampleDataRaw] = React.useState('{}');
  const [testTo, setTestTo] = React.useState('');
  const [preview, setPreview] = React.useState<PreviewResult | null>(null);
  const [parseError, setParseError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setSampleDataRaw('{}');
      setTestTo('');
      setPreview(null);
      setParseError(null);
    }
  }, [open, template]);

  const parseSampleData = (): Record<string, unknown> | null => {
    try {
      const parsed = JSON.parse(sampleDataRaw);
      setParseError(null);
      return parsed;
    } catch (e) {
      setParseError('Invalid JSON');
      return null;
    }
  };

  const previewMutation = useMutation(
    async () => {
      const data = parseSampleData();
      if (!data || !template) return null;
      const res = await post<PreviewResult>(`/email/templates/${template.id}/preview`, { data });
      return res.data;
    },
    {
      onSuccess(result) {
        if (result) setPreview(result);
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

  const testSendMutation = useMutation(
    async () => {
      const data = parseSampleData();
      if (!data || !template) return;
      await post(`/email/templates/${template.id}/test-send`, { to: testTo, data });
    },
    {
      onSuccess() {
        toggleNotification({
          type: 'success',
          message: formatMessage({
            id: 'email.Templates.preview.notification.sent',
            defaultMessage: 'Test email sent',
          }),
        });
      },
      onError(error) {
        toggleNotification({
          type: 'danger',
          message: formatMessage(
            {
              id: 'email.Templates.preview.notification.sendError',
              defaultMessage: 'Failed to send test email: {error}',
            },
            { error: error instanceof Error ? error.message : String(error) }
          ),
        });
      },
    }
  );

  if (!template) return null;

  return (
    <Modal.Root open={open} onOpenChange={onToggle}>
      <Modal.Content>
        <Modal.Header>
          <Breadcrumbs
            label={formatMessage({
              id: 'email.Templates.preview.title',
              defaultMessage: 'Preview template',
            })}
          >
            <Crumb isCurrent>
              {formatMessage({
                id: 'email.Templates.preview.title',
                defaultMessage: 'Preview template',
              })}
            </Crumb>
          </Breadcrumbs>
          <VisuallyHidden>
            <Modal.Title>
              {formatMessage({
                id: 'email.Templates.preview.title',
                defaultMessage: 'Preview template',
              })}
            </Modal.Title>
          </VisuallyHidden>
        </Modal.Header>
        <Modal.Body>
          <Grid.Root gap={5}>
            <Grid.Item col={12} xs={12} direction="column" alignItems="stretch">
              <Field.Root name="sampleData">
                <Field.Label>
                  {formatMessage({
                    id: 'email.Templates.preview.field.sampleData',
                    defaultMessage: 'Sample data (JSON)',
                  })}
                </Field.Label>
                <Textarea
                  name="sampleData"
                  value={sampleDataRaw}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setSampleDataRaw(e.target.value)
                  }
                  rows={5}
                  placeholder='{ "user": { "email": "test@example.com" } }'
                  error={parseError ?? undefined}
                />
                <Field.Hint>
                  {formatMessage({
                    id: 'email.Templates.preview.field.sampleData.hint',
                    defaultMessage: 'Enter a JSON object to render the template with',
                  })}
                </Field.Hint>
              </Field.Root>
            </Grid.Item>

            <Grid.Item col={12} xs={12} direction="column" alignItems="stretch">
              <Button
                variant="secondary"
                loading={previewMutation.isLoading}
                onClick={() => previewMutation.mutate()}
              >
                {formatMessage({
                  id: 'email.Templates.preview.button.render',
                  defaultMessage: 'Render preview',
                })}
              </Button>
            </Grid.Item>

            {preview && (
              <>
                <Grid.Item col={12} xs={12} direction="column" alignItems="stretch">
                  <Field.Root name="previewSubject">
                    <Field.Label>
                      {formatMessage({
                        id: 'email.Templates.preview.result.subject',
                        defaultMessage: 'Subject',
                      })}
                    </Field.Label>
                    <TextInput name="previewSubject" value={preview.subject} readOnly disabled />
                  </Field.Root>
                </Grid.Item>

                <Grid.Item col={12} xs={12} direction="column" alignItems="stretch">
                  <Field.Root name="previewText">
                    <Field.Label>
                      {formatMessage({
                        id: 'email.Templates.preview.result.text',
                        defaultMessage: 'Plain-text output',
                      })}
                    </Field.Label>
                    <Textarea
                      name="previewText"
                      value={preview.text}
                      readOnly
                      disabled
                      rows={4}
                    />
                  </Field.Root>
                </Grid.Item>

                <Grid.Item col={12} xs={12} direction="column" alignItems="stretch">
                  <Typography variant="pi" fontWeight="bold">
                    {formatMessage({
                      id: 'email.Templates.preview.result.html',
                      defaultMessage: 'HTML output',
                    })}
                  </Typography>
                  {/* Sandboxed iframe prevents XSS */}
                  <Box
                    marginTop={2}
                    style={{ border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden' }}
                  >
                    <iframe
                      title="Email HTML preview"
                      sandbox="allow-same-origin"
                      style={{ width: '100%', minHeight: 300, border: 'none' }}
                      srcDoc={preview.html}
                    />
                  </Box>
                </Grid.Item>
              </>
            )}

            <Grid.Item col={8} xs={12} direction="column" alignItems="stretch">
              <Field.Root name="testTo">
                <Field.Label>
                  {formatMessage({
                    id: 'email.Templates.preview.field.testTo',
                    defaultMessage: 'Send to (email address)',
                  })}
                </Field.Label>
                <TextInput
                  name="testTo"
                  value={testTo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestTo(e.target.value)}
                  type="email"
                  placeholder="test@example.com"
                />
              </Field.Root>
            </Grid.Item>

            <Grid.Item col={4} xs={12} direction="column" alignItems="flex-end">
              <Button
                variant="secondary"
                loading={testSendMutation.isLoading}
                onClick={() => testSendMutation.mutate()}
                disabled={!testTo}
                style={{ marginTop: 'auto' }}
              >
                {formatMessage({
                  id: 'email.Templates.preview.button.testSend',
                  defaultMessage: 'Send test email',
                })}
              </Button>
            </Grid.Item>
          </Grid.Root>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close>
            <Button variant="tertiary">
              {formatMessage({
                id: 'email.Templates.form.button.cancel',
                defaultMessage: 'Cancel',
              })}
            </Button>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export default PreviewModal;

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
  Typography,
} from '@strapi/design-system';
import { useIntl } from 'react-intl';

import type { EmailTemplateRecord } from '../../../../shared/types';

type TemplateFormValues = {
  name: string;
  displayName: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  allowedVarsRaw: string; // comma-separated string for the UI
};

interface TemplateFormProps {
  template?: EmailTemplateRecord | null;
  open: boolean;
  isSubmitting: boolean;
  onToggle: () => void;
  onSubmit: (values: Omit<TemplateFormValues, 'allowedVarsRaw'> & { allowedVars: string[] }) => void;
}

const TemplateForm = ({ template, open, isSubmitting, onToggle, onSubmit }: TemplateFormProps) => {
  const { formatMessage } = useIntl();
  const isEditing = Boolean(template);

  const [values, setValues] = React.useState<TemplateFormValues>({
    name: '',
    displayName: '',
    subject: '',
    bodyHtml: '',
    bodyText: '',
    allowedVarsRaw: '',
  });

  React.useEffect(() => {
    if (template) {
      setValues({
        name: template.name,
        displayName: template.displayName ?? '',
        subject: template.subject,
        bodyHtml: template.bodyHtml ?? '',
        bodyText: template.bodyText ?? '',
        allowedVarsRaw: (template.allowedVars ?? []).join(', '),
      });
    } else {
      setValues({ name: '', displayName: '', subject: '', bodyHtml: '', bodyText: '', allowedVarsRaw: '' });
    }
  }, [template, open]);

  const handleChange =
    (field: keyof TemplateFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allowedVars = values.allowedVarsRaw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    onSubmit({ ...values, allowedVars });
  };

  return (
    <Modal.Root open={open} onOpenChange={onToggle}>
      <Modal.Content>
        <Modal.Header>
          <Breadcrumbs
            label={
              isEditing
                ? formatMessage({
                    id: 'email.Templates.form.edit.title',
                    defaultMessage: 'Edit email template',
                  })
                : formatMessage({
                    id: 'email.Templates.form.create.title',
                    defaultMessage: 'Create email template',
                  })
            }
          >
            <Crumb isCurrent>
              {isEditing
                ? formatMessage({
                    id: 'email.Templates.form.edit.title',
                    defaultMessage: 'Edit email template',
                  })
                : formatMessage({
                    id: 'email.Templates.form.create.title',
                    defaultMessage: 'Create email template',
                  })}
            </Crumb>
          </Breadcrumbs>
          <VisuallyHidden>
            <Modal.Title>
              {isEditing
                ? formatMessage({
                    id: 'email.Templates.form.edit.title',
                    defaultMessage: 'Edit email template',
                  })
                : formatMessage({
                    id: 'email.Templates.form.create.title',
                    defaultMessage: 'Create email template',
                  })}
            </Modal.Title>
          </VisuallyHidden>
        </Modal.Header>
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            <Grid.Root gap={5}>
              <Grid.Item col={6} xs={12} direction="column" alignItems="stretch">
                <Field.Root name="name" required>
                  <Field.Label>
                    {formatMessage({
                      id: 'email.Templates.form.field.name',
                      defaultMessage: 'Template name (slug)',
                    })}
                  </Field.Label>
                  <TextInput
                    name="name"
                    value={values.name}
                    onChange={handleChange('name')}
                    disabled={isEditing}
                    placeholder="e.g. order-confirmation"
                  />
                  <Field.Hint>
                    {formatMessage({
                      id: 'email.Templates.form.field.name.hint',
                      defaultMessage: 'Unique identifier used in code, e.g. order-confirmation',
                    })}
                  </Field.Hint>
                </Field.Root>
              </Grid.Item>

              <Grid.Item col={6} xs={12} direction="column" alignItems="stretch">
                <Field.Root name="displayName">
                  <Field.Label>
                    {formatMessage({
                      id: 'email.Templates.form.field.displayName',
                      defaultMessage: 'Display name',
                    })}
                  </Field.Label>
                  <TextInput
                    name="displayName"
                    value={values.displayName}
                    onChange={handleChange('displayName')}
                    placeholder="e.g. Order Confirmation"
                  />
                </Field.Root>
              </Grid.Item>

              <Grid.Item col={12} xs={12} direction="column" alignItems="stretch">
                <Field.Root name="subject" required>
                  <Field.Label>
                    {formatMessage({
                      id: 'email.Templates.form.field.subject',
                      defaultMessage: 'Subject',
                    })}
                  </Field.Label>
                  <TextInput
                    name="subject"
                    value={values.subject}
                    onChange={handleChange('subject')}
                    placeholder="e.g. Your order <%= order.id %> is confirmed"
                  />
                  <Field.Hint>
                    {formatMessage({
                      id: 'email.Templates.form.field.subject.hint',
                      defaultMessage: 'Supports placeholders: <%= varName %>',
                    })}
                  </Field.Hint>
                </Field.Root>
              </Grid.Item>

              <Grid.Item col={12} xs={12} direction="column" alignItems="stretch">
                <Field.Root name="allowedVarsRaw">
                  <Field.Label>
                    {formatMessage({
                      id: 'email.Templates.form.field.allowedVars',
                      defaultMessage: 'Allowed variables',
                    })}
                  </Field.Label>
                  <TextInput
                    name="allowedVarsRaw"
                    value={values.allowedVarsRaw}
                    onChange={handleChange('allowedVarsRaw')}
                    placeholder={formatMessage({
                      id: 'email.Templates.form.field.allowedVars.placeholder',
                      defaultMessage: 'e.g. user.email, order.id',
                    })}
                  />
                  <Field.Hint>
                    {formatMessage({
                      id: 'email.Templates.form.field.allowedVars.hint',
                      defaultMessage:
                        'Comma-separated dot-notation paths, e.g. user.email, order.id',
                    })}
                  </Field.Hint>
                </Field.Root>
              </Grid.Item>

              <Grid.Item col={12} xs={12} direction="column" alignItems="stretch">
                <Field.Root name="bodyHtml">
                  <Field.Label>
                    {formatMessage({
                      id: 'email.Templates.form.field.bodyHtml',
                      defaultMessage: 'HTML body',
                    })}
                  </Field.Label>
                  <Textarea
                    name="bodyHtml"
                    value={values.bodyHtml}
                    onChange={handleChange('bodyHtml')}
                    rows={8}
                    placeholder="<p>Hello <%= user.email %>,</p>"
                  />
                </Field.Root>
              </Grid.Item>

              <Grid.Item col={12} xs={12} direction="column" alignItems="stretch">
                <Field.Root name="bodyText">
                  <Field.Label>
                    {formatMessage({
                      id: 'email.Templates.form.field.bodyText',
                      defaultMessage: 'Plain-text body',
                    })}
                  </Field.Label>
                  <Textarea
                    name="bodyText"
                    value={values.bodyText}
                    onChange={handleChange('bodyText')}
                    rows={5}
                    placeholder="Hello <%= user.email %>,"
                  />
                </Field.Root>
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
            <Button loading={isSubmitting} type="submit">
              {formatMessage({ id: 'email.Templates.form.button.save', defaultMessage: 'Save' })}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};

export default TemplateForm;

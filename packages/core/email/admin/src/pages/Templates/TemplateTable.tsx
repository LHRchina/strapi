import * as React from 'react';

import {
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Typography,
  VisuallyHidden,
  Box,
  Flex,
} from '@strapi/design-system';
import { Pencil, Trash, Eye } from '@strapi/icons';
import { useIntl } from 'react-intl';

import type { EmailTemplateRecord } from '../../../../shared/types';

interface TemplateTableProps {
  templates: EmailTemplateRecord[];
  canUpdate: boolean;
  canDelete: boolean;
  onEditClick: (template: EmailTemplateRecord) => void;
  onDeleteClick: (template: EmailTemplateRecord) => void;
  onPreviewClick: (template: EmailTemplateRecord) => void;
}

const TemplateTable = ({
  templates,
  canUpdate,
  canDelete,
  onEditClick,
  onDeleteClick,
  onPreviewClick,
}: TemplateTableProps) => {
  const { formatMessage } = useIntl();

  if (templates.length === 0) {
    return (
      <Flex justifyContent="center" padding={10}>
        <Typography textColor="neutral600">
          {formatMessage({
            id: 'email.Templates.table.empty',
            defaultMessage: 'No email templates yet',
          })}
        </Typography>
      </Flex>
    );
  }

  return (
    <Table colCount={4} rowCount={templates.length + 1}>
      <Thead>
        <Tr>
          <Th>
            <Typography variant="sigma" textColor="neutral600">
              {formatMessage({ id: 'email.Templates.table.name', defaultMessage: 'Name' })}
            </Typography>
          </Th>
          <Th>
            <Typography variant="sigma" textColor="neutral600">
              {formatMessage({
                id: 'email.Templates.table.displayName',
                defaultMessage: 'Display name',
              })}
            </Typography>
          </Th>
          <Th>
            <Typography variant="sigma" textColor="neutral600">
              {formatMessage({ id: 'email.Templates.table.subject', defaultMessage: 'Subject' })}
            </Typography>
          </Th>
          <Th width="1%">
            <VisuallyHidden>
              {formatMessage({ id: 'email.Templates.table.actions', defaultMessage: 'Actions' })}
            </VisuallyHidden>
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {templates.map((tpl) => (
          <Tr key={tpl.id} cursor="pointer" onClick={() => onEditClick(tpl)}>
            <Td>
              <Typography>{tpl.name}</Typography>
            </Td>
            <Td>
              <Typography>{tpl.displayName}</Typography>
            </Td>
            <Td>
              <Typography>{tpl.subject}</Typography>
            </Td>
            <Td onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <Box display="flex" gap={1}>
                <IconButton
                  onClick={() => onPreviewClick(tpl)}
                  label={formatMessage({
                    id: 'email.Templates.preview.title',
                    defaultMessage: 'Preview template',
                  })}
                  variant="ghost"
                >
                  <Eye />
                </IconButton>
                <IconButton
                  onClick={() => onEditClick(tpl)}
                  label={formatMessage({
                    id: 'email.Templates.form.edit.title',
                    defaultMessage: 'Edit email template',
                  })}
                  variant="ghost"
                  disabled={!canUpdate}
                >
                  <Pencil />
                </IconButton>
                <IconButton
                  onClick={() => onDeleteClick(tpl)}
                  label={formatMessage({
                    id: 'email.Templates.delete.confirm',
                    defaultMessage: 'Delete template',
                  })}
                  variant="ghost"
                  disabled={!canDelete}
                >
                  <Trash />
                </IconButton>
              </Box>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default TemplateTable;

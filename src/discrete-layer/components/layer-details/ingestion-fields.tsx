/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react';
import { FormikValues } from 'formik';
import { cloneDeep, isEmpty } from 'lodash';
import { Button, CircularProgress, Icon, Tooltip, Typography } from '@map-colonies/react-core';
import {
  Box,
  defaultFormatters,
  FileData,
} from '@map-colonies/react-components';
import { Selection } from '../../../common/components/file-picker';
import { FieldLabelComponent } from '../../../common/components/form/field-label';
import { Mode } from '../../../common/models/mode.enum';
import { MetadataFile } from '../../../common/components/file-picker';
import { RecordType, LayerMetadataMixedUnion, useQuery, useStore } from '../../models';
import { FilePickerDialog } from '../dialogs/file-picker.dialog';
import {
  Layer3DRecordModelKeys,
  LayerDemRecordModelKeys,
  LayerRasterRecordModelKeys,
} from './entity-types-keys';
import { StringValuePresentorComponent } from './field-value-presentors/string.value-presentor';
import { IRecordFieldInfo } from './layer-details.field-info';
import { EntityFormikHandlers, FormValues } from './layer-datails-form';
import { importJSONFileFromClient } from './utils';

import './ingestion-fields.css';

const DIRECTORY = 0;
const FILES = 1;
const NUM_OF_ROWS = 3;

interface IngestionFieldsProps {
  recordType: RecordType;
  fields: IRecordFieldInfo[];
  values: FormikValues;
  reloadFormMetadata?: (
    ingestionFields: FormValues,
    metadata: MetadataFile
  ) => void;
  formik?: EntityFormikHandlers;
}

const FileItem: React.FC<{ file: FileData }> = ({ file }) => {
  return (
    <>
      <Box><Icon className="fileIcon mc-icon-Map-Vector" /></Box>
      <Box>{file.name}</Box>
      <Box style={{ direction: 'ltr' }}>
        {defaultFormatters.formatFileSize(null, file)}
      </Box>
    </>
  );
};

const MoreItem: React.FC<{ files: FileData[] }> = ({ files }) => {
  return (
    <>
      <Box className="fileIconSpacer"></Box>
      <Tooltip
        content={
          <Box className="filesList moreTooltip">
            {
              files.map((f: FileData, i: number) => {
                if (i >= NUM_OF_ROWS - 1) {
                  return <FileItem key={f.id} file={f} />;
                }
              })
            }
          </Box>
        }
      >
        <Box className="moreButton">
          <FormattedMessage id="general.more.text" />
        </Box>
      </Tooltip>
    </>
  );
};

const IngestionInputs: React.FC<{
  recordType: RecordType;
  fields: IRecordFieldInfo[];
  values: string[];
  selection: Selection;
  formik: EntityFormikHandlers;
}> = ({ recordType, fields, values, selection, formik }) => {
  return (
    <>
      {
        fields.map((field: IRecordFieldInfo, index: number) => {
          return (
            <Box className="ingestionField" key={field.fieldName}>
              <FieldLabelComponent
                value={field.label}
                isRequired={true}
                customClassName={`${field.fieldName as string}Spacer`}
              />
              <Box className="detailsFieldValue">
                {
                  values[index] === '' &&
                  <Typography tag="span" className="disabledText">
                    {'<'}
                    <FormattedMessage id="general.empty.text" />
                    {'>'}
                  </Typography>
                }
                {
                  index === DIRECTORY && values[index] !== '' &&
                  <Box dir="auto">{values[index]}</Box>
                }
                {
                  index === FILES && values[index] !== '' &&
                  <Box className="filesList">
                    {
                      selection.files.map((file: FileData, idx: number): JSX.Element | undefined => {
                        if (
                          idx < NUM_OF_ROWS - 1 ||
                          (selection.files.length === NUM_OF_ROWS && idx === NUM_OF_ROWS - 1)
                        ) {
                          return <FileItem key={file.id} file={file} />;
                        }
                        if (
                          selection.files.length > NUM_OF_ROWS &&
                          idx === NUM_OF_ROWS - 1
                        ) {
                          return <MoreItem key={file.id} files={selection.files} />;
                        }
                      })
                    }
                  </Box>
                }
              </Box>
              <Box className="hiddenField">
                <StringValuePresentorComponent
                  mode={Mode.NEW}
                  fieldInfo={field}
                  // @ts-ignore
                  value={formik.getFieldProps(field.fieldName).value as string}
                  formik={formik}
                />
              </Box>
            </Box>
          );
        })
      }
    </>
  );
};

export const IngestionFields: React.FC<IngestionFieldsProps> = observer(({
  recordType,
  fields,
  values,
  reloadFormMetadata,
  formik,
}) => {
  const store = useStore();
  const [isFilePickerDialogOpen, setFilePickerDialogOpen] = useState<boolean>(false);
  const [isImportDisabled, setIsImportDisabled] = useState(true);
  const [selection, setSelection] = useState<Selection>({
    files: [],
    folderChain: [],
    metadata: { recordModel: {} as LayerMetadataMixedUnion, error: null },
  });
  const [chosenMetadataFile, setChosenMetadataFile] = useState<string | null>(null); 
  const [chosenMetadataError, setChosenMetadataError] = useState<{response: { errors: { message: string }[] }} | null>(null); 

  const queryResolveMetadataAsModel = useQuery<{ resolveMetadataAsModel: LayerMetadataMixedUnion}>();

  useEffect(() => {
    if(chosenMetadataFile !== null) {
      queryResolveMetadataAsModel.setQuery(
        store.queryResolveMetadataAsModel(
          {
            data: {
              metadata: chosenMetadataFile,
              type: recordType
            }
          }
        )
      )
    }
  }, [chosenMetadataFile]);

  useEffect(() => {
    if (queryResolveMetadataAsModel.data) {
      const metadataAsModel = cloneDeep(queryResolveMetadataAsModel.data.resolveMetadataAsModel);

      if (reloadFormMetadata) {
        reloadFormMetadata(
          {
            directory: values.directory as string,
            fileNames: values.fileNames as string,
          },
          { recordModel: metadataAsModel} as MetadataFile
        );
      }
    }
  }, [queryResolveMetadataAsModel.data]);

  useEffect(() => {
    if (!isEmpty(queryResolveMetadataAsModel.error) || !isEmpty(chosenMetadataError)) {
      if (reloadFormMetadata) {
        reloadFormMetadata(
          {
            directory: values.directory as string,
            fileNames: values.fileNames as string,
          },
          { recordModel: {}, error: chosenMetadataError ?? (queryResolveMetadataAsModel.error as unknown)} as MetadataFile
        );
      }
    }
  }, [queryResolveMetadataAsModel.error, chosenMetadataError]);

  useEffect(() => {
    setIsImportDisabled(!selection.files.length || queryResolveMetadataAsModel.loading);
  }, [selection, queryResolveMetadataAsModel.loading]);

  const onFilesSelection = (selected: Selection): void => {
    if (selected.files.length) {
      setSelection({ ...selected });
    }
    if (reloadFormMetadata) {
      reloadFormMetadata(
        {
          directory: selected.files.length
            ? selected.folderChain
                .map((folder: FileData) => folder.name)
                .join('/')
            : '',
          fileNames: selected.files
            .map((file: FileData) => file.name)
            .join(','),
        },
        selected.metadata as MetadataFile
      );
    }
  };

  const checkIsValidMetadata = useCallback((record: Record<string, unknown>): boolean => {
    let recordKeys: string[] = [];
    switch(recordType) {
      case RecordType.RECORD_RASTER:
        recordKeys = LayerRasterRecordModelKeys as string[];
        break;
      case RecordType.RECORD_3D:
        recordKeys = Layer3DRecordModelKeys as string[];
        break;
      case RecordType.RECORD_DEM:
        recordKeys = LayerDemRecordModelKeys as string[];
        break;
      default:
        break;
    }

    return Object.keys(record).every(key => {
      return recordKeys.includes(key)
    });

  }, [recordType]);

  return (
    <>
      <Box className="header section">
        <Box className="ingestionFields">
          <IngestionInputs
            recordType={recordType}
            fields={fields}
            values={[values.directory, values.fileNames]}
            selection={selection}
            formik={formik as EntityFormikHandlers}
          />
        </Box>
        <Box className="ingestionButtonsContainer">
          <Box className="ingestionButton">
            <Button
              raised
              type="button"
              onClick={(): void => {
                setFilePickerDialogOpen(true);
              }}
            >
              <FormattedMessage id="general.choose-btn.text" />
            </Button>
          </Box>
          <Box className="uploadMetadataButton">
            <Button
              outlined
              type="button"
              disabled={isImportDisabled}
              onClick={(): void => {
                importJSONFileFromClient((e) => {
                  const resultFromFile = JSON.parse(
                    e.target?.result as string
                  ) as Record<string, unknown>;
                  setChosenMetadataFile(null);
                  setChosenMetadataError(null);

                  if (checkIsValidMetadata(resultFromFile)) {
                    setChosenMetadataFile(e.target?.result as string);
                  } else {
                    setChosenMetadataError({
                      response: {
                        errors: [
                          {
                            message: `Please choose metadata for product ${recordType}`,
                          },
                        ],
                      },
                    });
                  }
                });
              }}
            >
              {queryResolveMetadataAsModel.loading ? (
                <CircularProgress />
              ) : (
                <FormattedMessage id="ingestion.button.import-metadata" />
              )}
            </Button>
          </Box>
        </Box>
      </Box>
      {
        isFilePickerDialogOpen &&
        <FilePickerDialog
          recordType={recordType}
          isOpen={isFilePickerDialogOpen}
          onSetOpen={setFilePickerDialogOpen}
          onFilesSelection={onFilesSelection}
          selection={selection}
        />
      }
    </>
  );
});

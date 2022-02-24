/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useMemo } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useIntl } from 'react-intl';
import { TextField, Tooltip, IconButton } from '@map-colonies/react-core';
import { Box } from '@map-colonies/react-components';
import CONFIG from '../../../../common/config';
import { Mode } from '../../../../common/models/mode.enum';
import { convertExponentialToDecimal } from '../../../../common/helpers/number';
import useDebounceField from '../../../../common/hooks/debounce-field.hook';
import { ValidationConfigModelType, ValidationValueType } from '../../../models';
import { IRecordFieldInfo } from '../layer-details.field-info';
import { EntityFormikHandlers } from '../layer-datails-form';
import { FormInputInfoTooltipComponent } from './form.input.info.tooltip';

interface FormInputTextFieldProps {
  mode: Mode;
  fieldInfo: IRecordFieldInfo;
  value?: string;
  formik?: EntityFormikHandlers;
  type?: string;
}

export const FormInputTextFieldComponent: React.FC<FormInputTextFieldProps> = ({mode, fieldInfo, value, formik, type}) => {
  const intl = useIntl();
  const isCopyable = fieldInfo.isCopyable ?? false;
  const [innerValue, handleOnChange] = useDebounceField(formik as EntityFormikHandlers , value ?? '');

  const valueRenderer = useMemo(() => {
    const MAX_VALUE_LENGTH = CONFIG.NUMBER_OF_CHARACTERS_LIMIT;

    if (innerValue && innerValue.length > MAX_VALUE_LENGTH) {
      return (
        <Tooltip content={innerValue}>
          <Box className={`detailsFieldValue ${isCopyable ? 'detailFieldCopyable' : ''}`}>
            {innerValue}
          </Box>
        </Tooltip>
      );
    }
    return (
      <Box className={`detailsFieldValue ${isCopyable ? 'detailFieldCopyable' : ''}`}>
        {innerValue}
      </Box>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innerValue]);

  if (formik === undefined || mode === Mode.VIEW || (mode === Mode.EDIT && fieldInfo.isManuallyEditable !== true)) {
    return (
      <>
        {
          valueRenderer
        }
        {
          isCopyable &&
          <Box className="detailsFieldCopyIcon">
            <Tooltip content={intl.formatMessage({ id: 'action.copy.tooltip' })}>
              <CopyToClipboard text={value as string}>
                <IconButton className="mc-icon-Copy"/>
              </CopyToClipboard>
            </Tooltip>
          </Box>
        }
      </>
    );
  } else {
    let min: string;
    let max: string;
    let validationProps = {};
    let placeholder = '';
    fieldInfo.validation?.forEach((validationItem: ValidationConfigModelType) => {
      if (validationItem.valueType === ValidationValueType.VALUE) {
        if (validationItem.min !== null) {
          min = convertExponentialToDecimal(validationItem.min as string);
        }
        if (validationItem.max !== null) {
          max = convertExponentialToDecimal(validationItem.max as string);
        }
      }
    });

    const precisionAllowed = 'any';
    // @ts-ignore
    if (min && max) {
      validationProps = { min, max, step: precisionAllowed };
      placeholder = CONFIG.I18N.DEFAULT_LANGUAGE.toUpperCase() === 'HE' ? `${max} - ${min}` : `${min} - ${max}`;
    }
    return (
      <>
        <Box className="detailsFieldValue">
          <TextField
            value={innerValue}
            // @ts-ignore
            id={fieldInfo.fieldName as string}
            name={fieldInfo.fieldName as string}
            type={type}
            // eslint-disable-next-line
            onChange={handleOnChange}
            // eslint-disable-next-line
            onBlur={formik?.handleBlur}
            placeholder={placeholder}
            required={fieldInfo.isRequired === true}
            {...validationProps}
          />
          {
            !(fieldInfo.infoMsgCode?.length === 1 && fieldInfo.infoMsgCode[0].includes('required')) &&
            <FormInputInfoTooltipComponent fieldInfo={fieldInfo}/>
          }
        </Box>
      </>
    );
  }
};

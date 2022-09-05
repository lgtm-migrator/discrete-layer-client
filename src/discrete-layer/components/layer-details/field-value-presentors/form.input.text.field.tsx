/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useIntl } from 'react-intl';
import { isEmpty } from 'lodash';
import { TextField, Tooltip, IconButton } from '@map-colonies/react-core';
import { Box } from '@map-colonies/react-components';
import CONFIG from '../../../../common/config';
import { Mode } from '../../../../common/models/mode.enum';
import { convertExponentialToDecimal } from '../../../../common/helpers/number';
import useDebounceField from '../../../../common/hooks/debounce-field.hook';
import TooltippedValue from '../../../../common/components/form/tooltipped.value';
import { ValidationConfigModelType, ValidationValueType } from '../../../models';
import { UpdateRulesModelType } from '../../../models';
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

  if (formik === undefined || mode === Mode.VIEW || (mode === Mode.EDIT && fieldInfo.isManuallyEditable !== true)) {
    return (
      <>
        <TooltippedValue
          className={`detailsFieldValue ${isCopyable ? 'detailFieldCopyable' : ''}`}>
          {innerValue}
        </TooltippedValue>
        {!isEmpty(value) && isCopyable && (
          <Box className="detailsFieldCopyIcon">
            <Tooltip
              content={intl.formatMessage({ id: 'action.copy.tooltip' })}
            >
              <CopyToClipboard text={value as string}>
                <IconButton className="mc-icon-Copy" />
              </CopyToClipboard>
            </Tooltip>
          </Box>
        )}
      </>
    );
  } else {
    let min: string;
    let max: string;
    let validationProps = {};
    let placeholder = '';
    const textAreaProps = fieldInfo.rows ? { textarea: true, rows: fieldInfo.rows } : {};
    
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
            disabled={mode === Mode.UPDATE && ((fieldInfo.updateRules as UpdateRulesModelType | undefined | null)?.freeze) as boolean}
            placeholder={placeholder}
            required={fieldInfo.isRequired === true}
            {...validationProps}
            {...textAreaProps}
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

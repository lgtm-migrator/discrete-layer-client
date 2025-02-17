/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useContext, useState } from 'react';
import { useIntl } from 'react-intl';
import { get, isEmpty } from 'lodash';
import { MenuItem, Select, Typography } from '@map-colonies/react-core';
import { Box } from '@map-colonies/react-components';
import TooltippedValue from '../../../../common/components/form/tooltipped.value';
import CONFIG from '../../../../common/config';
import EnumsMapContext, { DEFAULT_ENUM_DESCRIPTOR, IEnumsMapType } from '../../../../common/contexts/enumsMap.context';
import useDebounceField from '../../../../common/hooks/debounce-field.hook';
import { IDictionary } from '../../../../common/models/dictionary';
import { Mode } from '../../../../common/models/mode.enum';
import { IRecordFieldInfo } from '../layer-details.field-info';
import { EntityFormikHandlers } from '../layer-datails-form';
import { FormInputInfoTooltipComponent } from './form.input.info.tooltip';

import './enum.value-presentor.css';

interface EnumValuePresentorProps {
  options: string[];
  mode: Mode;
  fieldInfo: IRecordFieldInfo;
  value?: string;
  formik?: EntityFormikHandlers;
  dictionary?: IDictionary;
}

export const EnumValuePresentorComponent: React.FC<EnumValuePresentorProps> = ({options, mode, fieldInfo, value, formik, dictionary}) => {
  const [innerValue] = useDebounceField(formik as EntityFormikHandlers , value ?? '');
  const [locale] = useState<string>(CONFIG.I18N.DEFAULT_LANGUAGE);
  const intl = useIntl();
  const { enumsMap } = useContext(EnumsMapContext);
  const enums = enumsMap as IEnumsMapType;

  const getDisplayValue = useCallback((): string => {
    if (isEmpty(innerValue)) {
      return innerValue;
    } else if (Array.isArray(innerValue)) {
      return innerValue.join(',');
    } else if (dictionary !== undefined) {
      return get(dictionary[innerValue], locale) as string;
    } else {
      return intl.formatMessage({ id: enums[innerValue].translationKey });
    }
  }, [innerValue]);

  if (formik === undefined || mode === Mode.VIEW || (mode === Mode.EDIT && fieldInfo.isManuallyEditable !== true)) {
    return (
      <TooltippedValue className="detailsFieldValue">
        {getDisplayValue()}
      </TooltippedValue>
    );
  } else {
    return (
      <>
        <Box className="detailsFieldValue selectBoxContainer">
          <Select
            value={innerValue}
            id={fieldInfo.fieldName as string}
            name={fieldInfo.fieldName as string}
            onChange={(e: React.FormEvent<HTMLSelectElement>): void => {
              formik.setFieldValue(fieldInfo.fieldName as string, e.currentTarget.value);
            }}
            onBlur={formik.handleBlur}
            outlined
            enhanced
            className="enumOptions"
          >
            {
              options.map(
                (item, index) => {
                  let icon: string;
                  let translation: string;
                  if (dictionary !== undefined) {
                    icon = dictionary[item].icon;
                    translation = get(dictionary[item], locale) as string;
                  } else {
                    const { translationKey, internal } = enums[item] ?? DEFAULT_ENUM_DESCRIPTOR;
                    icon = enums[item].icon;
                    translation = intl.formatMessage({ id: translationKey });
                    if (internal) {
                      return null;
                    }
                  }
                  return (
                    <MenuItem key={index} value={item}>
                      <Typography tag="span" className={icon}></Typography>
                      {translation}
                    </MenuItem>
                  );
                }
              )
            }
          </Select>
          {
            !(fieldInfo.infoMsgCode?.length === 1 && fieldInfo.infoMsgCode[0].includes('required')) &&
            <FormInputInfoTooltipComponent fieldInfo={fieldInfo}/>
          }
        </Box>
      </>
    );
  }
};

import React, { useMemo } from 'react';
import moment from 'moment';
import { get, isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { Typography } from '@map-colonies/react-core';
import { Box } from '@map-colonies/react-components';
import { Mode } from '../../../common/models/mode.enum';
import { FieldLabelComponent } from '../../../common/components/form/field-label';
import { LinkType } from '../../../common/models/link-type.enum';
import { 
  AutocompletionModelType,
  EntityDescriptorModelType,
  FieldCategory,
  LayerMetadataMixedUnion,
  LinkModelType
} from '../../models';
import { ILayerImage } from '../../models/layerImage';
import { links } from '../../models/links';
import { getLinkUrl, getLinkUrlWithToken } from '../helpers/layersUtils';
import { IRecordFieldInfo, IRecordCategoryFieldsInfo, FieldInfoName } from './layer-details.field-info';
import { StringValuePresentorComponent } from './field-value-presentors/string.value-presentor';
import { DateValuePresentorComponent } from './field-value-presentors/date.value-presentor';
import { UrlValuePresentorComponent } from './field-value-presentors/url.value-presentor';
import { LinksValuePresentorComponent } from './field-value-presentors/links.value-presentor';
import { UnknownValuePresentorComponent } from './field-value-presentors/unknown.value-presentor';
import { TypeValuePresentorComponent } from  './field-value-presentors/type.value-presentor';
import { NumberValuePresentorComponent } from './field-value-presentors/number.value-presentor';
import { EnumValuePresentorComponent } from './field-value-presentors/enum.value-presentor';
import { AutocompleteValuePresentorComponent } from './field-value-presentors/autocomplete.value-presentor';
import { JsonValuePresentorComponent } from './field-value-presentors/json.value-presentor';
import { getBasicType, getEntityDescriptors } from './utils';
import { EntityFormikHandlers } from './layer-datails-form';

import './layer-details.css';

interface LayersDetailsComponentProps {
  entityDescriptors: EntityDescriptorModelType[];
  mode: Mode;
  className?: string;
  isBrief?: boolean;
  layerRecord?: ILayerImage | null;
  formik?: EntityFormikHandlers;
}

export const getValuePresentor = (
  layerRecord: LayerMetadataMixedUnion | LinkModelType,
  fieldInfo: IRecordFieldInfo,
  fieldValue: unknown,
  mode: Mode,
  formik?: EntityFormikHandlers,
): JSX.Element => {

  const fieldName = fieldInfo.fieldName;
  const basicType = getBasicType(fieldName as FieldInfoName, layerRecord.__typename);
  const value = formik?.getFieldProps(fieldInfo.fieldName).value as unknown ?? fieldValue;
  
  switch (basicType) {
    case 'string':
    case 'identifier':
      return (!isEmpty(formik) && !isEmpty(fieldInfo.autocomplete) && (fieldInfo.autocomplete as AutocompletionModelType).type === 'DOMAIN') ? 
        // eslint-disable-next-line
        <AutocompleteValuePresentorComponent mode={mode} fieldInfo={fieldInfo} value={value as string} formik={formik}></AutocompleteValuePresentorComponent> :
        <StringValuePresentorComponent mode={mode} fieldInfo={fieldInfo} value={value as string} formik={formik}></StringValuePresentorComponent>
    case 'string[]': {
      return <StringValuePresentorComponent mode={mode} fieldInfo={fieldInfo} value={value as string} formik={formik}></StringValuePresentorComponent>
    }
    case 'json':
      return (
        <JsonValuePresentorComponent mode={mode} fieldInfo={fieldInfo} value={value as string} formik={formik}></JsonValuePresentorComponent>
      );
    case 'number':
      return (
        <NumberValuePresentorComponent mode={mode} fieldInfo={fieldInfo} value={value as string} formik={formik}></NumberValuePresentorComponent>
      );
    case 'links':
      return (
        <LinksValuePresentorComponent value={value as LinkModelType[]} fieldInfo={fieldInfo}></LinksValuePresentorComponent>
      );
    case 'url':
      return (
        <UrlValuePresentorComponent value={value as string} linkInfo={links[(layerRecord as LinkModelType).protocol as LinkType]}></UrlValuePresentorComponent>
      );
    case 'momentDateType':
      return (
        <DateValuePresentorComponent mode={mode} fieldInfo={fieldInfo} value={value as moment.Moment} formik={formik}></DateValuePresentorComponent>
      );
    case 'sensors':{
      return (
        <EnumValuePresentorComponent mode={mode} fieldInfo={fieldInfo} value={value as string} formik={formik}></EnumValuePresentorComponent>
      );
    }
    case 'DataType':
    case 'NoDataValue':
    case 'VerticalDatum':
    case 'Units':
    case 'UndulationModel':
      return (
        <EnumValuePresentorComponent mode={mode} fieldInfo={fieldInfo} value={value as string} formik={formik}></EnumValuePresentorComponent>
      );
    case 'RecordType':
    case 'ProductType':
      return (
        <TypeValuePresentorComponent value={value as string}></TypeValuePresentorComponent>
      );
    default:
      return (
        <UnknownValuePresentorComponent value={basicType}></UnknownValuePresentorComponent>
      );
  }
};

export const LayersDetailsComponent: React.FC<LayersDetailsComponentProps> = (props: LayersDetailsComponentProps) => {
  const { entityDescriptors, mode, isBrief, layerRecord, formik, className = '' } = props;

  const renderCategory = (category: IRecordCategoryFieldsInfo): JSX.Element =>
  (
    <Box
      key={category.category}
      className={`categoryFieldsParentContainer ${className}`}
    >
      <Typography
        use="headline6"
        tag="div"
        className="categoryFieldsTitle"
      >
        <FormattedMessage id={category.categoryTitle} />
      </Typography>
      <Box className="categoryFieldsContainer">
        {category.fields?.filter((fieldInfo)=>{
          // eslint-disable-next-line
          return (mode !== Mode.NEW && mode !== Mode.UPDATE && get(fieldInfo,'isCreationEssential') !== true) ||
                 ((mode === Mode.NEW || mode === Mode.UPDATE) && get(fieldInfo,'isAutoGenerated') !== true); 
        }).map(
          (fieldInfo: IRecordFieldInfo) => {
            return (
              <Box
                key={fieldInfo.fieldName as string}
                className={
                  fieldInfo.fullWidth === true
                    ? 'categoryFullWidthField'
                    : 'categoryField'
                }
              >
                <FieldLabelComponent
                  value={fieldInfo.label}
                  isRequired={
                    !!(fieldInfo.isRequired ?? false) &&
                    !(isBrief ?? false) &&
                    mode !== Mode.VIEW
                  }
                />
                {
                  getValuePresentor(
                    layerRecord as LayerMetadataMixedUnion,
                    fieldInfo,
                    get(layerRecord, fieldInfo.fieldName as string),
                    mode,
                    formik
                  )
                }
              </Box>
            )
          }
        )}
      </Box>
    </Box>
  );

  const fullInputs = useMemo(() => {
    const fullArray = layerRecord && getEntityDescriptors(layerRecord, entityDescriptors);
    return (
      fullArray?.map((category) => {
        return renderCategory(category);
      })
    );
  }, [layerRecord, formik]);

  const briefInputs = useMemo(() => {
    const briefArr = layerRecord &&
      getEntityDescriptors(layerRecord, entityDescriptors)
      .filter((item: unknown) => (item as IRecordCategoryFieldsInfo).category === FieldCategory.MAIN);
    return (
      briefArr?.map((category) => {
        return renderCategory(category);
      })
    );
  }, [layerRecord, formik]);

  return (
    <>
      {!(isBrief ?? false) ? fullInputs : briefInputs}
      {
        layerRecord?.links &&
        getLinkUrl(layerRecord.links, LinkType.THUMBNAIL_L) !== undefined &&
        mode !== Mode.UPDATE &&
        <img
          className="detailsThumbnail"
          src={getLinkUrlWithToken(layerRecord.links, LinkType.THUMBNAIL_L)}
        />
      }
      {
        !layerRecord && (
        <Box>
          <Typography use="headline2" tag="div" className="noSelection">
            <FormattedMessage id="details-panel.no-selection" />
          </Typography>
        </Box>
      )}
    </>
  );
};

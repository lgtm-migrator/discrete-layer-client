/* eslint-disable @typescript-eslint/ban-ts-comment */
import { get, isEmpty, omit } from 'lodash';
import { $enum } from 'ts-enum-util';
import { ValidationTypeName } from '../../../common/models/validation.enum';
import {
  BestRecordModel,
  CategoryConfigModelType,
  EntityDescriptorModelType,
  FieldConfigModelType,
  Layer3DRecordModel,
  LayerDemRecordModel,
  LayerMetadataMixedUnion,
  LayerRasterRecordModel,
  LinkModel,
  LinkModelType,
  ProductType,
  RecordType,
  ValidationConfigModelType
} from '../../models';
import { ILayerImage } from '../../models/layerImage';
import { FieldInfoName, IRecordCategoryFieldsInfo } from './layer-details.field-info';
import {
  BestRecordModelArray,
  LayerRasterRecordModelArray,
  Layer3DRecordModelArray,
  LayerDemRecordModelArray,
  VectorBestRecordModelArray
} from './entity-types-keys';

export const getEntityDescriptors = (layerRecord: LayerMetadataMixedUnion, entityDescriptors: EntityDescriptorModelType[]): IRecordCategoryFieldsInfo[] => {
  let entityDesc;
  switch (layerRecord.__typename) {
    case 'LayerDemRecord':
      entityDesc = entityDescriptors.find(descriptor => descriptor.type === 'PycswDemCatalogRecord')
      break;
      case 'VectorBestRecord':
        entityDesc = entityDescriptors.find(descriptor => descriptor.type === 'PycswVectorBestCatalogRecord')
      break;
    case 'Layer3DRecord':
      entityDesc = entityDescriptors.find(descriptor => descriptor.type === 'Pycsw3DCatalogRecord')
      break;
    case 'BestRecord':
      entityDesc = entityDescriptors.find(descriptor => descriptor.type === 'PycswBestCatalogRecord')
      break;
    default:
      entityDesc = entityDescriptors.find(descriptor => descriptor.type === 'PycswLayerCatalogRecord')
      break;
  }
  return (get(entityDesc, 'categories') ?? []) as IRecordCategoryFieldsInfo[];
};

export const getFlatEntityDescriptors = (layerRecord: LayerMetadataMixedUnion, entityDescriptors: EntityDescriptorModelType[]): FieldConfigModelType[] => {
  const descriptors = getEntityDescriptors(layerRecord, entityDescriptors);
  const flat: FieldConfigModelType[] = [];
  descriptors.forEach((category: CategoryConfigModelType) => {
    category.fields?.forEach((field: FieldConfigModelType) => {
      flat.push(field);
    });
  });
  return flat;
};

export const getBasicType = (fieldName: FieldInfoName, typename: string): string => {
  let recordModel;
  switch (typename) {
    case 'LayerDemRecord':
      recordModel = LayerDemRecordModel;
      break;
    case 'Layer3DRecord':
      recordModel = Layer3DRecordModel;
      break;
    case 'BestRecord':
      recordModel = BestRecordModel;
      break;
    case 'Link':
      recordModel = LinkModel;
      break;
    default:
      recordModel = LayerRasterRecordModel;
      break;
  }
  const fieldNameStr = fieldName as string;
  const typeString = get(recordModel,`properties.${fieldNameStr}.name`) as string;
  if (typeString) {
    if (fieldNameStr.toLowerCase().includes('url')) {
      return 'url';
    }
    else if (fieldNameStr.toLowerCase().includes('links')) {
      return 'links';
    }
    else if (fieldNameStr.toLowerCase().includes('sensors')) {
      return 'sensors';
    }
    else if (fieldNameStr.toLowerCase().includes('footprint') || fieldNameStr.toLowerCase().includes('layerpolygonparts')) {
      return 'json';
    }
    else {
      return typeString.replaceAll('(','').replaceAll(')','').replaceAll(' | ','').replaceAll('null','').replaceAll('undefined','');
    }
  }
  return 'string';
};

export const getValidationType = (validation: ValidationConfigModelType): ValidationTypeName | undefined => {
  const values = $enum(ValidationTypeName).getValues();
  // @ts-ignore
  const filteredArray = values.filter(value => validation[value] !== null && validation[value] !== undefined);
  return ValidationTypeName[filteredArray[0]];
};

export const getInfoMsgValidationType = (msgCode: string): ValidationTypeName => {
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ValidationTypeName[msgCode.substring(msgCode.lastIndexOf('.') + 1)];
};

export const cleanUpEntity = (
  data: Record<string,unknown>,
  entityKeys: BestRecordModelArray | LayerRasterRecordModelArray | Layer3DRecordModelArray | LayerDemRecordModelArray | VectorBestRecordModelArray
): Record<string,unknown> => {
  const keysNotInModel = Object.keys(data).filter(key => {
    // @ts-ignore
    return !entityKeys.includes(key);
  });
  return omit(data, keysNotInModel);
};

const checkIsBest = (entity: ILayerImage): boolean => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { ORTHOPHOTO_BEST, RASTER_AID_BEST, RASTER_MAP_BEST, RASTER_VECTOR_BEST, VECTOR_BEST } = ProductType;

  const bestProductTypes: ProductType[] = [ORTHOPHOTO_BEST, RASTER_AID_BEST, RASTER_MAP_BEST, RASTER_VECTOR_BEST, VECTOR_BEST];

  return bestProductTypes.includes(entity.productType as ProductType);
};

export const isDiscrete = (entity: ILayerImage): boolean => {
  return !checkIsBest(entity)
};

export const isBest = (entity: ILayerImage): boolean => {
  return checkIsBest(entity)
};

export const isMultiSelection = (recordType: RecordType): boolean => {
  return recordType !== RecordType.RECORD_3D;
};

const removeObjFields = (
  obj: Record<string, unknown>,
  cbFn: (curVal: unknown) => boolean
): Record<string, unknown> => {
  // if cbFn returns true it means the field *should be omitted*.
  return Object.fromEntries(
    Object.entries(obj).filter(([_, val]) => {
      const shouldOmitField = cbFn(val);

      return !shouldOmitField;
    })
  );
};

export const removeEmptyObjFields = (
  obj: Record<string, unknown>
): Record<string, unknown> => {
  return removeObjFields(obj, (val) => typeof val === 'object' && isEmpty(val));
};

export const transformFormFieldsToEntity = (
  fields: Record<string, unknown>,
  layerRecord: LayerMetadataMixedUnion | LinkModelType
): Record<string, unknown> => {
  const transformedFields = {...fields};

  for (const fieldName of Object.keys(fields)) {
    const basicType = getBasicType(fieldName as FieldInfoName, layerRecord.__typename);

    if(basicType === 'string[]') {
      /* eslint-disable */
      // @ts-ignore
      transformedFields[fieldName] = transformedFields[fieldName]?.split(',')?.map(val => (val as string).trim());
      /* eslint-enable */
    }
  }

  return transformedFields;
}
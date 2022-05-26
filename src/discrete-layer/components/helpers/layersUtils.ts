import { Rectangle, Resource } from 'cesium';
import { get } from 'lodash';
import bbox from '@turf/bbox';
import { CesiumGeographicTilingScheme, RCesiumWMTSLayerOptions } from '@map-colonies/react-components';
import CONFIG from '../../../common/config';
import { CapabilityModelType, LayerRasterRecordModelType, LinkModelType } from '../../models';
import { ILayerImage } from '../../models/layerImage';

export const generateLayerRectangle = (
  layer: LayerRasterRecordModelType
): Rectangle => {
  return Rectangle.fromDegrees(...bbox(layer.footprint));
};

export const findLayerLink = (layer: ILayerImage): LinkModelType | undefined => {
  return layer.links?.find((link: LinkModelType) => ['WMTS_tile', 'WMTS_LAYER'].includes(link.protocol as string)) as LinkModelType | undefined;
};

export const getLayerLink = (layer: ILayerImage): LinkModelType => {
  let layerLink = findLayerLink(layer);
  if (layerLink === undefined) {
    layerLink = get(layer, 'links[0]') as LinkModelType;
  }
  return layerLink;
};

export const getTokenResource = (url: string): Resource => {
  const tokenProps: Record<string, unknown> = { url };
  
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const {INJECTION_TYPE, ATTRIBUTE_NAME, TOKEN_VALUE} = CONFIG.ACCESS_TOKEN as 
  // eslint-disable-next-line @typescript-eslint/naming-convention
  {INJECTION_TYPE: string, ATTRIBUTE_NAME: string, TOKEN_VALUE: string};
  
  if (INJECTION_TYPE.toLowerCase() === 'header') {
    tokenProps.headers = {
      [ATTRIBUTE_NAME]: TOKEN_VALUE
    } as Record<string, unknown>;
  } else if (INJECTION_TYPE.toLowerCase() === 'queryparam') {
    tokenProps.queryParameters = {
      [ATTRIBUTE_NAME]: TOKEN_VALUE
    } as Record<string, unknown>;
  }

  return new Resource({...tokenProps as unknown as Resource});
};

export const getWMTSOptions = (layer: LayerRasterRecordModelType, url: string, capability: CapabilityModelType | undefined): RCesiumWMTSLayerOptions => {
  let style = 'default';
  let format = 'image/jpeg';
  let tileMatrixSetID = 'newGrids';
  if (capability) {
    style = capability.style as string;
    format = (capability.format as string[])[0];
    tileMatrixSetID = (capability.tileMatrixSet as string[])[0];
  }
  return {
    url: getTokenResource(url),
    layer: `${layer.productId as string}-${layer.productVersion as string}`,
    style,
    format,
    tileMatrixSetID,
    tilingScheme: new CesiumGeographicTilingScheme()
  };
};
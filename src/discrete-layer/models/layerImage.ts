import { Geometry } from 'geojson';
import { types, Instance } from 'mobx-state-tree';

export const layerImage = types.model({
  id: types.string,
  name: types.string,
  description: types.string,
  geojson: types.maybe(types.frozen<Geometry>()),
  referenceSystem: types.string,
  imagingTimeStart: types.Date,
  imagingTimeEnd: types.Date,
  creationDate: types.Date,
  type: types.string,
  source: types.string,
  category: types.string,
  thumbnail: types.string,
  properties: types.maybe(types.frozen<{
    protocol: 'WMTS_LAYER' | 'WMS_LAYER' | 'XYZ_LAYER' | 'OSM_LAYER',
    url: string,
    meta?: string,
  }>()),
  selected: types.maybe(types.boolean),
});

export interface ILayerImage extends Instance<typeof layerImage> {}

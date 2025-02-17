/* eslint-disable @typescript-eslint/naming-convention */
import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import EnumsMapContext, { IEnumsMapType } from '../../../../common/contexts/enumsMap.context';
import {
  DataType,
  NoDataValue,
  ProductType,
  RecordStatus,
  RecordType,
  UndulationModel,
  Units,
  VerticalDatum
} from '../../../models';
import { useQuery, useStore } from '../../../models/RootStore';

export const MCEnumsFetcher: React.FC = observer(() => {
  const store = useStore();
  const mcEnumsQuery = useQuery((store) => store.queryGetMcEnums());
  const { setEnumsMap } = useContext(EnumsMapContext);
  const enumUnion = {
    DataType,
    NoDataValue,
    VerticalDatum,
    Units,
    UndulationModel,
    ProductType,
    RecordStatus,
    RecordType
  };

  useEffect(() => {
    if (!mcEnumsQuery.loading && mcEnumsQuery.data) {
      const enums = { ...(mcEnumsQuery.data.getMcEnums).enums as IEnumsMapType };

      Object.values(enumUnion).forEach((enumValues: Record<string, string>): void => {
        Object.keys(enumValues).forEach(item => {
          enums[item] = { ...enums[item], translationKey: `${enums[item].enumName}.${item.toLowerCase()}` };
        });
      });
      
      const {
        ORTHOPHOTO,
        ORTHOPHOTO_HISTORY,
        ORTHOPHOTO_BEST,
        RASTER_MAP,
        RASTER_MAP_BEST,
        RASTER_AID,
        RASTER_AID_BEST,
        RASTER_VECTOR,
        RASTER_VECTOR_BEST,
        VECTOR_BEST,
        DTM,
        DSM,
        QUANTIZED_MESH_DTM,
        QUANTIZED_MESH_DSM,
        QUANTIZED_MESH_DTM_BEST,
        QUANTIZED_MESH_DSM_BEST,
        PHOTO_REALISTIC_3D,
        POINT_CLOUD,
      } = ProductType;

      enums['LayerRasterRecord'] = { enumName: '', realValue: '', icon: 'mc-icon-Map-Orthophoto', translationKey: 'record-type.record_raster.label', parent: '', internal: false, properties: {} };
      enums['Layer3DRecord'] = { enumName: '', realValue: '', icon: 'mc-icon-Map-3D', translationKey: 'record-type.record_3d.label', parent: '', internal: false, properties: {} };
      enums['LayerDemRecord'] = { enumName: '', realValue: '', icon: 'mc-icon-Map-Terrain', translationKey: 'record-type.record_dem.label', parent: '', internal: false, properties: {} };
      enums['QuantizedMeshBestRecord'] = { enumName: '', realValue: '', icon: 'mc-icon-Map-Terrain', translationKey: 'record-type.record_quantized_mesh.label', parent: '', internal: false, properties: {} };
      enums[ORTHOPHOTO] = { ...enums[ORTHOPHOTO], icon: 'mc-icon-Map-Orthophoto', parent: 'LayerRasterRecord' };
      enums[ORTHOPHOTO_HISTORY] = { ...enums[ORTHOPHOTO_HISTORY], icon: 'mc-icon-Map-Orthophoto', parent: 'LayerRasterRecord', internal: true };
      enums[ORTHOPHOTO_BEST] = { ...enums[ORTHOPHOTO_BEST], icon: 'mc-icon-Map-Best-Orthophoto', parent: 'LayerRasterRecord' };
      enums[RASTER_MAP] = { ...enums[RASTER_MAP], icon: 'mc-icon-Map-Raster', parent: 'LayerRasterRecord' };
      enums[RASTER_MAP_BEST] = { ...enums[RASTER_MAP_BEST], icon: 'mc-icon-Map-Best-Raster', parent: 'LayerRasterRecord' };
      enums[RASTER_AID] = { ...enums[RASTER_AID], icon: 'mc-icon-Map-Raster', parent: 'LayerRasterRecord' };
      enums[RASTER_AID_BEST] = { ...enums[RASTER_AID_BEST], icon: 'mc-icon-Map-Best-Raster', parent: 'LayerRasterRecord' };
      enums[RASTER_VECTOR] = { ...enums[RASTER_VECTOR], icon: 'mc-icon-Map-Vector', parent: 'LayerRasterRecord' };
      enums[RASTER_VECTOR_BEST] = { ...enums[RASTER_VECTOR_BEST], icon: 'mc-icon-Map-Vector', parent: 'LayerRasterRecord' };
      enums[VECTOR_BEST] = { ...enums[VECTOR_BEST], icon: 'mc-icon-Map-Vector', parent: 'LayerRasterRecord' };
      enums[DTM] = { ...enums[DTM], icon: 'mc-icon-Map-Terrain', parent: 'LayerDemRecord' };
      enums[DSM] = { ...enums[DSM], icon: 'mc-icon-Map-Terrain', parent: 'LayerDemRecord' };
      enums[QUANTIZED_MESH_DTM] = { ...enums[QUANTIZED_MESH_DTM], icon: 'mc-icon-Map-Terrain', parent: 'LayerDemRecord' };
      enums[QUANTIZED_MESH_DSM] = { ...enums[QUANTIZED_MESH_DSM], icon: 'mc-icon-Map-Terrain', parent: 'LayerDemRecord' };
      enums[QUANTIZED_MESH_DTM_BEST] = { ...enums[QUANTIZED_MESH_DTM_BEST], icon: 'mc-icon-Map-Terrain', parent: 'QuantizedMeshBestRecord' };
      enums[QUANTIZED_MESH_DSM_BEST] = { ...enums[QUANTIZED_MESH_DSM_BEST], icon: 'mc-icon-Map-Terrain', parent: 'QuantizedMeshBestRecord' };
      enums[PHOTO_REALISTIC_3D] = { ...enums[PHOTO_REALISTIC_3D], icon: 'mc-icon-Map-3D', parent: 'Layer3DRecord' };
      enums[POINT_CLOUD] = { ...enums[POINT_CLOUD], icon: 'mc-icon-Map-3D', parent: 'Layer3DRecord' };

      const { UNPUBLISHED } = RecordStatus;

      enums[UNPUBLISHED] = { ...enums[UNPUBLISHED], internal: true };

      setEnumsMap(enums);
    }
  }, [mcEnumsQuery.data, mcEnumsQuery.loading, store.discreteLayersStore]);
  
  return null;
});

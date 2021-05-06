/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { QueryBuilder } from "mst-gql"
import { Layer3DRecordModelType } from "./Layer3DRecordModel"
import { Layer3DRecordModelSelector, layer3DRecordModelPrimitives } from "./Layer3DRecordModel.base"
import { LayerRasterRecordModelType } from "./LayerRasterRecordModel"
import { LayerRasterRecordModelSelector, layerRasterRecordModelPrimitives } from "./LayerRasterRecordModel.base"

export type LayerMetadataMixedUnion = LayerRasterRecordModelType | Layer3DRecordModelType

export class LayerMetadataMixedModelSelector extends QueryBuilder {
  layerRasterRecord(builder?: string | LayerRasterRecordModelSelector | ((selector: LayerRasterRecordModelSelector) => LayerRasterRecordModelSelector)) { return this.__inlineFragment(`LayerRasterRecord`, LayerRasterRecordModelSelector, builder) }
  layer3DRecord(builder?: string | Layer3DRecordModelSelector | ((selector: Layer3DRecordModelSelector) => Layer3DRecordModelSelector)) { return this.__inlineFragment(`Layer3DRecord`, Layer3DRecordModelSelector, builder) }
}
export function selectFromLayerMetadataMixed() {
  return new LayerMetadataMixedModelSelector()
}

// provides all primitive fields of union member types combined together
export const layerMetadataMixedModelPrimitives = selectFromLayerMetadataMixed().layerRasterRecord(layerRasterRecordModelPrimitives).layer3DRecord(layer3DRecordModelPrimitives)
/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { IObservableArray } from "mobx"
import { types } from "mobx-state-tree"
import { MSTGQLRef, QueryBuilder, withTypedRefs } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { FieldConfigModel, FieldConfigModelType } from "./FieldConfigModel"
import { RootStoreType } from "./index"


/* The TypeScript type that explicits the refs to other models in order to prevent a circular refs issue */
type Refs = {
  subFields: IObservableArray<FieldConfigModelType>;
}

/**
 * FieldConfigBase
 * auto generated base class for the model FieldConfigModel.
 */
export const FieldConfigModelBase = withTypedRefs<Refs>()(ModelBase
  .named('FieldConfig')
  .props({
    __typename: types.optional(types.literal("FieldConfig"), "FieldConfig"),
    fieldName: types.union(types.undefined, types.string),
    label: types.union(types.undefined, types.string),
    fullWidth: types.union(types.undefined, types.null, types.boolean),
    isManuallyEditable: types.union(types.undefined, types.null, types.boolean),
    isFilterable: types.union(types.undefined, types.null, types.boolean),
    isSortable: types.union(types.undefined, types.null, types.boolean),
    subFields: types.union(types.undefined, types.null, types.array(types.late((): any => FieldConfigModel))),
    // subFields: types.union(types.undefined, types.null, types.array(MSTGQLRef(types.late((): any => FieldConfigModel)))),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  })))

export class FieldConfigModelSelector extends QueryBuilder {
  get fieldName() { return this.__attr(`fieldName`) }
  get label() { return this.__attr(`label`) }
  get fullWidth() { return this.__attr(`fullWidth`) }
  get isManuallyEditable() { return this.__attr(`isManuallyEditable`) }
  get isFilterable() { return this.__attr(`isFilterable`) }
  get isSortable() { return this.__attr(`isSortable`) }
  subFields(builder?: string | FieldConfigModelSelector | ((selector: FieldConfigModelSelector) => FieldConfigModelSelector)) { return this.__child(`subFields`, FieldConfigModelSelector, builder) }
}
export function selectFromFieldConfig() {
  return new FieldConfigModelSelector()
}

export const fieldConfigModelPrimitives = selectFromFieldConfig().fieldName.label.fullWidth.isManuallyEditable.isFilterable.isSortable

/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { IObservableArray } from "mobx"
import { types } from "mobx-state-tree"
import { MSTGQLRef, QueryBuilder, withTypedRefs } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { AutocompletionModel, AutocompletionModelType } from "./AutocompletionModel"
import { AutocompletionModelSelector, autocompletionModelPrimitives } from "./AutocompletionModel.base"
import { DateGranularityTypeEnumType } from "./DateGranularityTypeEnum"
import { EnumAspectsModel, EnumAspectsModelType } from "./EnumAspectsModel"
import { EnumAspectsModelSelector } from "./EnumAspectsModel.base"
import { FieldConfigModel, FieldConfigModelType } from "./FieldConfigModel"
import { UpdateRulesModel, UpdateRulesModelType } from "./UpdateRulesModel"
import { UpdateRulesModelSelector } from "./UpdateRulesModel.base"
import { ValidationConfigModel, ValidationConfigModelType } from "./ValidationConfigModel"
import { ValidationConfigModelSelector, validationConfigModelPrimitives } from "./ValidationConfigModel.base"
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
    isRequired: types.union(types.undefined, types.null, types.boolean),
    isAutoGenerated: types.union(types.undefined, types.null, types.boolean),
    isLifecycleEnvolved: types.union(types.undefined, types.null, types.boolean),
    isCopyable: types.union(types.undefined, types.null, types.boolean),
    rows: types.union(types.undefined, types.null, types.number),
    autocomplete: types.union(types.undefined, types.null, types.late((): any => AutocompletionModel)),
    infoMsgCode: types.union(types.undefined, types.null, types.array(types.string)),
    validation: types.union(types.undefined, types.null, types.array(types.late((): any => ValidationConfigModel))),
    enumValues: types.union(types.undefined, types.null, types.late((): any => EnumAspectsModel)),
    //subFields: types.union(types.undefined, types.null, types.array(MSTGQLRef(types.late((): any => FieldConfigModel)))),
    subFields: types.union(types.undefined, types.null, types.array(types.late((): any => FieldConfigModel))),
    default: types.union(types.undefined, types.null, types.string),
    dateGranularity: types.union(types.undefined, types.null, DateGranularityTypeEnumType),
    updateRules: types.union(types.undefined, types.null, types.late((): any => UpdateRulesModel)),
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
  get isRequired() { return this.__attr(`isRequired`) }
  get isAutoGenerated() { return this.__attr(`isAutoGenerated`) }
  get isLifecycleEnvolved() { return this.__attr(`isLifecycleEnvolved`) }
  get isCopyable() { return this.__attr(`isCopyable`) }
  get rows() { return this.__attr(`rows`) }
  get infoMsgCode() { return this.__attr(`infoMsgCode`) }
  get default() { return this.__attr(`default`) }
  get dateGranularity() { return this.__attr(`dateGranularity`) }
  autocomplete(builder?: string | AutocompletionModelSelector | ((selector: AutocompletionModelSelector) => AutocompletionModelSelector)) { return this.__child(`autocomplete`, AutocompletionModelSelector, builder) }
  validation(builder?: string | ValidationConfigModelSelector | ((selector: ValidationConfigModelSelector) => ValidationConfigModelSelector)) { return this.__child(`validation`, ValidationConfigModelSelector, builder) }
  enumValues(builder?: string | EnumAspectsModelSelector | ((selector: EnumAspectsModelSelector) => EnumAspectsModelSelector)) { return this.__child(`enumValues`, EnumAspectsModelSelector, builder) }
  subFields(builder?: string | FieldConfigModelSelector | ((selector: FieldConfigModelSelector) => FieldConfigModelSelector)) { return this.__child(`subFields`, FieldConfigModelSelector, builder) }
  updateRules(builder?: string | UpdateRulesModelSelector | ((selector: UpdateRulesModelSelector) => UpdateRulesModelSelector)) { return this.__child(`updateRules`, UpdateRulesModelSelector, builder) }
}
export function selectFromFieldConfig() {
  return new FieldConfigModelSelector()
}

export const fieldConfigModelPrimitives = selectFromFieldConfig().fieldName.label.fullWidth.isManuallyEditable.isFilterable.isSortable.isRequired.isAutoGenerated.isLifecycleEnvolved.isCopyable.rows.infoMsgCode.default.dateGranularity.autocomplete(autocompletionModelPrimitives).validation(validationConfigModelPrimitives)

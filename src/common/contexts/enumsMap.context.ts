import { createContext } from 'react';

export interface IEnumDescriptor {
  enumName: string,
  realValue: string,
  icon: string,
  translationKey: string,
  parent: string,
  properties: Record<string, unknown>
}

export interface IEnumsMapType {
  [unionEnumKey: string]: IEnumDescriptor;
}
interface IEnumsMapContext {
  enumsMap: IEnumsMapType | null;
  setEnumsMap: (enums: IEnumsMapType) => void
}

export const DEFAULT_ENUM_DESCRIPTOR: IEnumDescriptor = {
    enumName: '##UNKNOWN_ENUM_TYPE##',
    icon: 'mc-icon-Close glow-missing-icon',
    parent: '',
    properties: {},
    realValue: '##MISSING_VALUE##',
    translationKey: ''
}


// eslint-disable-next-line @typescript-eslint/naming-convention
const EnumsMapContext = createContext<IEnumsMapContext>({
  enumsMap: null,
  setEnumsMap: (enums) => {return},
});

export default EnumsMapContext;

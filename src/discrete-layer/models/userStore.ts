/* eslint-disable @typescript-eslint/naming-convention */
import { types, getParent } from 'mobx-state-tree';
import { ResponseState } from '../../common/models/response-state.enum';
import CONFIG from '../../common/config';
import { ModelBase } from './ModelBase';
import { IRootStore, RootStoreType } from './RootStore';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum UserAction {
  ACTION_SYSTEMJOBS = 'action_systemJobs',
  ACTION_SYSTEM_CORE_INFO = 'action_systemCoreInfo',

  ENTITY_ACTION_LAYERRASTERRECORD_CREATE = 'entity_action.LayerRasterRecord.create',
  ENTITY_ACTION_LAYER3DRECORD_CREATE = 'entity_action.Layer3DRecord.create',
  ENTITY_ACTION_LAYERDEMRECORD_CREATE = 'entity_action.LayerDemRecord.create',
  ENTITY_ACTION_BESTRECORD_CREATE = 'entity_action.BestRecord.create',
  ENTITY_ACTION_LAYERRASTERRECORD_EDIT = 'entity_action.LayerRasterRecord.edit',
  ENTITY_ACTION_LAYER3DRECORD_EDIT = 'entity_action.Layer3DRecord.edit',
  ENTITY_ACTION_LAYERDEMRECORD_EDIT = 'entity_action.LayerDemRecord.edit',
  ENTITY_ACTION_BESTRECORD_EDIT = 'entity_action.BestRecord.edit',
  ENTITY_ACTION_VECTORBESTRECORD_EDIT = 'entity_action.VectorBestRecord.edit',
  ENTITY_ACTION_QUANTIZEDMESHBESTRECORD_EDIT = 'entity_action.QuantizedMeshBestRecord.edit',
  ENTITY_ACTION_LAYERRASTERRECORD_UPDATE = 'entity_action.LayerRasterRecord.update',
  ENTITY_ACTION_LAYERRASTERRECORD_DELETE = 'entity_action.LayerRasterRecord.delete',
  ENTITY_ACTION_LAYER3DRECORD_DELETE = 'entity_action.Layer3DRecord.delete',
  ENTITY_ACTION_LAYERDEMRECORD_DELETE = 'entity_action.LayerDemRecord.delete',
  ENTITY_ACTION_BESTRECORD_DELETE = 'entity_action.BestRecord.delete',
  ENTITY_ACTION_LAYERRASTERRECORD_MOVETOTOP = 'entity_action.LayerRasterRecord.moveToTop',
  ENTITY_ACTION_LAYERRASTERRECORD_MOVEUP = 'entity_action.LayerRasterRecord.moveUp',
  ENTITY_ACTION_LAYERRASTERRECORD_MOVEDOWN = 'entity_action.LayerRasterRecord.moveDown',
  ENTITY_ACTION_LAYERRASTERRECORD_MOVETOBOTTOM = 'entity_action.LayerRasterRecord.moveToBottom',


  /***  FOR FUTURE USE, ENTITY FIELD PERMISSION PATTERN EXAMPLE ***/
  // ENTITY_FIELD_ACTION_BESTRECORD_PRODUCTNAME_VIEW = 'entity_action.BestRecord.productName.view',
}

type UserActionKeys = { [K in UserAction]?: boolean; }

interface IUser {
  userName: string;
  firstName?: string;
  secondName?: string;
  eMail?: string;
  role: UserRole;
}

interface IRole {
  role: UserRole;
  permissions: UserActionKeys;
}

const ROLES: IRole[] = [
  {
    role: UserRole.ADMIN,
    permissions: {
      [UserAction.ACTION_SYSTEMJOBS]: true,
      [UserAction.ACTION_SYSTEM_CORE_INFO]: true,
      [UserAction.ENTITY_ACTION_LAYERRASTERRECORD_CREATE]: true,
      [UserAction.ENTITY_ACTION_LAYER3DRECORD_CREATE]: true,
      [UserAction.ENTITY_ACTION_LAYERDEMRECORD_CREATE]: false,
      [UserAction.ENTITY_ACTION_BESTRECORD_CREATE]: true,
      [UserAction.ENTITY_ACTION_LAYERRASTERRECORD_EDIT]: true,
      [UserAction.ENTITY_ACTION_LAYER3DRECORD_EDIT]: true,
      [UserAction.ENTITY_ACTION_LAYERDEMRECORD_EDIT]: false,
      [UserAction.ENTITY_ACTION_BESTRECORD_EDIT]: true,
      [UserAction.ENTITY_ACTION_VECTORBESTRECORD_EDIT]: true,
      [UserAction.ENTITY_ACTION_QUANTIZEDMESHBESTRECORD_EDIT]: true,
      [UserAction.ENTITY_ACTION_LAYERRASTERRECORD_UPDATE]: false,
      [UserAction.ENTITY_ACTION_LAYERRASTERRECORD_DELETE]: true,
      [UserAction.ENTITY_ACTION_LAYER3DRECORD_DELETE]: true,
      [UserAction.ENTITY_ACTION_LAYERDEMRECORD_DELETE]: true,
      [UserAction.ENTITY_ACTION_BESTRECORD_DELETE]: true,
      [UserAction.ENTITY_ACTION_LAYERRASTERRECORD_MOVETOTOP]: true,
      [UserAction.ENTITY_ACTION_LAYERRASTERRECORD_MOVEUP]: true,
      [UserAction.ENTITY_ACTION_LAYERRASTERRECORD_MOVEDOWN]: true,
      [UserAction.ENTITY_ACTION_LAYERRASTERRECORD_MOVETOBOTTOM]: true,
    },
  },
  {
    role: UserRole.USER,
    permissions: {
      [UserAction.ACTION_SYSTEMJOBS]: false,
      [UserAction.ACTION_SYSTEM_CORE_INFO]: false,
      [UserAction.ENTITY_ACTION_LAYERRASTERRECORD_CREATE]: false,
      [UserAction.ENTITY_ACTION_LAYER3DRECORD_CREATE]: false,
      [UserAction.ENTITY_ACTION_LAYERDEMRECORD_CREATE]: false,
      [UserAction.ENTITY_ACTION_BESTRECORD_CREATE]: false,
      [UserAction.ENTITY_ACTION_LAYERRASTERRECORD_EDIT]: false,
      [UserAction.ENTITY_ACTION_LAYER3DRECORD_EDIT]: false,
      [UserAction.ENTITY_ACTION_LAYERDEMRECORD_EDIT]: false,
      [UserAction.ENTITY_ACTION_BESTRECORD_EDIT]: false,
      [UserAction.ENTITY_ACTION_VECTORBESTRECORD_EDIT]: false,
      [UserAction.ENTITY_ACTION_QUANTIZEDMESHBESTRECORD_EDIT]: false,
      [UserAction.ENTITY_ACTION_LAYERRASTERRECORD_UPDATE]: false,
      [UserAction.ENTITY_ACTION_LAYERRASTERRECORD_DELETE]: false,
      [UserAction.ENTITY_ACTION_LAYER3DRECORD_DELETE]: false,
      [UserAction.ENTITY_ACTION_LAYERDEMRECORD_DELETE]: false,
      [UserAction.ENTITY_ACTION_BESTRECORD_DELETE]: false,
      [UserAction.ENTITY_ACTION_LAYERRASTERRECORD_MOVETOTOP]: false,
      [UserAction.ENTITY_ACTION_LAYERRASTERRECORD_MOVEUP]: false,
      [UserAction.ENTITY_ACTION_LAYERRASTERRECORD_MOVEDOWN]: false,
      [UserAction.ENTITY_ACTION_LAYERRASTERRECORD_MOVETOBOTTOM]: false,
    },
  },
];

export const userStore = ModelBase
  .props({
    state: types.enumeration<ResponseState>(
      'State',
      Object.values(ResponseState)
    ),
    user: types.maybe(types.frozen<IUser>({userName: 'user', role: CONFIG.DEFAULT_USER.ROLE as UserRole})), /*UserRole.ADMIN*/
  })
  .views((self) => ({
    get store(): IRootStore {
      return self.__getStore<RootStoreType>()
    },
    get root(): IRootStore {
      return getParent(self);
    },
  }))
  .actions((self) => {
    function isActionAllowed(action: UserAction | string): boolean | undefined {
      const role = ROLES.find(item => item.role === self.user?.role);
      return role ? role.permissions[action as UserAction] as boolean : false;
    }

    function changeUserRole(role: UserRole): void {
      self.user = {...self.user, role} as IUser;
    }

    return {
      isActionAllowed,
      changeUserRole,
    };
  });

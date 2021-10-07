import React, { useState } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { isEmpty } from 'lodash';
import { IconButton, MenuSurfaceAnchor, Typography, Menu, MenuItem } from '@map-colonies/react-core';
import { Box } from '@map-colonies/react-components';
import { ILayerImage } from '../../../../discrete-layer/models/layerImage';
import { IActionGroup, IAction } from '../../../actions/entity.actions';

import './actions.cell-renderer.css';

const FIRST = 0;

interface IActionsRendererParams extends ICellRendererParams {
  actions: IActionGroup[];
  actionHandler: (action: Record<string,unknown>) => void;
}

export const ActionsRenderer: React.FC<IActionsRendererParams> = (props) => {
  const entity = (props.data as ILayerImage).__typename as string;
  // @ts-ignore
  const actions = props.actions[entity] as IActionGroup[];
  let frequentActions: IAction[] = [];
  let allFlatActions: IAction[] = [];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (actions !== undefined) {
    actions.forEach(actionGroup => {
      frequentActions = [
        ...frequentActions,
        ...actionGroup.group.filter(action => action.frequent)
      ];
      allFlatActions = [
        ...allFlatActions,
        ...actionGroup.group
      ];
    });
  }

  const [openActionsMenu, setOpenActionsMenu] = useState<boolean>(false);

  const sendAction = (entity: string, action: IAction, data: Record<string,unknown>): void => {
    console.log(`SEND ${action.action} EVENT`);
    props.actionHandler({
      action: `${entity}.${action.action}`,
      data: data,
    });
  }

  return (
    <Box id="gridActionsCellRenderer" className="actionsContainer">
      {
        frequentActions.map((action, idx) => {
          return (
            <IconButton
              className={action.class ? `actionIcon actionDismissible ${action.class}` : `actionIcon actionDismissible`}
              icon={action.icon}
              key={`freqAct_${(props.data as ILayerImage).id}_${idx}`}
              onClick={(evt): void => { 
                sendAction(entity, action, props.data);
              }}
            />
          );
        })
      }
      <MenuSurfaceAnchor id="gridActionsMenuContainer">
        <Menu
          open={openActionsMenu}
          onClose={(evt): void => setOpenActionsMenu(false)}
          onMouseOver={(evt): void => evt.stopPropagation()}
        >
          {
            actions.map((actionGroup: IActionGroup, groupIdx: number) => {
              return (
                <>
                  {groupIdx > FIRST && 
                    <MenuItem key={`menuItemSeparator_groupId_${groupIdx}`}>
                      <Box className="menuSeparator"></Box>
                    </MenuItem>
                  }
                  {actionGroup.group.map((action: IAction, idx: number) => {
                    return (
                      <MenuItem key={`menuItemAct_${(props.data as ILayerImage).id}_${idx}`}>
                        <Box 
                          onClick={(evt): void => {
                            sendAction(entity, action, props.data);
                            setOpenActionsMenu(false); 
                          }}
                          className="actionMenuItem"
                        >
                          <IconButton
                            className={action.class ? `actionIcon actionDismissible ${action.class}` : `actionIcon actionDismissible glow-missing-icon`}
                            icon={action.icon}
                          />
                          <Typography 
                            tag="div"
                            className="actionMenuItemTitle actionDismissible"
                          >
                            {action.titleTranslationId}
                          </Typography>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </>
              )
            })
          }
        </Menu>
        {
          !isEmpty(allFlatActions) &&
          <IconButton 
            id="allActionsIcon"
            icon="more_vert" 
            className="actionIcon" 
            onClick={(evt): void => setOpenActionsMenu(!openActionsMenu)}
          />
        }
      </MenuSurfaceAnchor>
    </Box>
  );
};

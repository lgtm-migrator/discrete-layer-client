import React, { useMemo, useState } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { isEmpty } from 'lodash';
import { IconButton, MenuSurfaceAnchor, Typography, Menu, MenuItem } from '@map-colonies/react-core';
import { Box } from '@map-colonies/react-components';
import { FINAL_NEGATIVE_STATUSES, JOB_ENTITY } from '../../../../discrete-layer/components/system-status/job.types';
import { JobModelType, Status } from '../../../../discrete-layer/models';
import { IActionGroup, IAction } from '../../../actions/entity.actions';

import './actions.cell-renderer.css';

const FIRST = 0;
const EMPTY_ACTION_GROUP = 0;

interface IActionsRendererParams extends ICellRendererParams {
  actions: Record<string,IActionGroup[]>;
  actionHandler: (action: Record<string,unknown>) => void;
}

export const ActionsRenderer: React.FC<IActionsRendererParams> = (props) => {
  const entity = (props.data as Record<string,unknown>).__typename as string;

  const isJobEntity = entity === JOB_ENTITY;

  const isJobFinalNegativeStatus = useMemo(() => {
    return isJobEntity && FINAL_NEGATIVE_STATUSES.includes((props.data as JobModelType).status as Status);
  }, [props.data, isJobEntity]);

  const actions = props.actions[entity];
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
    console.log(`SEND for ${entity} ${action.action} EVENT`);
    props.actionHandler({
      action: `${entity}.${action.action}`,
      data: data,
    });
  };
  
  // We only want to show job actions picker on negative-final job statuses
  if (isJobEntity && !isJobFinalNegativeStatus) {
    return null;
  }

  return (
    <Box id="gridActionsCellRenderer" className="actionsContainer">
      {
        frequentActions.map((action, idx) => {
          return (
            <IconButton
              className={action.class ? `actionIcon actionDismissible ${action.class}` : `actionIcon actionDismissible`}
              icon={action.icon}
              key={`freqAct_${action.action}_${idx}`}
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
                <React.Fragment key={`actGroup_${groupIdx}`}>
                  {actionGroup.group.length > EMPTY_ACTION_GROUP && groupIdx > FIRST && 
                    <MenuItem key={`menuItemSeparator_groupId_${groupIdx}`}>
                      <Box className="menuSeparator"></Box>
                    </MenuItem>
                  }
                  {actionGroup.group.map((action: IAction, idx: number) => {
                    return (
                      <MenuItem key={`menuItemAct_${action.action}_${idx}`}>
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
                </React.Fragment>
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

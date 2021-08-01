import React, {useEffect, useState, useRef} from 'react';
import { observer } from 'mobx-react';
import { LayerRasterRecordModelType, useStore } from '../../models';
import { BestDiscretesComponent } from './best-discretes';

export const BestEditComponent: React.FC = observer(() => {
  const store = useStore();

  // @ts-ignore
  const bestDiscretes = store.discreteLayersStore.tabViews[0].layersImages as LayerRasterRecordModelType[];

  return (
    <BestDiscretesComponent 
      discretes={ bestDiscretes } 
      style={{ height: 'calc(100% - 80px)', width: 'calc(100% - 8px)' }}
    />
  );
})
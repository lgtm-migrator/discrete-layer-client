import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { isObject } from 'lodash';
import CONFIG from '../../../common/config';
import { 
  GridComponent,
  GridComponentOptions,
  GridValueFormatterParams,
  GridCellMouseOverEvent,
  GridCellMouseOutEvent,
  GridRowNode,
  GridRowSelectedEvent,
  GridReadyEvent,
  GridApi
} from '../../../common/components/grid';
import { usePrevious } from '../../../common/hooks/previous.hook';
import { HeaderFootprintRenderer } from '../../../common/components/grid/header-renderer/footprint.header-renderer';
import { FootprintRenderer } from '../../../common/components/grid/cell-renderer/footprint.cell-renderer';
import { LayerImageRenderer } from '../../../common/components/grid/cell-renderer/layer-image.cell-renderer';
import { EntityTypeRenderer } from '../../../common/components/grid/cell-renderer/entity-type.cell-renderer';
import CustomTooltip from '../../../common/components/grid/tooltip-renderer/name.tooltip-renderer';
import { dateFormatter } from '../../../common/helpers/type-formatters';
import { ILayerImage } from '../../models/layerImage';
import { useStore } from '../../models/RootStore';

import './layers-results.css';

const PAGINATION = true;
const PAGE_SIZE = 10;
const IMMEDIATE_EXECUTION = 0;
const INITIAL_ORDER = 0;

interface LayersResultsComponentProps {
  style?: {[key: string]: string};
}

export const LayersResultsComponent: React.FC<LayersResultsComponentProps> = observer((props) => {
  const intl = useIntl();
  const { discreteLayersStore } = useStore();
  const [layersImages, setlayersImages] = useState<ILayerImage[]>([]);
  const [isChecked, setIsChecked] = useState<boolean>(true);
  const prevLayersImages = usePrevious<ILayerImage[]>(layersImages);
  const cacheRef = useRef({} as ILayerImage[]);
  const selectedLayersRef = useRef(INITIAL_ORDER);

  useEffect(()=>{
    if(discreteLayersStore.layersImages){
      setlayersImages(discreteLayersStore.layersImages);
    }
  }, [discreteLayersStore.layersImages]);

  const isSameRowData = (source: ILayerImage[] | undefined, target: ILayerImage[] | undefined): boolean => {
    let res = false;
    if (source && target &&
        source.length === target.length) {
          let matchesRes = true;
          source.forEach((srcFeat: ILayerImage) => {
            const match = target.find((targetFeat: ILayerImage) => {
              return targetFeat.id === srcFeat.id;
            });
            matchesRes = matchesRes && isObject(match);
          });
          res = matchesRes;
    }
    
    return res;
  };

  const getRowData = (): ILayerImage[] | undefined => {
    if (isSameRowData(prevLayersImages, layersImages)) {
      return cacheRef.current;
    } else {
      cacheRef.current = layersImages;
      selectedLayersRef.current = INITIAL_ORDER;
      return cacheRef.current;
    }
  }

  const getMax = (valuesArr: number[]): number => valuesArr.reduce((prev, current) => (prev > current) ? prev : current);
  
  const colDef = [
    {
      width: 20,
      field: 'footprintShown',
      cellRenderer: 'rowFootprintRenderer',
      cellRendererParams: {
        onClick: (id: string, value: boolean, node: GridRowNode): void => {
          discreteLayersStore.showFootprint(id, value);
          const checkboxValues = layersImages.map(item => item.footprintShown);
          const checkAllValue = checkboxValues.reduce((accumulated, current) => (accumulated as boolean) && current, value);
          setIsChecked(checkAllValue as boolean);
        }
      },
      headerComponent: 'headerFootprintRenderer',
      headerComponentParams: {
        isChecked: isChecked,
        onClick: (value: boolean, gridApi: GridApi): void => {
          gridApi.forEachNode((item: GridRowNode) => {
            setTimeout(()=> item.setDataValue('footprintShown', value), IMMEDIATE_EXECUTION);
            discreteLayersStore.showFootprint(item.id, value);
          });
          setIsChecked(value);
        }  
      }
    },
    {
      width: 20,
      field: 'layerImageShown',
      cellRenderer: 'rowLayerImageRenderer',
      cellRendererParams: {
        onClick: (id: string, value: boolean, node: GridRowNode): void => {
          // setTimeout(()=> node.setDataValue('layerImageShown', value), immediateExecution);
          if (value) {
            selectedLayersRef.current++;
          } else {
            const orders: number[] = [];
            // eslint-disable-next-line
            (node as any).gridApi.forEachNode((item: GridRowNode)=> {
              const rowData = item.data as {[key: string]: string | boolean | number};
              if (rowData.layerImageShown === true && rowData.id !== id) {
                orders.push(rowData.order as number);
              }
            });
            selectedLayersRef.current = (orders.length) ? getMax(orders) : selectedLayersRef.current-1;
          }
          const order = value ? selectedLayersRef.current : null;
          // setTimeout(()=> node.setDataValue('order', order), immediateExecution) ;
          discreteLayersStore.showLayer(id, value, order);
        }
      }
    },
    {
      headerName: '',
      width: 50,
      field: '__typename',
      cellRenderer: 'entityTypeRenderer'
    },
    {
      headerName: intl.formatMessage({
        id: 'results.fields.name.label',
      }),
      width: 200,
      field: 'productName',
      suppressMovable: true,
      tooltipComponent: 'customTooltip',
      tooltipField: 'productName',
      tooltipComponentParams: { color: '#ececec' }
    },
    {
      headerName:  intl.formatMessage({
        id: 'results.fields.update-date.label',
      }),
      width: 120,
      field: 'updateDate',
      suppressMovable: true,
      valueFormatter: (params: GridValueFormatterParams): string => dateFormatter(params.value),
    },
    {
      headerName: intl.formatMessage({
        id: 'results.fields.order.label',
      }),
      width: 50,
      field: 'order',
      hide: true
    }
  ];
  const gridOptions: GridComponentOptions = {
    enableRtl: CONFIG.I18N.DEFAULT_LANGUAGE.toUpperCase() === 'HE',
    pagination: PAGINATION,
    paginationPageSize: PAGE_SIZE,
    columnDefs: colDef,
    getRowNodeId: (data: ILayerImage) => {
      return data.id;
    },
    // detailsRowCellRenderer: 'detailsRenderer',
    // detailsRowHeight: 150,
    overlayNoRowsTemplate: intl.formatMessage({
      id: 'results.nodata',
    }),
    frameworkComponents: {
      // detailsRenderer: LayerDetailsRenderer,
      headerFootprintRenderer: HeaderFootprintRenderer,
      rowFootprintRenderer: FootprintRenderer,
      rowLayerImageRenderer: LayerImageRenderer,
      entityTypeRenderer: EntityTypeRenderer,
      customTooltip: CustomTooltip,
    },
    tooltipShowDelay: 0,
    tooltipMouseTrack: false,
    rowSelection: 'single',
    suppressCellSelection: true,
    // suppressRowClickSelection: true,
    onCellMouseOver(event: GridCellMouseOverEvent) {
      discreteLayersStore.highlightLayer(event.data as ILayerImage);
    },
    onCellMouseOut(event: GridCellMouseOutEvent) {
      discreteLayersStore.highlightLayer(undefined);
    },
    onRowClicked(event: GridRowSelectedEvent) {
      discreteLayersStore.selectLayerByID((event.data as ILayerImage).id);
    },
    onGridReady(params: GridReadyEvent) {
      params.api.forEachNode( (node) => {
        if ((node.data as ILayerImage).id === discreteLayersStore.selectedLayer?.id) {
          params.api.selectNode(node, true);
        }
      });
    },
  };

  return (
    <GridComponent
      gridOptions={gridOptions}
      rowData={getRowData()}
      style={props.style}
    />
  );
});

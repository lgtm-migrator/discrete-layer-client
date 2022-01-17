/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, useState, useEffect } from 'react';
import { find, get } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { Geometry, Feature, FeatureCollection, Polygon, Point } from 'geojson';
import { lineString } from '@turf/helpers';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import { 
  IconButton,
  useTheme,
  Typography,
  MenuSurfaceAnchor,
  MenuSurface,
  Tooltip,
  Avatar
} from '@map-colonies/react-core';
import {
  DrawType,
  IDrawingEvent,
  IDrawing,
  CesiumDrawingsDataSource,
  CesiumColor,
  CesiumMap,
  CesiumSceneMode,
  BboxCorner,
  Box,
  CesiumPolylineDashMaterialProperty,
} from '@map-colonies/react-components';
import { version } from '../../../package.json';
import CONFIG from '../../common/config';
import { SelectedLayersContainer } from '../components/map-container/selected-layers-container';
import { HighlightedLayer } from '../components/map-container/highlighted-layer';
import { LayersFootprints } from '../components/map-container/layers-footprints';
import { PolygonSelectionUi } from '../components/map-container/polygon-selection-ui_2';
import { Filters } from '../components/filters/filters';
import { CatalogTreeComponent } from '../components/catalog-tree/catalog-tree';
import { LayersResultsComponent } from '../components/layers-results/layers-results';
import { EntityDialogComponent } from '../components/layer-details/entity-dialog';
import { BestRecordModelKeys } from '../components/layer-details/entity-types-keys';
import { SystemJobsComponent } from '../components/system-status/jobs-dialog';
import { BestEditComponent } from '../components/best-management/best-edit';
import { BestLayersPresentor } from '../components/best-management/best-layers-presentor';
import { BestRecordModel, LayerMetadataMixedUnion, ProductType, RecordType } from '../models';
import { BestRecordModelType } from '../models/BestRecordModel';
import { DiscreteOrder } from '../models/DiscreteOrder';
import { ILayerImage } from '../models/layerImage';
import { useQuery, useStore } from '../models/RootStore';
import { FilterField } from '../models/RootStore.base';
import { UserAction } from '../models/userStore';
import { BestMapContextMenu } from '../components/best-management/best-map-context-menu';
import { ActionResolver } from './components/action-resolver.component';
import { DetailsPanel } from './components/details-panel.component';
import { TabViewsSwitcher } from './components/tabs-views-switcher.component';
import { TabViews } from './tab-views';

import '@material/tab-bar/dist/mdc.tab-bar.css';
import '@material/tab/dist/mdc.tab.css';
import '@material/tab-scroller/dist/mdc.tab-scroller.css';
import '@material/tab-indicator/dist/mdc.tab-indicator.css';
import './discrete-layer-view.css';

type LayerType = 'WMTS_LAYER' | 'WMS_LAYER' | 'XYZ_LAYER' | 'OSM_LAYER';
const START_IDX = 0;
const DRAWING_MATERIAL_OPACITY = 0.5;
const DRAWING_FINAL_MATERIAL_OPACITY = 0.8;
const DRAWING_MATERIAL_COLOR = CesiumColor.YELLOW.withAlpha(DRAWING_MATERIAL_OPACITY);
const DRAWING_FINAL_MATERIAL = new CesiumPolylineDashMaterialProperty({
  color: CesiumColor.DARKSLATEGRAY.withAlpha(DRAWING_FINAL_MATERIAL_OPACITY), //new CesiumColor( 116, 135, 136, 1),
  dashLength: 5
});
const BASE_MAPS = CONFIG.BASE_MAPS;

interface IDrawingObject {
  type: DrawType;
  handler: (drawing: IDrawingEvent) => void;
}

const noDrawing: IDrawingObject = {
  type: DrawType.UNKNOWN,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handler: (drawing: IDrawingEvent) => {},
};

const getTimeStamp = (): string => new Date().getTime().toString();

const tileOptions = { opacity: 0.5 };

const DiscreteLayerView: React.FC = observer(() => {
  // eslint-disable-next-line
  const { loading, error, data, query, setQuery } = useQuery();
  const store = useStore();
  const theme = useTheme();
  const intl = useIntl();
  const [center] = useState<[number, number]>(CONFIG.MAP.CENTER as [number, number]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isNewRasterEntityDialogOpen, setNewRasterEntityDialogOpen] = useState<boolean>(false);
  const [isNew3DEntityDialogOpen, setNew3DEntityDialogOpen] = useState<boolean>(false);
  const [isNewDemEntityDialogOpen, setNewDemEntityDialogOpen] = useState<boolean>(false);
  const [isEditEntityDialogOpen, setEditEntityDialogOpen] = useState<boolean>(false);
  const [isSystemsJobsDialogOpen, setSystemsJobsDialogOpen] = useState<boolean>(false);
  const [openNew, setOpenNew] = useState<boolean>(false);
  const [isFilter, setIsFilter] = useState<boolean>(false);
  const [tabsPanelExpanded, setTabsPanelExpanded] = useState<boolean>(false);
  const [detailsPanelExpanded, setDetailsPanelExpanded] = useState<boolean>(false);
  const [activeTabView, setActiveTabView] = useState(TabViews.CATALOG);
  const [drawPrimitive, setDrawPrimitive] = useState<IDrawingObject>(noDrawing);
  const [openImportFromCatalog, setOpenImportFromCatalog] = useState<boolean>(false);
  const [catalogRefresh, setCatalogRefresh] = useState<number>(START_IDX);
  const [drawEntities, setDrawEntities] = useState<IDrawing[]>([
    {
      coordinates: [],
      name: '',
      id: '',
      type: DrawType.UNKNOWN,
    },
  ]);
  const memoizedLayers =  useMemo(() => {
    return(
    <>
      <SelectedLayersContainer/>
      <HighlightedLayer/>
      <LayersFootprints/>
      <BestLayersPresentor/>
    </>
  );
  }, []);


  useEffect(() => {
    const layers = get(data,'search', []) as ILayerImage[];

    store.discreteLayersStore.setLayersImages([...layers]);
  }, [data, store.discreteLayersStore]);

  const handleTabViewChange = (targetViewIdx: TabViews): void => {
    if(activeTabView !== targetViewIdx){
      store.discreteLayersStore.setTabviewData(activeTabView);
      store.discreteLayersStore.restoreTabviewData(targetViewIdx);
  
      if(activeTabView === TabViews.CREATE_BEST){
        store.bestStore.preserveData();
        store.bestStore.resetData();
      }
  
      if(targetViewIdx === TabViews.CREATE_BEST){
        store.bestStore.restoreData();
      }
  
      setActiveTabView(targetViewIdx);
    }
  };

  const buildFilters = (): FilterField[] => {
    const coordinates = (store.discreteLayersStore.searchParams.geojson as Polygon).coordinates[0];
    return [
      {
        field: 'mc:boundingBox',
        bbox: {
          llon: coordinates[0][0],
          llat: coordinates[0][1],
          ulon: coordinates[2][0],
          ulat: coordinates[2][1],
        },
      },
      {
        field: 'mc:type',
        eq: store.discreteLayersStore.searchParams.recordType,
      },
    ];
  };

  const handlePolygonSelected = (geometry: Geometry): void => {
    store.discreteLayersStore.searchParams.setLocation(geometry);
    void store.discreteLayersStore.clearLayersImages();
    // void store.discreteLayersStore.getLayersImages();

    // TODO: build query params: FILTERS and SORTS
    const filters = buildFilters();
    setQuery(store.querySearch({
      opts: {
        filter: filters
      },
      end: CONFIG.RUNNING_MODE.END_RECORD,
      start: CONFIG.RUNNING_MODE.START_RECORD,
    }));
  };

  const handlePolygonReset = (): void => {
    if (activeTabView === TabViews.SEARCH_RESULTS) {
      store.discreteLayersStore.searchParams.resetLocation();
      store.discreteLayersStore.clearLayersImages();
      store.discreteLayersStore.selectLayer(undefined);
  
      setDrawEntities([]);
    }
  };

  const handleNewEntityDialogClick = (recordType: RecordType): void => {
    switch (recordType) {
      case RecordType.RECORD_RASTER:
        setNewRasterEntityDialogOpen(!isNewRasterEntityDialogOpen);
        break;
      case RecordType.RECORD_3D:
        setNew3DEntityDialogOpen(!isNew3DEntityDialogOpen);
        break;
      case RecordType.RECORD_DEM:
        setNewDemEntityDialogOpen(!isNewDemEntityDialogOpen);
        break;
      default:
        break;
    }
  };

  const handleCreateBestDraft = (): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const record = {} as Record<string, any>;
    BestRecordModelKeys.forEach(key => {
      record[key as string] = undefined;
    });
    const timestamp = new Date().getTime().toString();
    record.id = 'DEFAULT_BEST_ID_' + timestamp;
    record.type = RecordType.RECORD_RASTER;
    record.productName = 'DRAFT_OF_BEST_' + timestamp;
    record.productType = ProductType.ORTHOPHOTO_BEST;
    record.isDraft = true;
    record['__typename'] = BestRecordModel.properties['__typename'].name.replaceAll('"','');
    record.discretes = [
      {
        id: '6ac605c4-da38-11eb-8d19-0242ac130003',
        zOrder: 0
      },
      {
        id: '7c6dfeb2-da38-11eb-8d19-0242ac130003',
        zOrder: 1
      }
    ] as DiscreteOrder[];
    store.bestStore.editBest(record as BestRecordModelType);
    // @ts-ignore
    store.discreteLayersStore.selectLayer(record as LayerMetadataMixedUnion);
    setEditEntityDialogOpen(!isEditEntityDialogOpen);
  };

  const handleSystemsJobsDialogClick = (): void => {
    setSystemsJobsDialogOpen(!isSystemsJobsDialogOpen);
  };

  const handleFilter = (): void => {
    setIsFilter(!isFilter);
  };

  const createDrawPrimitive = (type: DrawType): IDrawingObject => {
    return {
      type: type,
      handler: (drawing: IDrawingEvent): void => {
        const timeStamp = getTimeStamp();
        
        handleTabViewChange(TabViews.SEARCH_RESULTS);
        
        setIsDrawing(false);
        
        handlePolygonSelected((drawing.geojson as Feature).geometry as Polygon);

        setDrawEntities([
          {
            coordinates: drawing.primitive,
            name: `${type.toString()}_${timeStamp}`,
            id: timeStamp,
            type: drawing.type,
          },
        ]);
      },
    };
  };
  
  const setDrawType = (drawType: DrawType): void => {
    setIsDrawing(true);
    setDrawPrimitive(createDrawPrimitive(drawType));
  };

  const onPolygonSelection = (polygon: IDrawingEvent): void => {
    const timeStamp = getTimeStamp();
    const bottomLeftPoint = find((polygon.geojson as FeatureCollection<Point>).features, (feat: Feature<Point>)=>{
      return feat.properties?.type === BboxCorner.BOTTOM_LEFT;
    }) as Feature<Point>;
    const rightTopPoint = find((polygon.geojson as FeatureCollection<Point>).features, (feat: Feature<Point>)=>{
      return feat.properties?.type === BboxCorner.TOP_RIGHT;
    }) as Feature<Point>;
    const line = lineString([
      [
        bottomLeftPoint.geometry.coordinates[0],
        bottomLeftPoint.geometry.coordinates[1]
      ],
      [
        rightTopPoint.geometry.coordinates[0],
        rightTopPoint.geometry.coordinates[1],
      ],
    ]);
    const boxPolygon = bboxPolygon(bbox(line));

    handlePolygonSelected((boxPolygon as Feature).geometry as Polygon); 

    setDrawEntities([
      {
        coordinates: polygon.primitive,
        name: `${DrawType.BOX.toString()}_${timeStamp}`,
        id: timeStamp,
        type: DrawType.BOX,
        geojson: polygon.geojson,
      },
    ]);

    handleTabViewChange(TabViews.SEARCH_RESULTS);
  };

  const tabViews = [
    {
      idx: TabViews.CATALOG,
      title: 'tab-views.catalog',
      iconClassName: 'mc-icon-Catalog',
    },
    {
      idx: TabViews.SEARCH_RESULTS,
      title: 'tab-views.search-results',
      iconClassName: 'mc-icon-Search-History',
    },
    {
      idx: TabViews.CREATE_BEST,
      title: 'tab-views.create-best',
      iconClassName: 'mc-icon-Bests',
    }
  ];

  const permissions = useMemo(() => {
    return {
      isSystemsJobsAllowed: store.userStore.isActionAllowed(UserAction.ACTION_SYSTEMJOBS),
      isLayerRasterRecordIngestAllowed: store.userStore.isActionAllowed(UserAction.ENTITY_ACTION_LAYERRASTERRECORD_CREATE),
      isLayer3DRecordIngestAllowed: store.userStore.isActionAllowed(UserAction.ENTITY_ACTION_LAYER3DRECORD_CREATE),
      isLayerDemRecordIngestAllowed: store.userStore.isActionAllowed(UserAction.ENTITY_ACTION_LAYERDEMRECORD_CREATE),
      isBestRecordCreateAllowed: store.userStore.isActionAllowed(UserAction.ENTITY_ACTION_BESTRECORD_CREATE),
      isBestRecordEditAllowed: store.userStore.isActionAllowed(UserAction.ENTITY_ACTION_BESTRECORD_EDIT),
    }
  }, [store.userStore]);

  const getActiveTabHeader = (tabIdx: number): JSX.Element => {

    const tabView = find(tabViews, (tab)=>{
      return tab.idx === tabIdx;
    });

    return (
      <div className="tabHeaderContainer">
        <div className="tabTitleContainer" style={{backgroundColor: theme.custom?.GC_TAB_ACTIVE_BACKGROUND as string}}>
          <div className="tabTitle" style={{
            backgroundColor: theme.custom?.GC_ALTERNATIVE_SURFACE as string,
            borderBottomColor: theme.custom?.GC_TAB_ACTIVE_BACKGROUND as string
          }}>
            <IconButton 
              className={`operationIcon ${tabView?.iconClassName as string}`}
              label="TAB ICON"
            />
            <Typography use="headline6" tag="span">
              <FormattedMessage id={tabView?.title}></FormattedMessage>
            </Typography>
          </div>
        </div>

        <div className="tabOperationsContainer" style={{backgroundColor: theme.custom?.GC_ALTERNATIVE_SURFACE as string}}>
          <div className="tabOperations" style={{
            backgroundColor: theme.custom?.GC_TAB_ACTIVE_BACKGROUND as string,
            borderTopColor: theme.custom?.GC_TAB_ACTIVE_BACKGROUND as string
          }}>
            {
              (tabIdx === TabViews.CATALOG) && 
                <Tooltip content={intl.formatMessage({ id: 'action.refresh.tooltip' })}>
                  <IconButton className="operationIcon mc-icon-Refresh" onClick={(): void => { setCatalogRefresh(catalogRefresh + 1) }}/>
                </Tooltip>
            }
            {
              (tabIdx === TabViews.CATALOG) && 
              (permissions.isLayerRasterRecordIngestAllowed || permissions.isLayer3DRecordIngestAllowed || permissions.isLayerDemRecordIngestAllowed || permissions.isBestRecordCreateAllowed) && 
              <MenuSurfaceAnchor id="newContainer">
                <MenuSurface open={openNew} onClose={(evt): void => setOpenNew(false)}>
                  {
                    CONFIG.SERVED_ENTITY_TYPES.includes('RECORD_RASTER') &&
                    permissions.isLayerRasterRecordIngestAllowed &&
                    <Tooltip content={intl.formatMessage({ id: 'tab-views.catalog.actions.ingest_raster' })}>
                      <IconButton
                        className="operationIcon mc-icon-Map-Orthophoto"
                        label="NEW RASTER"
                        onClick={ (): void => { setOpenNew(false); handleNewEntityDialogClick(RecordType.RECORD_RASTER); } }
                      />
                    </Tooltip>
                  }
                  {
                    CONFIG.SERVED_ENTITY_TYPES.includes('RECORD_3D') &&
                    permissions.isLayer3DRecordIngestAllowed &&
                    <Tooltip content={intl.formatMessage({ id: 'tab-views.catalog.actions.ingest_3d' })}>
                      <IconButton
                        className="operationIcon mc-icon-Map-3D"
                        label="NEW 3D"
                        onClick={ (): void => { setOpenNew(false); handleNewEntityDialogClick(RecordType.RECORD_3D); } }
                      />
                    </Tooltip>
                  }
                  {
                    CONFIG.SERVED_ENTITY_TYPES.includes('RECORD_DEM') &&
                    permissions.isLayerDemRecordIngestAllowed &&
                    <Tooltip content={intl.formatMessage({ id: 'tab-views.catalog.actions.ingest_dem' })}>
                      <IconButton
                        className="operationIcon mc-icon-Map-Terrain"
                        label="NEW DEM"
                        onClick={ (): void => { setOpenNew(false); handleNewEntityDialogClick(RecordType.RECORD_DEM); } }
                      />
                    </Tooltip>
                  }
                  {
                    CONFIG.SERVED_ENTITY_TYPES.includes('RECORD_RASTER') &&
                    permissions.isBestRecordCreateAllowed &&
                    <Tooltip content={intl.formatMessage({ id: 'tab-views.catalog.actions.new_best' })}>
                      <IconButton
                        className="operationIcon mc-icon-Bests"
                        label="NEW BEST"
                        onClick={ (): void => {
                          setOpenNew(false);
                          handleCreateBestDraft();
                        } }
                      />
                    </Tooltip>
                  }
                </MenuSurface>
                <Tooltip content={intl.formatMessage({ id: 'action.operations.tooltip' })}>
                  <IconButton className="operationIcon mc-icon-Property-1Add" onClick={(evt): void => setOpenNew(!openNew)}/>
                </Tooltip>
              </MenuSurfaceAnchor>
            }
            { 
            (tabIdx === TabViews.CREATE_BEST) && permissions.isBestRecordEditAllowed && 
              <>
                <Tooltip content={intl.formatMessage({ id: 'tab-views.best-edit.actions.edit' })}>
                  <IconButton
                    className="operationIcon mc-icon-Edit"
                    label="EDIT"
                    onClick={ (): void => {
                      store.discreteLayersStore.selectLayer(undefined);
                      setEditEntityDialogOpen(!isEditEntityDialogOpen);
                    } }
                  />
                </Tooltip>
                <Tooltip content={intl.formatMessage({ id: 'tab-views.best-edit.actions.import' })}>
                  <IconButton
                    className="operationIcon mc-icon-Property-1Add"
                    label="ADD TO BEST"
                    onClick={ (): void => { setOpenImportFromCatalog(!openImportFromCatalog); } }
                  />
                </Tooltip>
              </>
            }
            {/* <Tooltip content={intl.formatMessage({ id: 'action.delete.tooltip' })}>
              <IconButton 
                className="operationIcon mc-icon-Delete"
                label="DELETE"
              />
            </Tooltip> */}
            <Tooltip content={intl.formatMessage({ id: 'action.filter.tooltip' })}>
              <IconButton 
                className="operationIcon mc-icon-Filter"
                label="FILTER"
                onClick={ (): void => { handleFilter(); } }
              />
            </Tooltip>
            <Tooltip content={intl.formatMessage({ id: `${!tabsPanelExpanded ? 'action.expand.tooltip' : 'action.collapse.tooltip'}` })}>
              <IconButton 
                className={`operationIcon ${!tabsPanelExpanded ? 'mc-icon-Arrows-Right' : 'mc-icon-Arrows-Left'}`}
                label="PANEL EXPANDER"
                onClick={ (): void => {setTabsPanelExpanded(!tabsPanelExpanded);}}
              />
            </Tooltip>
          </div>
        </div>
      </div>
    );
  };
 
  return (
    <>
      <ActionResolver
        handleOpenEntityDialog = {setEditEntityDialogOpen}
      />
      <Box className="headerContainer">
        <Box className="headerViewsSwitcher">
          <Box style={{padding: '0 12px 0 12px'}}>
            <Typography use="body2">Catalog App</Typography>
            <Tooltip content={`${intl.formatMessage({ id: 'general.version.text' })} ${version}`}>
              <Box className="version">{version}</Box>
            </Tooltip>
          </Box>
          <TabViewsSwitcher
            handleTabViewChange = {handleTabViewChange}
            activeTabView = {activeTabView}
          />
        </Box>

        <Box className="headerSearchOptionsContainer">
          <PolygonSelectionUi
            onCancelDraw={(): void=>{ console.log('****** onCancelDraw ****** called')}}
            onReset={handlePolygonReset}
            onStartDraw={setDrawType}
            isSelectionEnabled={isDrawing}
            onPolygonUpdate={onPolygonSelection}
          />
        </Box>

        <Box className="headerSystemAreaContainer">
          <Tooltip content={intl.formatMessage({ id: 'general.login-user.tooltip' }, { user: store.userStore.user?.role })}>
            <Avatar className="avatar" name={store.userStore.user?.role} size="large" />
          </Tooltip>
          {
            permissions.isSystemsJobsAllowed && <Tooltip content={intl.formatMessage({ id: 'action.system-jobs.tooltip' })}>
              <IconButton
                className="operationIcon mc-icon-System-Missions"
                label="SYSTEM JOBS"
                onClick={ (): void => { handleSystemsJobsDialogClick(); } }
              />
            </Tooltip>
          }
          {
            isSystemsJobsDialogOpen && <SystemJobsComponent
              isOpen={isSystemsJobsDialogOpen}
              onSetOpen={setSystemsJobsDialogOpen}>
            </SystemJobsComponent>
          }
        </Box>
      </Box>
      <Box className="mainViewContainer">
        <Box className="sidePanelParentContainer">
          <Box 
            className="sidePanelContainer"
            style={{
              backgroundColor: theme.custom?.GC_ALTERNATIVE_SURFACE as string,
              height: detailsPanelExpanded ? '50%' : '75%'
            }}
          >
            <Box className="tabContentContainer" style={{display: activeTabView === TabViews.CATALOG ? 'block' : 'none'}}>
              {
                getActiveTabHeader(activeTabView)
              }
              <Box className="detailsContent" style={{ overflow: 'hidden' }}>
                <CatalogTreeComponent refresh={catalogRefresh}/>
              </Box>
            </Box>

            {activeTabView === TabViews.SEARCH_RESULTS && <Box className="tabContentContainer">
              {
                getActiveTabHeader(activeTabView)
              }
              <LayersResultsComponent 
                style={{
                  height: 'calc(100% - 50px)',
                  width: 'calc(100% - 8px)'
                }}
              />
            </Box>
            }

            {activeTabView === TabViews.CREATE_BEST && <Box className="tabContentContainer">
              {
                getActiveTabHeader(activeTabView)
              }
              <Box 
                style={{
                  height: 'calc(100% - 50px)',
                  width: 'calc(100% - 8px)',
                  position: 'relative'
                }}
              >
                <BestEditComponent 
                  openImport={openImportFromCatalog} 
                  handleCloseImport={setOpenImportFromCatalog}/>
              </Box>
            </Box>
            }
          </Box>
          
          <Box className="sidePanelContainer sideDetailsPanel" style={{
            backgroundColor: theme.custom?.GC_ALTERNATIVE_SURFACE as string,
            height: detailsPanelExpanded ? '50%' : '25%',
          }}>
            <DetailsPanel
              isEditEntityDialogOpen = {isEditEntityDialogOpen}
              setEditEntityDialogOpen = {setEditEntityDialogOpen}
              detailsPanelExpanded = {detailsPanelExpanded}
              setDetailsPanelExpanded = {setDetailsPanelExpanded} 
            />
          </Box>
        </Box>
        <Box className="mapAppContainer">
          {
            <CesiumMap 
              projection={CONFIG.MAP.PROJECTION}  
              center={center}
              zoom={CONFIG.MAP.ZOOM}
              sceneMode={CesiumSceneMode.SCENE2D}
              imageryProvider={false}
              baseMaps={BASE_MAPS}
              // @ts-ignore
              imageryContextMenu={activeTabView === TabViews.CREATE_BEST ? <BestMapContextMenu entityTypeName={'BestRecord'} /> : undefined}
              imageryContextMenuSize={activeTabView === TabViews.CREATE_BEST ? { height: 212, width: 260, dynamicHeightIncrement: 120 } : undefined}
              >
                {memoizedLayers}
                <CesiumDrawingsDataSource
                  drawings={activeTabView === TabViews.SEARCH_RESULTS ? drawEntities : []}
                  drawingMaterial={DRAWING_MATERIAL_COLOR}
                  drawState={{
                    drawing: isDrawing,
                    type: drawPrimitive.type,
                    handler: drawPrimitive.handler,
                  }}
                  hollow={true}
                  outlineWidth={2}
                  material={ (DRAWING_FINAL_MATERIAL as any) as CesiumColor }
                />
            </CesiumMap>
          }
        </Box>

        <Filters isFiltersOpened={isFilter} filtersView={activeTabView}/>
        {
          isNewRasterEntityDialogOpen &&
          <EntityDialogComponent
            isOpen={isNewRasterEntityDialogOpen}
            onSetOpen={setNewRasterEntityDialogOpen}
            recordType={RecordType.RECORD_RASTER}>
          </EntityDialogComponent>
        }
        {
          isNew3DEntityDialogOpen &&
          <EntityDialogComponent
            isOpen={isNew3DEntityDialogOpen}
            onSetOpen={setNew3DEntityDialogOpen}
            recordType={RecordType.RECORD_3D}>
          </EntityDialogComponent>
        }
        {
          isNewDemEntityDialogOpen &&
          <EntityDialogComponent
            isOpen={isNewDemEntityDialogOpen}
            onSetOpen={setNewDemEntityDialogOpen}
            recordType={RecordType.RECORD_DEM}>
          </EntityDialogComponent>
        }
      </Box>
    </>
  );
});

export default DiscreteLayerView;

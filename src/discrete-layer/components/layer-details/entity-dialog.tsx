import React, { useEffect, useCallback } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { FormattedMessage } from 'react-intl';
import { FormikValues, useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { observer } from 'mobx-react';
import { DialogContent } from '@material-ui/core';
import { Button, Dialog, DialogTitle } from '@map-colonies/react-core';
import { Box } from '@map-colonies/react-components';
import { Mode } from '../../../common/models/mode.enum';
import { Layer3DRecordModel, LayerRasterRecordModel, RecordType, SensorType, useQuery, useStore } from '../../models';
import { ILayerImage } from '../../models/layerImage';
import { Layer3DRecordInput, LayerRasterRecordInput } from '../../models/RootStore.base';
import { LayersDetailsComponent } from './layer-details';
import { Layer3DRecordModelKeys, LayerRasterRecordModelKeys } from './layer-details.field-info';

import './entity-dialog.css';

interface EntityDialogComponentProps {
  isOpen: boolean;
  onSetOpen: (open: boolean) => void;
  recordType?: RecordType;
  layerRecord?: ILayerImage | null;
}


const buildRecord = (recordType: RecordType) : ILayerImage => {
  const record = {} as Record<string, any>;
  switch(recordType){
    case RecordType.RECORD_3D:
      Layer3DRecordModelKeys.forEach(key => {
        record[key as string] = undefined;
      });
      record['__typename'] = Layer3DRecordModel.properties['__typename'].name.replaceAll('"','');
      break;
    case RecordType.RECORD_RASTER:
      LayerRasterRecordModelKeys.forEach(key => {
        record[key as string] = undefined;
      });
      record['__typename'] = LayerRasterRecordModel.properties['__typename'].name.replaceAll('"','');
      break;
    default:
      break;
  }
  return record as ILayerImage;
}
  
export const EntityDialogComponent: React.FC<EntityDialogComponentProps> = observer((props: EntityDialogComponentProps) => {
  const { isOpen, onSetOpen, recordType } = props;
  let layerRecord = cloneDeep(props.layerRecord);
  const mutationQuery = useQuery();
  const store = useStore();

  let mode = Mode.EDIT;
  if (layerRecord === undefined && recordType !== undefined){
    mode = Mode.NEW;
    layerRecord = buildRecord(recordType);
  }

  const formik = useFormik({
    initialValues: layerRecord as FormikValues,
    onSubmit: values => {
      console.log(values);
      if(mode === Mode.EDIT) {
        mutationQuery.setQuery(store.mutateUpdateMetadata({
          data: {
            id: values.id as string,
            type: values.type as RecordType,
            productName: values.productName as string,
            description: values.description as string,
            sensorType: values.sensorType as SensorType[],
            classification: values.classification as string ,
            keywords: values.keywords as string,
          }
        }));
      }
      else{
        switch(recordType){
          case RecordType.RECORD_3D:
            mutationQuery.setQuery(store.mutateStart3DIngestion({
              data:{
                directory: 'KUKU_DIRECTORY',
                fileNames: ['KUKU_FILE'],
                metadata: {...(values as Layer3DRecordInput)},
                type: RecordType.RECORD_3D
              }
            }))
            break;
          case RecordType.RECORD_RASTER:
            mutationQuery.setQuery(store.mutateStartRasterIngestion({
              data:{
                directory: 'MUKU_DIRECTORY',
                fileNames: ['MUKU_FILE'],
                metadata: {...(values as LayerRasterRecordInput)},
                type: RecordType.RECORD_RASTER
              }
            }))
            break;
          default:
            break;
        }
      }
    }
  });

  const closeDialog = useCallback(
    () => {
      onSetOpen(false);
    },
    [onSetOpen]
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(!mutationQuery.loading && mutationQuery.data?.updateMetadata === 'ok'){
      closeDialog();
      store.discreteLayersStore.updateLayer(formik.values as ILayerImage);
      store.discreteLayersStore.selectLayerByID((formik.values as ILayerImage).id);
    }
  }, [mutationQuery.data, mutationQuery.loading, closeDialog, store.discreteLayersStore, formik.values]);

  return (
    <Box id="entityDialog">
      <Dialog open={isOpen} preventOutsideDismiss={true}>
        <DialogTitle>
          <FormattedMessage id={ mode === Mode.NEW ? 'general.title.new' : 'general.title.edit' }/>
        </DialogTitle>
        <DialogContent className="dialogBody">
          <form onSubmit={formik.handleSubmit} className="form">
            <PerfectScrollbar className="content">
              <LayersDetailsComponent layerRecord={layerRecord} mode={mode} formik={formik}/>
            </PerfectScrollbar>
            <Box className="buttons">
              <Button type="button" onClick={(): void => { closeDialog(); }}>
                <FormattedMessage id="general.cancel-btn.text"/>
              </Button>
              <Button raised type="submit" disabled={ mutationQuery.loading}>
                <FormattedMessage id="general.ok-btn.text"/>
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
});

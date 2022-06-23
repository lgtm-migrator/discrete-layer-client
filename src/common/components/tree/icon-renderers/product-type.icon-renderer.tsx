import React from 'react';
import { ILayerImage } from '../../../../discrete-layer/models/layerImage';
import { TypeIcon } from '../../general/type-icon';

interface ILayerImageCellRendererParams {
  data: ILayerImage;
  thumbnailUrl?: string;
}

export const ProductTypeRenderer: React.FC<ILayerImageCellRendererParams> = ({ data, thumbnailUrl }) => {

  return (
    <TypeIcon typeName={data.productType as string} thumbnailUrl={thumbnailUrl}/>
  );
  
};

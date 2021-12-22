import React, { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Tooltip } from '@map-colonies/react-core';
import { Box } from '@map-colonies/react-components';

import './field-label.css';

interface FieldLabelProps {
  value?: string;
  isRequired?: boolean;
  customClassName?: string;
  showTooltip?: boolean;
}

export const FieldLabelComponent: React.FC<FieldLabelProps> = ({
  value,
  isRequired,
  customClassName,
  showTooltip,
}) => {
  const intl = useIntl();

  const renderLabel = useMemo(() => {
    // Indicates when the label will overflow the container
    const MAX_LABEL_LENGTH = 12;
    const label = intl.formatMessage({ id: value });

    if (showTooltip !== false && label.length > MAX_LABEL_LENGTH) {
      return (
        <Tooltip content={label}>
          <span>
            <FormattedMessage id={value}/>
          </span>
        </Tooltip>
      );
    }
    return (
      <span>
        <FormattedMessage id={value}/>
      </span>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box className={customClassName !== undefined ? customClassName : 'detailsFieldLabel'}>
      {renderLabel}
      <Box className="requiredAsterisk">{isRequired === true ? '*' : ''}</Box>
    </Box>
  );
};

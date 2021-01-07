import React, { useState, useLayoutEffect } from 'react';
import { IntlProvider } from 'react-intl';

// Import from react core components
import {
  ThemeProvider as RMWCThemeProvider,
  RMWCProvider,
  Themes,
} from '@map-colonies/react-core';
import { CssBaseline } from '@map-colonies/react-components';
import { useMediaQuery } from '@map-colonies/react-components';
import '@map-colonies/react-core/dist/theme/styles';
import '@map-colonies/react-core/dist/button/styles';
import '@map-colonies/react-core/dist/tooltip/styles';
import '@map-colonies/react-core/dist/menu/styles';
import '@map-colonies/react-core/dist/select/styles';
import '@map-colonies/react-core/dist/circular-progress/styles';
import '@map-colonies/react-core/dist/typography/styles';
import '@map-colonies/react-core/dist/dialog/styles';
import '@map-colonies/react-core/dist/textfield/styles';
import '@map-colonies/react-core/dist/snackbar/styles';
import '@map-colonies/react-core/dist/icon/styles';
import '@map-colonies/react-core/dist/linear-progress/styles';
import '@map-colonies/react-core/dist/drawer/styles';
import '@map-colonies/react-core/dist/checkbox/styles';
import './App.css';

import { SnackContainer } from './discrete-layer/components/snack-container/snack-container';
import DiscreteLayerView from './discrete-layer/views/discrete-layer-view';
import MESSAGES from './common/i18n';
import CONFIG from './common/config';

const App: React.FC = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  // eslint-disable-next-line
  const [lang, setLang] = useState(CONFIG.I18N.DEFAULT_LANGUAGE);
  const theme = Themes.lightTheme; //TODO: when dark theme will be tuned use this --> prefersDarkMode ? Themes.darkTheme : Themes.lightTheme;

  useLayoutEffect(() => {
    setLang(document.documentElement.lang);
  }, []);

  return (
    // eslint-disable-next-line
    <IntlProvider locale={lang} messages={MESSAGES[lang]}>
      <RMWCProvider
        typography={{
          body1: 'span',
          body2: ({ children, ...rest }) => (
            <span>
              <b>{children}</b>
            </span>
          ),
        }}
      >
        <RMWCThemeProvider options={theme}>
          <CssBaseline />
          <DiscreteLayerView />
          <SnackContainer />
        </RMWCThemeProvider>
      </RMWCProvider>
    </IntlProvider>
  );
};

export default App;

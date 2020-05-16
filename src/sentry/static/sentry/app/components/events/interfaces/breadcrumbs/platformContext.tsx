import React from 'react';

import {PlatformKey} from 'sentry/data/platformCategories';

const PlatformContext = React.createContext<{platform?: PlatformKey} | undefined>(
  undefined
);

const PlatformContextProvider = PlatformContext.Provider;

export {PlatformContext, PlatformContextProvider};

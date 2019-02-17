import { createMuiTheme } from '@material-ui/core/styles';

import themeBase from './base';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
  ...themeBase  
});

export default theme;
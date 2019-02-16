import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  shape: {
    borderRadius: 0,
  },
  palette: {
    action: {
      hover: 'none',
      active: 'none',
      hoverOpacity: 0
    }
  }
});

export default theme;
import * as React from 'react';
import MaterialListItem, { ListItemProps as MaterialListItemProps } from '@material-ui/core/ListItem';

import Reveal from '../reveal/Reveal';
import { ComponentThemeProvider, GlobalTheme } from '../theme/theme';

export interface ListItemProps extends MaterialListItemProps {

}

const ListItem: React.SFC<ListItemProps> = (props) => {
  return (
    <ComponentThemeProvider theme={{borderStyle: 'half', borderWhileNotHover: false}}>
      <MaterialListItem {...props}>
        {props.children}
        <Reveal borderStyle="half" />
      </MaterialListItem>
    </ComponentThemeProvider>
  );
}

export default ListItem;
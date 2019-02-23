import * as React from 'react';
import MaterialListItem, { ListItemProps as MaterialListItemProps } from '@material-ui/core/ListItem';

import Reveal from '../reveal/Reveal';

export interface ListItemProps extends MaterialListItemProps {

}

const ListItem: React.SFC<ListItemProps> = (props) => {
  return (
    <MaterialListItem {...props}>
      {props.children}
      <Reveal />
    </MaterialListItem>
  );
}

export default ListItem;
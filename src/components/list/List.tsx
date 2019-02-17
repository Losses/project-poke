import * as React from 'react';

import MaterialList, { ListProps as MaterialListProps } from '@material-ui/core/List';

export interface ListProps extends MaterialListProps {

}

const List: React.SFC<ListProps> = (props) => {
  return (
    <MaterialList disablePadding>
      {props.children}
    </MaterialList>
  );
}

export default List;
import { memo, useMemo } from 'react';

import { TrapActions, TrapControlsStateReducerAction } from '../TrapControls';
import { Menu } from '../../../UI/menu/Menu';
import { MenuItem } from '../../../UI/menu/MenuItem';

interface TrapActionMenuProps {
  dispatchTrapControlsState: React.Dispatch<TrapControlsStateReducerAction>;
}

export const TrapActionMenu = memo(function TrapActionMenu({ dispatchTrapControlsState }: TrapActionMenuProps) {
  const trapActionsMenuItems = useMemo(
    () =>
      Object.values(TrapActions).map((trapAction) => (
        <MenuItem key={trapAction} label={trapAction} handleClick={() => dispatchTrapControlsState({ trapAction })} />
      )),
    [dispatchTrapControlsState]
  );
  return <Menu label="Action" items={trapActionsMenuItems} />;
});

import { memo, useCallback, useRef, useState } from 'react';
import { Listbox as HeadlessUIListbox } from '@headlessui/react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/20/solid';

import type { DemoTrapConfig, TrapControlsReducerAction } from '../TrapControls';
import { Listbox } from '../../../UI/listbox/Listbox';
import { ListboxOption } from '../../../UI/listbox/ListboxOption';

type TrapConfigListboxProps = (
  | {
      configProp: Extract<keyof DemoTrapConfig, 'roots' | 'initialFocus'>;
      configValues: { roots: string[]; initialFocus: string; returnFocus?: never };
      skeletonRootId: string | undefined;
      filterState: boolean;
      setFilterState: React.Dispatch<React.SetStateAction<boolean>>;
    }
  | {
      configProp: Extract<keyof DemoTrapConfig, 'returnFocus'>;
      configValues: { roots?: never; initialFocus?: never; returnFocus: string };
      skeletonRootId?: never;
      filterState?: never;
      setFilterState?: never;
    }
) & {
  demoElementsState: HTMLElement[];
  dispatchTrapControlsState: React.Dispatch<TrapControlsReducerAction>;
  disabled?: boolean;
};

export const TrapConfigListbox = memo(function TrapConfigListbox({
  configProp,
  configValues,
  skeletonRootId,
  filterState,
  setFilterState,
  demoElementsState,
  dispatchTrapControlsState,
  disabled,
}: TrapConfigListboxProps) {
  const [shouldInitialFocusFilterBeSticky, setShouldInitialFocusFilterBeSticky] = useState(true);
  const optionsRef = useRef<HTMLUListElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const { roots, initialFocus, returnFocus } = configValues;

  const getElementsIn = (selectedRoots: string[]) =>
    demoElementsState.filter((el) => selectedRoots.some((root) => el.dataset.parentId === root || el.id === root));

  const resetInitialFocusIfNotIncludedIn = (selectedRoots: string[]) =>
    initialFocus !== 'true' &&
    initialFocus !== 'false' &&
    selectedRoots &&
    skeletonRootId &&
    !selectedRoots.includes(skeletonRootId) &&
    !getElementsIn(selectedRoots as string[])
      .map((el) => el.id)
      .includes(initialFocus!) &&
    dispatchTrapControlsState({ initialFocus: 'true' });

  const options = [
    ...(configProp !== 'roots' ? ['true', 'false'] : []),
    ...(configProp === 'initialFocus' && filterState && skeletonRootId && !roots!.includes(skeletonRootId)
      ? getElementsIn(roots!)
      : demoElementsState
    ) // Filtering out the grouping <div>s by relying on the fact that they have no `data-parent-id` attribute.
      .filter((el) => configProp === 'roots' || el.dataset.parentId)
      .map((el) => el.id),
  ];

  const handleListboxChange = (selectedOptions: string | string[]) => {
    dispatchTrapControlsState({ [configProp]: selectedOptions } as TrapControlsReducerAction);

    // If the filter in the initialFocus's <TrapConfigListbox> is active, then when the selected `roots` change,
    // `controlsState.trapConfig.initialFocus` must be reset if its value is not included in the new selected roots.
    if (configProp === 'roots' && filterState) resetInitialFocusIfNotIncludedIn(selectedOptions as string[]);
  };

  const handleFilterClick = () => {
    // `handleFilterClick` is in the DOM only if `configProp === 'initialFocus'`, in which case
    // both `setFilterState` and `configValues.roots` are required `TrapConfigListboxProps`.

    setFilterState!((prevState) => !prevState);

    // When activating the filter, `controlsState.trapConfig.initialFocus` must be reset
    // if its value is not included in the currently selected roots.
    if (!filterState) resetInitialFocusIfNotIncludedIn(roots!);
  };

  // The filter button is not a <Listbox.Option>, so the arrow key navigation for the options
  // (managed by Headless UI) doesn't reach the button. That's just fine, cause the filter is
  // not an essential feature and it would actually make the navigation harder from keyboard.
  // However since it's unreachable by keyboard, arrow-keying up in the listox options doesn't
  // scroll up completely, and its `sticky` position makes it overlap with the first option.
  // So the fix here is to give the filter button a `relative` position
  // as soon as the arrow-keyed option gets close enough to it.
  // TODO: consider the path of rendering the filter button outside of <Listbox.Options>,
  // getting rid of all this JS logic (but losing that good looking sticky position).
  const handleInitialFocusArrowKey = useCallback((event: React.KeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'ArrowUp') {
      const activeOption =
        optionsRef.current &&
        (Array.from(optionsRef.current.children).find(
          (child) => child instanceof HTMLLIElement && child.dataset.headlessuiState?.includes('active')
        ) as HTMLLIElement | null | undefined);

      if (
        activeOption &&
        filterButtonRef.current &&
        activeOption.offsetTop - optionsRef.current.scrollTop < filterButtonRef.current.offsetHeight * 2
      ) {
        setShouldInitialFocusFilterBeSticky(false);
      }
    } else if (event.key === 'ArrowDown') setShouldInitialFocusFilterBeSticky(true);
  }, []);

  const listboxOptions = (
    <HeadlessUIListbox.Options
      ref={optionsRef}
      onKeyDown={configProp === 'initialFocus' ? handleInitialFocusArrowKey : undefined}
      className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      {configProp === 'initialFocus' && (
        <button
          ref={filterButtonRef}
          type="button"
          onClick={handleFilterClick}
          className={`${shouldInitialFocusFilterBeSticky ? 'sticky top-0 z-10' : 'relative'} ${
            filterState ? 'bg-red-50' : 'bg-violet-50'
          } flex w-full items-center justify-center whitespace-nowrap  border-b-2 bg-opacity-[85%] px-2 py-3 text-base focus:outline-none`}
        >
          {filterState
            ? [
                <XMarkIcon key={'XMarkIcon'} className="mr-2 h-6 w-6 text-red-400" aria-hidden="true" />,
                'Remove filter',
              ]
            : [
                <FunnelIcon key={'FunnelIcon'} className="mr-2 h-4 w-4 text-violet-400" aria-hidden="true" />,
                'Filter by roots',
              ]}
        </button>
      )}
      {options.map((option) => (
        <ListboxOption key={option} value={option} />
      ))}
    </HeadlessUIListbox.Options>
  );

  return (
    <Listbox
      label={configProp}
      value={(configProp === 'roots' ? roots : initialFocus ?? returnFocus)!}
      handleChange={handleListboxChange}
      options={listboxOptions}
      displayValue={configProp === 'roots' ? options.filter((id) => roots!.includes(id)).join(', ') : ''}
      multiple={configProp === 'roots'}
      disabled={disabled ?? false}
    />
  );
});

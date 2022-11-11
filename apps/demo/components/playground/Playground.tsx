import { useState, useEffect } from 'react';

import { useTrapElementsSkeleton } from '../../hooks/useTrapElementsSkeleton';
import { TrapControls } from './trap-controls/TrapControls';
import { TrapElements } from './trap-elements/TrapElements';
import { TrapElementControls } from './trap-element-controls/TrapElementControls';

export interface SelectClickedElement {
  id: string;
  setSelectedSkeletonButtonStateById: (id: string) => void;
}

export interface ControlsKeysState {
  trap: number;
  trapElements: number;
}

const initialSelectClickedElement: SelectClickedElement = {
  id: '',
  setSelectedSkeletonButtonStateById: () => {},
};

const initialControlsKeysState: ControlsKeysState = { trap: 100, trapElements: -100 };

export function Playground() {
  const [selectClickedElementState, setSelectClickedElementState] = useState(initialSelectClickedElement);
  const [controlsKeysState, setControlsKeysState] = useState(initialControlsKeysState);
  const [showTrapControlsState, setShowTrapControlsState] = useState(true);
  const [trapElementsRootNodeState, setTrapElementsRootNodeState] = useState<HTMLDivElement>();
  const { trapElementsSkeletonState, skeletonButtonsIds, getSkeletonButtonElementById, patchSkeletonButton } =
    useTrapElementsSkeleton();

  // `setSelectedSkeletonButtonStateById` returns early if the `id` is still the same.
  useEffect(() => {
    const { id, setSelectedSkeletonButtonStateById } = selectClickedElementState;
    if (id) setSelectedSkeletonButtonStateById(id);
  }, [selectClickedElementState]);

  const trapElementsRootNodeCallbackRef = (rootNodeRef: HTMLDivElement) =>
    rootNodeRef && setTrapElementsRootNodeState(rootNodeRef);

  return (
    <div className="flex">
      <div className="basis-[75vw]">
        <TrapElements
          trapElementsSkeletonState={trapElementsSkeletonState}
          setSelectClickedElementState={setSelectClickedElementState}
          ref={trapElementsRootNodeCallbackRef}
        />
      </div>
      <div className="border-grey-500 basis-[25vw] border-l-2 px-2 py-4">
        <section>
          <h2 className="text-center">{showTrapControlsState ? 'Trap Controls' : 'Element Controls'}</h2>
          {/* Toggling `displayComponent` rather than the mounting, to keep the states.
              Also using `key` to reset the states at will.*/}
          <TrapControls
            key={controlsKeysState.trap}
            trapElementsRootNodeState={trapElementsRootNodeState}
            setControlsKeysState={setControlsKeysState}
            displayComponent={showTrapControlsState}
          />
          <TrapElementControls
            key={controlsKeysState.trapElements}
            skeletonButtonsIds={skeletonButtonsIds}
            getSkeletonButtonElementById={getSkeletonButtonElementById}
            patchSkeletonButton={patchSkeletonButton}
            setSelectClickedElementState={setSelectClickedElementState}
            setControlsKeysState={setControlsKeysState}
            displayComponent={!showTrapControlsState}
          />
          <button
            onClick={() => setShowTrapControlsState((prevState) => !prevState)}
            data-cy={`Switch to ${showTrapControlsState ? 'Element' : 'Trap'} Controls`}
          >
            {showTrapControlsState ? 'Configure Elements' : 'Configure Trap'}
          </button>
        </section>
      </div>
    </div>
  );
}

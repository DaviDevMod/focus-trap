import { useState, useEffect } from 'react';

import { useSkeleton } from '../../hooks/useSkeleton';
import { TrapControls } from './trap-controls/TrapControls';
import { DemoElements } from './demo-elements/DemoElements';
import { DemoElementControls } from './demo-element-controls/DemoElementControls';

export interface SelectClickedElement {
  id: string;
  setSelectedSkeletonButtonStateById: (id: string) => void;
}

export interface ControlsKeysState {
  trap: number;
  demoElements: number;
}

const initialSelectClickedElement: SelectClickedElement = {
  id: '',
  setSelectedSkeletonButtonStateById: () => {},
};

const initialControlsKeysState: ControlsKeysState = { trap: 100, demoElements: -100 };

export function Playground() {
  const [selectClickedElementState, setSelectClickedElementState] = useState(initialSelectClickedElement);
  const [controlsKeysState, setControlsKeysState] = useState(initialControlsKeysState);
  const [showTrapControlsState, setShowTrapControlsState] = useState(true);
  const [demoElementsRootNodeState, setDemoElementsRootNodeState] = useState<HTMLDivElement>();
  const { skeletonState, skeletonButtonsIds, getSkeletonButtonById, patchSkeletonButton } = useSkeleton();

  // `setSelectedSkeletonButtonStateById` returns early if the `id` is still the same.
  useEffect(() => {
    const { id, setSelectedSkeletonButtonStateById } = selectClickedElementState;
    if (id) setSelectedSkeletonButtonStateById(id);
  }, [selectClickedElementState]);

  const demoElementsRootNodeCallbackRef = (rootNodeRef: HTMLDivElement) =>
    rootNodeRef && setDemoElementsRootNodeState(rootNodeRef);

  return (
    <div className="flex">
      <div className="basis-[75vw]">
        <DemoElements
          skeletonState={skeletonState}
          setSelectClickedElementState={setSelectClickedElementState}
          ref={demoElementsRootNodeCallbackRef}
        />
      </div>
      <div className="border-grey-500 basis-[25vw] border-l-2 px-2 py-4">
        <section>
          <h2 className="text-center">{showTrapControlsState ? 'Trap Controls' : 'Element Controls'}</h2>
          {/* Toggling `displayComponent` rather than the mounting, to keep the states.
              Also using `key` to reset the states at will.*/}
          <TrapControls
            key={controlsKeysState.trap}
            demoElementsRootNodeState={demoElementsRootNodeState}
            setControlsKeysState={setControlsKeysState}
            displayComponent={showTrapControlsState}
          />
          <DemoElementControls
            key={controlsKeysState.demoElements}
            skeletonButtonsIds={skeletonButtonsIds}
            getSkeletonButtonById={getSkeletonButtonById}
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

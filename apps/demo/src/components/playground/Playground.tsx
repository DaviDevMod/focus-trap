import { useState, useReducer } from 'react';

import { useSkeleton } from '../../hooks/useSkeleton';
import { TrapControls } from './trap-controls/TrapControls';
import { DemoElements } from './demo-elements/DemoElements';
import { DemoElementControls } from './demo-element-controls/DemoElementControls';

export interface KeysState {
  trap: number;
  buttons: number;
}

const keysReducer = (state: KeysState, action: keyof KeysState): KeysState => {
  return { ...state, [action]: state[action] + 1 };
};

const initialKeysState = { trap: 0, buttons: 0 };

export function Playground() {
  // Change components `key` to reset their states.
  const [keysState, dispatchKeys] = useReducer(keysReducer, initialKeysState);
  const [selectedButtonIdState, setSelectedButtonIdState] = useState('');
  const [showTrapControlsState, setShowTrapControlsState] = useState(true);
  const [demoElementsRootState, setDemoElementsRootState] = useState<HTMLDivElement>();
  const { skeletonState, skeletonButtonsIds, getSkeletonButtonById, patchSkeletonButton } = useSkeleton();

  const demoElementsRootCallbackRef = (rootNodeRef: HTMLDivElement) => {
    rootNodeRef && setDemoElementsRootState(rootNodeRef);
  };

  return (
    <div className="flex">
      <div className="basis-[75vw]">
        <DemoElements
          skeletonState={skeletonState}
          setSelectedButtonIdState={setSelectedButtonIdState}
          ref={demoElementsRootCallbackRef}
        />
      </div>
      <div className="border-grey-500 basis-[25vw] border-l-2 px-2 py-4">
        <section>
          <h2 className="text-center">{showTrapControlsState ? 'Trap Controls' : 'Element Controls'}</h2>
          {/* Toggling `display: none` through `displayComponent` rather than mounting/unmounting,
              to keep the states. Also using `key` to reset the states when needed.*/}
          <TrapControls
            key={keysState.trap}
            demoElementsRootState={demoElementsRootState}
            dispatchKeys={dispatchKeys}
            displayComponent={showTrapControlsState}
          />
          <DemoElementControls
            key={keysState.buttons}
            skeletonButtonsIds={skeletonButtonsIds}
            getSkeletonButtonById={getSkeletonButtonById}
            patchSkeletonButton={patchSkeletonButton}
            selectedButtonIdState={selectedButtonIdState}
            setSelectedButtonIdState={setSelectedButtonIdState}
            dispatchKeys={dispatchKeys}
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

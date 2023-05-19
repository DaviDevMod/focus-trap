'use client';

import { useState, useReducer } from 'react';
import { useSkeleton } from '../../hooks/useSkeleton';
import { TrapControls } from './trap-controls/TrapControls';
import { DemoElements } from './demo-elements/DemoElements';
import { DemoButtonControls } from './demo-button-controls/DemoButtonControls';

export interface KeysState {
  TrapControls: number;
  ButtonControls: number;
}

const keysReducer = (state: KeysState, action: keyof KeysState): KeysState => {
  return { ...state, [action]: state[action] + 1 };
};

const initialKeysState = { TrapControls: 0, ButtonControls: 0 };

export function Playground() {
  // Change components `key` to reset their states.
  const [keysState, dispatchKeys] = useReducer(keysReducer, initialKeysState);
  const [showTrapControlsState, setShowTrapControlsState] = useState(true);
  const [demoElementsRootState, setDemoElementsRootState] = useState<HTMLDivElement>();
  const [rootsToHighlightState, setRootsToHighlightState] = useState<string[]>([]);
  const [selectedButtonIdState, setSelectedButtonIdState] = useState('');
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
          rootsToHighlightState={rootsToHighlightState}
        />
      </div>
      <div className="border-grey-500 basis-[25vw] border-l-2 px-2 py-4">
        <section>
          <h2 className="text-center">{showTrapControlsState ? 'Trap Controls' : 'Button Controls'}</h2>
          {/* Toggling `display: none` through `displayComponent` rather than mounting/unmounting,
              to keep the states. Also using `key` to reset the states when needed.*/}
          <TrapControls
            key={`TrapControls${keysState.TrapControls}`}
            demoElementsRootState={demoElementsRootState}
            dispatchKeys={dispatchKeys}
            displayComponent={showTrapControlsState}
            setRootsToHighlightState={setRootsToHighlightState}
          />
          <DemoButtonControls
            key={`ButtonControls${keysState.ButtonControls}`}
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
            data-cy={`Switch to ${showTrapControlsState ? 'Button' : 'Trap'} Controls`}
          >
            {showTrapControlsState ? 'Configure Buttons' : 'Configure Trap'}
          </button>
        </section>
      </div>
    </div>
  );
}

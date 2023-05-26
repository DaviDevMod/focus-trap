'use client';

import { useEffect, useState, useReducer } from 'react';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/20/solid';

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
  const [lastTrapEscapeState, setLastTrapEscapeState] = useState(false);
  const [rootsToHighlightState, setRootsToHighlightState] = useState<string[]>([]);
  const [selectedButtonIdState, setSelectedButtonIdState] = useState('');
  const { skeletonState, skeletonButtonsIds, getSkeletonButtonById, patchSkeletonButton } = useSkeleton();

  // Update UI to reflect that the focus trap is demolished after an `Esc` key press.
  useEffect(() => {
    const escHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
        if (lastTrapEscapeState) setRootsToHighlightState([]);
      }
    };

    document.addEventListener('keydown', escHandler);
    return () => document.removeEventListener('keydown', escHandler);
  }, [lastTrapEscapeState]);

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
      <div className="border-grey-500 basis-[25vw] border-l-2 px-2">
        <section>
          <h2 className="my-4">
            <button
              onClick={() => setShowTrapControlsState((prevState) => !prevState)}
              className="flex w-full items-center justify-between whitespace-nowrap rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 hover:bg-gradient-to-l hover:font-medium hover:text-white"
            >
              <ArrowPathRoundedSquareIcon className="h-4 w-4 text-amber-950" aria-hidden="true" />
              {showTrapControlsState ? 'Trap Controls' : 'Button Controls'}
              <ArrowPathRoundedSquareIcon className="h-4 w-4 text-amber-950" aria-hidden="true" />
            </button>
          </h2>
          {/* Toggling `display: none` through `displayComponent` rather than mounting/unmounting,
              to keep the states. Also using `key` to reset the states when needed.*/}
          <TrapControls
            key={`TrapControls${keysState.TrapControls}`}
            demoElementsRootState={demoElementsRootState}
            dispatchKeys={dispatchKeys}
            displayComponent={showTrapControlsState}
            setLastTrapEscapeState={setLastTrapEscapeState}
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
        </section>
      </div>
    </div>
  );
}

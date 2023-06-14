'use client';

import { useEffect, useState } from 'react';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/20/solid';

import { useSkeleton } from '../../hooks/useSkeleton';
import { TrapControls } from './trap-controls/TrapControls';
import { DemoElements } from './demo-elements/DemoElements';
import { DemoButtonControls } from './demo-button-controls/DemoButtonControls';

// Basically `TrapConfig` from '@davidevmod/focus-trap', but with types dictated by the inputs in the demo.
// The boolean values of `initialFocus` and `returnFocus` are being stored as strings and
// converted to actual booleans only once, right before to feed the config to `focusTrap`.
export interface DemoTrapConfig {
  roots: string[];
  initialFocus: string;
  returnFocus: string;
  lock: boolean;
  escape: boolean;
}

export interface DemoTrapState {
  isBuilt: boolean;
  trapConfig: DemoTrapConfig;
}

const initialTrapConfig: DemoTrapConfig = {
  roots: [],
  initialFocus: 'true',
  returnFocus: 'true',
  lock: true,
  escape: true,
};

const initialDemoTrapState: DemoTrapState = {
  isBuilt: false,
  trapConfig: initialTrapConfig,
};

export function Playground() {
  const [showTrapControlsState, setShowTrapControlsState] = useState(true);
  const [demoElementsRootState, setDemoElementsRootState] = useState<HTMLDivElement>();
  const [lastDemoTrapState, setLastDemoTrapState] = useState(initialDemoTrapState);
  const [rootsToHighlightState, setRootsToHighlightState] = useState<string[]>([]);
  const [selectedButtonIdState, setSelectedButtonIdState] = useState('');
  const { skeletonState, skeletonButtonsIds, getSkeletonButtonById, patchSkeletonButton } = useSkeleton();

  useEffect(() => {
    const escHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
        if (lastDemoTrapState.trapConfig.escape) {
          // If a trap is in "PAUSE", the `Esc` key press is ignored and the trap is "RESUME"able.
          // But here there is no whay to know if the trap is in "PAUSE",
          // and we chose to throw away the state, losing the ability to highlight a "RESUME"d trap
          // rather than risking to highlight an inexistent trap (after a failed "RESUME").
          // TODO: fix this.
          setLastDemoTrapState(initialDemoTrapState);

          setRootsToHighlightState([]);
        }
      }
    };

    document.addEventListener('keydown', escHandler);
    return () => document.removeEventListener('keydown', escHandler);
  }, [lastDemoTrapState.trapConfig.escape]);

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
              className="flex w-full items-center justify-between whitespace-nowrap rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 hover:bg-gradient-to-l hover:text-white"
            >
              <ArrowPathRoundedSquareIcon className="h-4 w-4 text-amber-950" aria-hidden="true" />
              <span className="px-2">{showTrapControlsState ? 'Trap Controls' : 'Button Controls'}</span>
              <ArrowPathRoundedSquareIcon className="h-4 w-4 text-amber-950" aria-hidden="true" />
            </button>
          </h2>
          <TrapControls
            demoElementsRootState={demoElementsRootState}
            displayComponent={showTrapControlsState}
            lastDemoTrapState={lastDemoTrapState}
            setLastDemoTrapState={setLastDemoTrapState}
            setRootsToHighlightState={setRootsToHighlightState}
          />
          <DemoButtonControls
            skeletonButtonsIds={skeletonButtonsIds}
            getSkeletonButtonById={getSkeletonButtonById}
            patchSkeletonButton={patchSkeletonButton}
            selectedButtonIdState={selectedButtonIdState}
            setSelectedButtonIdState={setSelectedButtonIdState}
            displayComponent={!showTrapControlsState}
          />
        </section>
      </div>
    </div>
  );
}

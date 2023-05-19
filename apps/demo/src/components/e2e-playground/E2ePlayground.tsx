'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { focusTrap } from '@davidevmod/focus-trap';

import { useSkeleton } from '../../hooks/useSkeleton';
import { DemoElements } from '../playground/demo-elements/DemoElements';

export function E2ePlayground() {
  const { skeletonState } = useSkeleton();
  const searchParams = useSearchParams();

  // Using `useEffect` to call `focusTrap` only after `<DemoElements>` is rendered.
  useEffect(() => {
    // https://docs.cypress.io/api/commands/window#Start-tests-when-app-is-ready
    // https://github.com/cypress-io/cypress/issues/3924#issuecomment-481430796
    // @ts-ignore
    if (global.window?.Cypress) {
      // @ts-ignore
      window.appReady = true;
    }

    // Getting the argument for `focusTrap` from `searchParams`.
    const arg = searchParams.get('arg');

    if (!arg) throw new Error('Need to provide a "arg" URLSearchParam.');

    // Not going to `try/catch` nor try to make it typesafe. Let it throw.
    const trapArg = JSON.parse(decodeURIComponent(arg));

    focusTrap(trapArg);

    return () => {
      focusTrap('DEMOLISH');
    };
  }, [searchParams]);

  return (
    <DemoElements
      skeletonState={skeletonState}
      setSelectedButtonIdState={(s) => s}
      ref={() => null}
      rootsToHighlightState={[]}
    />
  );
}

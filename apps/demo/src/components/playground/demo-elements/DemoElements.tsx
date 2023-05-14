import { forwardRef } from 'react';

import type { SkeletonButton, SkeletonGroup } from '../../../hooks/useSkeleton';

interface DemoElementsProps {
  skeletonState: SkeletonGroup;
  setSelectedButtonIdState: React.Dispatch<React.SetStateAction<string>>;
}

export const DemoElements = forwardRef(function DemoElements(
  { skeletonState, setSelectedButtonIdState }: DemoElementsProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const { id: rootId, children: rootChildren } = skeletonState;

  // const handleButtonClick = (event) => "It's in the JSX for convinience"

  return (
    <div id={rootId} ref={ref}>
      <span className="ml-3 text-indigo-700">. . .</span>
      <span className="mx-2 inline-block w-[30vw] border border-indigo-700 sm:w-[50vw]" />
      <span className="text-indigo-700">. . .</span>
      <span className="absolute left-[16vw] top-1.5 rounded-lg bg-white bg-opacity-80 px-2 text-xs sm:left-16 sm:text-sm">
        {rootId}
      </span>
      {rootChildren.map((group) => (
        <div
          key={group.id}
          id={group.id}
          className="relative mx-[2.5vw] my-[5vw] table border border-green-400 sm:my-8"
        >
          <span className="absolute -top-3 left-4 rounded-lg bg-white bg-opacity-80 px-2 text-xs sm:text-sm">
            {group.id}
          </span>
          {(group.children as SkeletonButton[]).map(
            ({ id, tabIndex, order, forward, backward, parentId, disabled, display }) => (
              <button
                key={id}
                id={id}
                tabIndex={parseInt(tabIndex)}
                data-order={order}
                data-forward={forward}
                data-backward={backward}
                data-parent-id={parentId}
                disabled={disabled}
                onClick={() => setSelectedButtonIdState(id)}
                className={`${
                  display ? 'inline-block' : 'hidden'
                } relative m-[1.8vw] h-[10vw] w-[10vw] rounded border border-indigo-500 text-sm font-medium text-gray-500 transition hover:scale-110 hover:shadow-xl focus:scale-110 focus:text-indigo-600 focus:shadow-xl focus:outline-none focus:ring-1 sm:m-3 sm:h-16 sm:w-16`}
              >
                <span className="absolute left-1 top-0 text-xs text-gray-500">{id}</span>
                {tabIndex}
              </button>
            )
          )}
        </div>
      ))}
    </div>
  );
});

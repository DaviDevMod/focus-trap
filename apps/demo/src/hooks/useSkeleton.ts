import { useState } from 'react';

export type SkeletonButton = {
  id: string;
  tabIndex: string;
  parentId: string;
  disabled: boolean;
  display: boolean;
} & (
  | { order: number; forward?: never; backward?: never }
  | {
      order?: never;
      forward: number;
      backward: number;
    }
);

export type SkeletonGroup = { id: string; children: SkeletonElement[] };

// A `SkeletonElement` is either a `SkeletonButton` or a `SkeletonGroup`
type SkeletonElement =
  | (SkeletonButton & { children?: never })
  | (SkeletonGroup & Partial<Record<Exclude<keyof SkeletonButton, 'id'>, never>>);

const isSkeletonButton = (el: SkeletonElement): el is SkeletonButton => !('children' in el);

const isSkeletonGroup = (el: SkeletonElement): el is SkeletonGroup => 'children' in el;

const initialSkeletonState: SkeletonGroup = {
  id: 'group 0',
  children: [
    {
      id: 'group 1',
      children: [
        { id: 'A', tabIndex: '1', forward: 0, backward: 6, parentId: 'group 1', disabled: false, display: true },
        { id: 'B', tabIndex: '0', forward: 3, backward: 2, parentId: 'group 1', disabled: false, display: true },
        { id: 'C', tabIndex: '-1', forward: 2, backward: 6, parentId: 'group 1', disabled: false, display: true },
      ],
    },
    {
      id: 'group 2',
      children: [
        { id: 'D', tabIndex: '2', order: 2, parentId: 'group 2', disabled: false, display: true },
        { id: 'E', tabIndex: '1', order: 0, parentId: 'group 2', disabled: false, display: true },
        { id: 'F', tabIndex: '0', order: 3, parentId: 'group 2', disabled: false, display: true },
        { id: 'G', tabIndex: '0', order: 4, parentId: 'group 2', disabled: false, display: true },
        { id: 'H', tabIndex: '0', order: 5, parentId: 'group 2', disabled: false, display: true },
      ],
    },
    {
      id: 'group 3',
      children: [
        { id: 'I', tabIndex: '1', forward: 1, backward: 0, parentId: 'group 3', disabled: false, display: true },
        { id: 'J', tabIndex: '0', forward: 6, backward: 5, parentId: 'group 3', disabled: false, display: true },
        { id: 'K', tabIndex: '-1', forward: 1, backward: 5, parentId: 'group 3', disabled: false, display: true },
      ],
    },
    {
      id: 'group 4',
      children: [
        { id: 'L', tabIndex: '-1', forward: 1, backward: 5, parentId: 'group 4', disabled: false, display: true },
        { id: 'M', tabIndex: '1', order: 1, parentId: 'group 4', disabled: false, display: true },
        { id: 'N', tabIndex: '-1', forward: 6, backward: 1, parentId: 'group 4', disabled: false, display: true },
        { id: 'O', tabIndex: '0', order: 6, parentId: 'group 4', disabled: false, display: true },
        { id: 'P', tabIndex: '-1', forward: 2, backward: 6, parentId: 'group 4', disabled: false, display: true },
      ],
    },
    {
      id: 'group 5',
      children: [
        { id: 'Q', tabIndex: '1', forward: 2, backward: 1, parentId: 'group 5', disabled: false, display: true },
        { id: 'R', tabIndex: '0', forward: 0, backward: 6, parentId: 'group 5', disabled: false, display: true },
        { id: 'S', tabIndex: '-1', forward: 2, backward: 6, parentId: 'group 5', disabled: false, display: true },
      ],
    },
  ],
};

export function useSkeleton() {
  const [skeletonState, setSkeletonState] = useState(initialSkeletonState);

  const forSomeElementInSkeleton = (
    callback: (el: SkeletonElement) => void,
    filter = (_el: SkeletonElement): boolean => true
  ) => {
    const recursivelyCallback = (el: SkeletonElement) => {
      if (filter(el)) callback(el);
      if (isSkeletonGroup(el)) el.children.forEach((child) => recursivelyCallback(child));
    };
    recursivelyCallback(skeletonState);
  };

  const mapFilterSkeleton = <T>(map: (el: SkeletonElement) => T, filter = (_el: SkeletonElement): boolean => true) => {
    const mapFilter: T[] = [];
    forSomeElementInSkeleton((el) => mapFilter.push(map(el)), filter);
    return mapFilter;
  };

  const skeletonButtonsIds = mapFilterSkeleton((el) => el.id, isSkeletonButton);

  // Relying on "noUncheckedIndexedAccess" to have the return type inferred with an `| undefined`.
  const getSkeletonElementById = <T extends SkeletonElement>(
    id: string,
    narrowT?: (el: SkeletonElement) => el is T
  ) => {
    const found = mapFilterSkeleton(
      (el) => el as T,
      (el) => el.id === id && (!narrowT || narrowT(el))
    );
    if (found.length > 1) throw new Error('Two or more elements in the skeleton have the same `id`.\n' + found);
    return found[0];
  };

  const getSkeletonButtonById = (id: string) => getSkeletonElementById(id, isSkeletonButton);

  const patchSkeletonButton = (patch: SkeletonButton) => {
    const id = patch.id;

    const toPatch = getSkeletonElementById(id, isSkeletonButton);

    if (!toPatch) throw new Error('The skeleton has no buttons with an id of: ' + id);

    const parent = getSkeletonElementById(toPatch.parentId, isSkeletonGroup);

    if (!parent) throw new Error('The skeleton has a button with an incorrect parentId: ' + toPatch);

    const patchIndex = parent.children.findIndex((el) => el.id === id);

    if (patchIndex === -1) throw new Error(`The kinship between ${toPatch} and ${parent} is faulty.`);

    parent.children[patchIndex] = patch;

    setSkeletonState(({ id, children }) => ({
      id,
      children:
        children.slice().splice(
          children.findIndex((el) => el.id === parent.id),
          1,
          parent
        ) && children,
    }));
  };

  return { skeletonState, skeletonButtonsIds, getSkeletonButtonById, patchSkeletonButton };
}

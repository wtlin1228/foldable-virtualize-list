import { useCallback, useMemo, useState } from "react";

type Entry = {
  content: string;
  time: number;
};

type Group = {
  index: number;
  name: string;
  isExpanded: boolean;
  firstEntryIndex: number;
  entryCount: number;
};

type Row =
  | {
      type: "group";
      data: Group;
    }
  | {
      type: "entry";
      data: Entry;
    };

export class SegmentTreeNode {
  constructor(
    public value: number,
    // INFO: interval defining the range for this node is [left, right), where left is inclusive and right is exclusive
    private _interval: [number, number],
    private _leftChild: null | SegmentTreeNode = null,
    private _rightChild: null | SegmentTreeNode = null,
  ) {
    if (!this.isLeaf) {
      const { left, mid, right } = this;
      const [leftChild, rightChild] = [this._leftChild, this.rightChild];
      if (
        !!leftChild &&
        !(left === leftChild.left && mid === leftChild.right)
      ) {
        throw new Error(
          "The left child interval is inconsistent with it parent node",
        );
      }

      if (
        !!rightChild &&
        !(mid === rightChild.left && right === rightChild.right)
      ) {
        throw new Error(
          "The right child interval is inconsistent with it parent node",
        );
      }
    }
  }

  get left() {
    return this._interval[0];
  }

  get right() {
    return this._interval[1];
  }

  get mid() {
    return (this._interval[0] + this._interval[1]) / 2;
  }

  get isLeaf() {
    return this._interval[1] - this._interval[0] === 1;
  }

  get index() {
    if (!this.isLeaf) {
      throw new Error("Try accessing the index of an internal tree node.");
    }

    return this._interval[0];
  }

  public get leftChild() {
    if (this.isLeaf) {
      throw new Error("Try accessing the left child of a leaf node.");
    }

    if (this._leftChild === null) {
      const { left, mid } = this;
      this._leftChild = new SegmentTreeNode(0, [left, mid]);
    }

    return this._leftChild;
  }

  public get rightChild() {
    if (this.isLeaf) {
      throw new Error("Try accessing the right child of a leaf node.");
    }

    if (this._rightChild === null) {
      const { right, mid } = this;
      this._rightChild = new SegmentTreeNode(0, [mid, right]);
    }

    return this._rightChild;
  }
}

export class SegmentTree {
  private root: SegmentTreeNode;
  private get capacity() {
    const { right, left } = this.root;
    return right - left;
  }
  private length: number;

  constructor() {
    this.root = new SegmentTreeNode(0, [0, 1]);
    this.length = 0;
  }

  static updateIndex(
    node: SegmentTreeNode,
    index: number,
    value: number,
  ): void {
    if (node.isLeaf) {
      node.value = value;
      return;
    }

    const { left, right, mid } = node;

    if (left <= index && index < mid) {
      SegmentTree.updateIndex(node.leftChild, index, value);
    }

    if (mid <= index && index < right) {
      SegmentTree.updateIndex(node.rightChild, index, value);
    }

    node.value = node.leftChild.value + node.rightChild.value;
  }

  /**
   * allocate makes its capacity twice the original capacity
   * time complexity: O(1)
   */
  private allocate(): void {
    const leftChild = this.root;
    const capacity = 2 * this.capacity;
    this.root = new SegmentTreeNode(leftChild.value, [0, capacity], leftChild);
  }

  // time complexity: O(log n)
  public add(value: number): void {
    if (this.length === this.capacity) {
      this.allocate();
    }
    this.set(this.length, value);
    this.length += 1;
  }

  // time complexity: O(log n)
  public set(index: number, value: number): void {
    if (index > this.capacity - 1) {
      throw new Error(
        `not enough capacity, capacity: ${this.capacity}, index: ${index}`,
      );
    }
    SegmentTree.updateIndex(this.root, index, value);
  }

  // time complexity: O(log n)
  public query(value: number): { index: number; offset: number } {
    let remaining = value;
    let node = this.root;
    while (!node.isLeaf) {
      if (remaining >= node.leftChild.value) {
        remaining -= node.leftChild.value;
        node = node.rightChild;
      } else {
        node = node.leftChild;
      }
    }
    return {
      index: node.index,
      offset: remaining,
    };
  }
}

export class EntryGroup {
  private entries: Entry[];
  private groups: Group[];
  private segmentTree: SegmentTree;
  private groupDuration: number;
  private visibleItemCount: number;

  constructor(segmentTree: SegmentTree, groupDuration: number) {
    this.entries = [];
    this.groups = [];
    this.segmentTree = segmentTree;
    this.groupDuration = groupDuration;
    this.visibleItemCount = 0;
  }

  private appendNewGroup(entry: Entry, firstEntryIndex: number): void {
    const newGroup = {
      index: this.groups.length,
      name: entry.time.toString(),
      isExpanded: false,
      firstEntryIndex,
      entryCount: 1,
    };
    this.groups.push(newGroup);
    this.segmentTree.add(1);
  }

  private assertGroupExist(groupIndex: number): void {
    if (groupIndex > this.groups.length - 1) {
      throw new Error(`group doesn't exist, groupIndex: ${groupIndex}`);
    }
  }

  private getLastGroup(): Group {
    this.assertGroupExist(this.groups.length - 1);
    return this.groups[this.groups.length - 1];
  }

  public getGroup(groupIndex: number): Group {
    this.assertGroupExist(groupIndex);
    return this.groups[groupIndex];
  }

  private assertEntryExist(entryIndex: number): void {
    if (entryIndex > this.entries.length - 1) {
      throw new Error(`entry doesn't exist, entryIndex: ${entryIndex}`);
    }
  }

  private getLastEntry(): Entry {
    this.assertEntryExist(this.entries.length - 1);
    return this.entries[this.entries.length - 1];
  }

  public getEntry(entryIndex: number): Entry {
    this.assertEntryExist(entryIndex);
    return this.entries[entryIndex];
  }

  public getVisibleItemCount(): number {
    return this.visibleItemCount;
  }

  private syncLastGroupIfNeeded(): void {
    const group = this.getLastGroup();
    if (group.isExpanded) {
      this.segmentTree.set(this.groups.length - 1, 1 + group.entryCount);
    }
  }

  public foldGroup(groupIndex: number): void {
    const group = this.getGroup(groupIndex);
    if (!group.isExpanded) {
      return;
    }
    group.isExpanded = false;
    this.visibleItemCount -= group.entryCount;
    this.segmentTree.set(groupIndex, 1);
  }

  public expandGroup(groupIndex: number): void {
    const group = this.getGroup(groupIndex);
    if (group.isExpanded) {
      return;
    }
    group.isExpanded = true;
    this.visibleItemCount += group.entryCount;
    this.segmentTree.set(groupIndex, 1 + group.entryCount);
  }

  public appendEntries(newEntries: Entry[]): void {
    if (newEntries.length === 0) {
      return;
    }

    let i = 0;
    const nextEntryIndex = this.entries.length;

    if (nextEntryIndex === 0) {
      this.appendNewGroup(newEntries[0], 0);
      this.entries.push(newEntries[0]);
      this.visibleItemCount += 1;
      i += 1;
    }

    while (i < newEntries.length) {
      const newEntry = newEntries[i];
      const lastEntry = this.getLastEntry();

      if (newEntry.time < lastEntry.time) {
        throw new Error(
          `newer entry time can't be earlier than previous entry`,
        );
      }

      const canMergeIntoLastGroup =
        newEntry.time <= lastEntry.time + this.groupDuration;

      if (canMergeIntoLastGroup) {
        const lastGroup = this.getLastGroup();
        lastGroup.entryCount += 1;
        if (lastGroup.isExpanded) {
          this.visibleItemCount += 1;
        }
      } else {
        this.syncLastGroupIfNeeded();
        this.appendNewGroup(newEntry, nextEntryIndex + i);
        this.visibleItemCount += 1;
      }

      this.entries.push(newEntry);
      i += 1;
    }

    this.syncLastGroupIfNeeded();
  }

  public queryByVisibleIndex(index: number): {
    groupIndex: number;
    offset: number;
  } {
    const { index: groupIndex, offset } = this.segmentTree.query(index);
    return {
      groupIndex,
      offset, // 0 for group, 1 for the first entry, 2 for the second entry, ...
    };
  }
}

export const useEntryGroup = (groupDuration: number) => {
  // to force rerender after the internal data updated
  const [, dummy] = useState({});
  const forceRerender = useCallback(() => dummy({}), []);

  const entryGroup = useMemo(() => {
    return new EntryGroup(new SegmentTree(), groupDuration);
  }, []);

  return useMemo(
    () => ({
      fold: (groupIndex: number) => {
        entryGroup.foldGroup(groupIndex);
        forceRerender();
      },
      expand: (groupIndex: number) => {
        entryGroup.expandGroup(groupIndex);
        forceRerender();
      },
      append: (more: Entry[]) => {
        entryGroup.appendEntries(more);
        forceRerender();
      },
      getVisibleItemCount: () => {
        return entryGroup.getVisibleItemCount();
      },
      getRowsByIndexes: (indexes: number[]): Row[] => {
        const rows: Row[] = [];
        if (indexes.length === 0) {
          return rows;
        }
        let { groupIndex, offset } = entryGroup.queryByVisibleIndex(indexes[0]);
        for (let i = 0; i < indexes.length; i++) {
          const group = entryGroup.getGroup(groupIndex);

          if (offset === 0) {
            rows.push({
              type: "group",
              data: group,
            });

            if (group.isExpanded) {
              offset += 1;
            } else {
              groupIndex += 1;
            }
          } else {
            rows.push({
              type: "entry",
              data: entryGroup.getEntry(group.firstEntryIndex + offset - 1),
            });

            offset += 1;

            if (offset > group.entryCount) {
              offset = 0;
              groupIndex += 1;
            }
          }
        }
        return rows;
      },
    }),
    [entryGroup],
  );
};

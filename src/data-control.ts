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
  public value: number;
  public left: null | SegmentTreeNode;
  public right: null | SegmentTreeNode;

  constructor(
    value: number = 0,
    left: null | SegmentTreeNode = null,
    right: null | SegmentTreeNode = null
  ) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

export class SegmentTree {
  private root: SegmentTreeNode;
  private capacity: number;
  private length: number;

  constructor() {
    this.root = new SegmentTreeNode();
    this.capacity = 1;
    this.length = 0;
  }

  static createEmptyTree(depth: number): null | SegmentTreeNode {
    if (depth === 0) {
      return null;
    }

    return new SegmentTreeNode(
      0,
      SegmentTree.createEmptyTree(depth - 1),
      SegmentTree.createEmptyTree(depth - 1)
    );
  }

  static updateIndex(
    node: SegmentTreeNode,
    capacity: number,
    index: number,
    value: number
  ): void {
    if (capacity === 1) {
      if (node.left !== null && node.right !== null) {
        throw new Error(
          `can only update the value of leaf node, not the value of intermediate segment node`
        );
      }
      node.value = value;
      return;
    }

    if (node.left === null || node.right === null) {
      throw new Error(
        `intermediate segment node must have left and right children`
      );
    }

    if (index < capacity / 2) {
      SegmentTree.updateIndex(node.left, capacity / 2, index, value);
    } else {
      SegmentTree.updateIndex(
        node.right,
        capacity / 2,
        index - capacity / 2,
        value
      );
    }

    node.value = node.left.value + node.right.value;
  }

  /**
   * allocate makes its capacity twice the original capacity
   */
  private allocate(): void {
    // make an empty tree in the same capacity
    const depth = Math.log2(this.capacity);
    const emptyTree = SegmentTree.createEmptyTree(depth + 1);
    this.root = new SegmentTreeNode(this.root.value, this.root, emptyTree);
    this.capacity *= 2;
  }

  // time complexity: amortized O(log n)
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
        `not enough capacity, capacity: ${this.capacity}, index: ${index}`
      );
    }
    SegmentTree.updateIndex(this.root, this.capacity, index, value);
  }

  // time complexity: O(log n)
  public query(value: number): { index: number; offset: number } {
    let remaining = value;
    let node = this.root;
    let depth = Math.log2(this.capacity);
    let index = 0;
    while (depth > 0) {
      if (remaining >= node.left!.value) {
        remaining -= node.left!.value;
        node = node.right!;
        index += Math.pow(2, depth - 1);
      } else {
        node = node.left!;
      }
      depth -= 1;
    }
    return {
      index,
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
          `newer entry time can't be earlier than previous entry`
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

export const useEntryGroup = () => {
  // to force rerender after the internal data updated
  const [, dummy] = useState({});
  const forceRerender = useCallback(() => dummy({}), []);

  const entryGroup = useMemo(() => {
    return new EntryGroup(new SegmentTree(), 2);
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
    [entryGroup]
  );
};

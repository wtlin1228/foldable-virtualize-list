import { useCallback, useMemo, useRef, useState } from "react";

const GROUP_DURATION = 2;

type Entry = {
  content: string;
  time: number;
};

type Group = {
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

class SegmentTreeNode {}

class SegmentTree {
  private root: null | SegmentTreeNode;

  constructor() {
    this.root = null;
  }

  add(value: number) {
    throw new Error("not implemented");
  }

  set(index: number, value: number) {
    throw new Error("not implemented");
  }

  search(value: number): { index: number; offset: number } {
    throw new Error("not implemented");
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
      name: entry.time.toString(),
      isExpanded: false,
      firstEntryIndex,
      entryCount: 1,
    };
    this.groups.push(newGroup);
    this.segmentTree.add(1);
  }

  private syncLastGroupIfNeeded(): void {
    const prevGroup = this.groups[this.groups.length - 1];
    if (prevGroup.isExpanded) {
      this.segmentTree.set(this.groups.length - 1, prevGroup.entryCount);
    }
  }

  private assertGroupExist(groupIndex: number): void {
    if (groupIndex > this.groups.length - 1) {
      throw new Error(
        `failed to fold group(${groupIndex}) since the maximum group index is ${
          this.groups.length - 1
        }`
      );
    }
  }

  private getLastGroup(): Group {
    this.assertGroupExist(this.groups.length - 1);
    return this.groups[this.groups.length - 1];
  }

  private getGroup(groupIndex: number): Group {
    this.assertGroupExist(groupIndex);
    return this.groups[groupIndex];
  }

  private getLastEntry(): Entry {
    return this.entries[this.entries.length - 1];
  }

  public getVisibleItemCount(): number {
    return this.visibleItemCount;
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
    group.isExpanded = false;
    this.visibleItemCount += group.entryCount;
    this.segmentTree.set(groupIndex, 1 + group.entryCount);
  }

  public appendEntries(newEntries: Entry[]): void {
    let i = 0;
    const nextEntryIndex = this.entries.length;

    if (nextEntryIndex === 0) {
      this.appendNewGroup(newEntries[0], 0);
      this.entries.push(newEntries[0]);
      i += 1;
    }

    while (i < newEntries.length) {
      const newEntry = newEntries[i];

      const canMergeIntoLastGroup =
        newEntry.time < this.getLastEntry().time + this.groupDuration;

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
}

export const useDataControl = () => {
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
      getDataCount: () => {
        return entryGroup.getVisibleItemCount();
      },
      getRowByIndex: (idx: number): Row => {
        return { type: "entry", data: { content: "fake content", time: 1 } };
      },
    }),
    [entryGroup]
  );
};

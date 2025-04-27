import { useRef, useState } from "react";

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

const createGroupFromEntry = (entry: Entry, firstEntryIndex: number): Group => {
  return {
    name: entry.time.toString(),
    isExpanded: false,
    firstEntryIndex,
    entryCount: 1,
  };
};

class SegmentTree {}

class EntryGroup {
  private entries: Entry[];
  private groups: Group[];
  private segmentTree: SegmentTree;
  private groupDuration: number;

  constructor(segmentTree: SegmentTree, groupDuration: number) {
    this.entries = [];
    this.groups = [];
    this.segmentTree = segmentTree;
    this.groupDuration = groupDuration;
  }

  appendEntries(newEntries: Entry[]): void {
    let prevEntryTime: number =
      this.entries.length === 0
        ? -Infinity
        : this.entries[this.entries.length - 1].time;

    for (let i = 0; i < newEntries.length; i++) {
      const newEntry = newEntries[i];
      if (newEntry.time < prevEntryTime + this.groupDuration) {
        this.groups[this.groups.length - 1].entryCount += 1;
        this.segmentTree.set(groupIndex, group.entryCount);
      } else {
        const newGroup = createGroupFromEntry(
          newEntry,
          this.entries.length - 1 + i
        );
        this.groups.push(newGroup);
        this.segmentTree.add(group);
      }
      prevEntryTime = newEntry.time;
    }

    this.entries.push(...newEntries);
  }
}

export const useDataControl = () => {
  const [count, setCount] = useState(0);

  // use ref to avoid copying array
  const entriesRef = useRef<Entry[]>([]);
  const groupsRef = useRef<Group[]>([]);

  return {
    append: (more: Entry[]) => {
      const currentEntriesCount = entriesRef.current.length;
      let prevEntryTime: number =
        currentEntriesCount === 0
          ? -Infinity
          : entriesRef.current[currentEntriesCount - 1].time;

      for (const entry of more) {
        if (entry.time < prevEntryTime + GROUP_DURATION) {
        }
        prevEntryTime = entry.time;
      }

      // keep those entries in memory
      entriesRef.current.push(...more);
    },
    getDataCount: () => count,
    getRowByIndex: (idx: number): Row => {
      return { type: "entry", data: { content: "fake content", time: 1 } };
    },
  };
};

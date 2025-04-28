import { EntryGroup, SegmentTree } from "../data-control";

it("works", () => {
  const entryGroup = new EntryGroup(new SegmentTree(), 2);

  entryGroup.appendEntries([
    // first group
    {
      content: "mock entry content 1",
      time: 3,
    },
    {
      content: "mock entry content 2",
      time: 3,
    },
    {
      content: "mock entry content 3",
      time: 3,
    },
    {
      content: "mock entry content 4",
      time: 4,
    },
    // second group
    {
      content: "mock entry content 5",
      time: 6.5,
    },
    {
      content: "mock entry content 6",
      time: 7,
    },
    {
      content: "mock entry content 7",
      time: 7,
    },
    {
      content: "mock entry content 8",
      time: 8,
    },
    {
      content: "mock entry content 9",
      time: 9,
    },
    {
      content: "mock entry content 10",
      time: 10,
    },
    // third group
    {
      content: "mock entry content 11",
      time: 20,
    },
    {
      content: "mock entry content 12",
      time: 20,
    },
    {
      content: "mock entry content 13",
      time: 20,
    },
    {
      content: "mock entry content 14",
      time: 20,
    },
    {
      content: "mock entry content 15",
      time: 20,
    },
  ]);

  expect(entryGroup.getGroup(0)).toStrictEqual({
    index: 0,
    name: "3",
    isExpanded: false,
    firstEntryIndex: 0,
    entryCount: 4,
  });
  expect(entryGroup.getGroup(1)).toStrictEqual({
    index: 1,
    name: "6.5",
    isExpanded: false,
    firstEntryIndex: 4,
    entryCount: 6,
  });
  expect(entryGroup.getGroup(2)).toStrictEqual({
    index: 2,
    name: "20",
    isExpanded: false,
    firstEntryIndex: 10,
    entryCount: 5,
  });

  expect(entryGroup.getVisibleItemCount()).toBe(3);
  expect(entryGroup.queryByVisibleIndex(0)).toStrictEqual({
    groupIndex: 0,
    offset: 0,
  });
  expect(entryGroup.queryByVisibleIndex(1)).toStrictEqual({
    groupIndex: 1,
    offset: 0,
  });
  expect(entryGroup.queryByVisibleIndex(2)).toStrictEqual({
    groupIndex: 2,
    offset: 0,
  });

  // expand the first group
  entryGroup.expandGroup(0);
  expect(entryGroup.getGroup(0)).toStrictEqual({
    index: 0,
    name: "3",
    isExpanded: true,
    firstEntryIndex: 0,
    entryCount: 4,
  });
  expect(entryGroup.getVisibleItemCount()).toBe(7);
  expect(entryGroup.queryByVisibleIndex(0)).toStrictEqual({
    groupIndex: 0,
    offset: 0,
  });
  expect(entryGroup.queryByVisibleIndex(1)).toStrictEqual({
    groupIndex: 0,
    offset: 1,
  });
  expect(entryGroup.queryByVisibleIndex(2)).toStrictEqual({
    groupIndex: 0,
    offset: 2,
  });
  expect(entryGroup.queryByVisibleIndex(3)).toStrictEqual({
    groupIndex: 0,
    offset: 3,
  });
  expect(entryGroup.queryByVisibleIndex(4)).toStrictEqual({
    groupIndex: 0,
    offset: 4,
  });
  expect(entryGroup.queryByVisibleIndex(5)).toStrictEqual({
    groupIndex: 1,
    offset: 0,
  });
  expect(entryGroup.queryByVisibleIndex(6)).toStrictEqual({
    groupIndex: 2,
    offset: 0,
  });

  // expand the third group
  entryGroup.expandGroup(2);
  expect(entryGroup.getGroup(2)).toStrictEqual({
    index: 2,
    name: "20",
    isExpanded: true,
    firstEntryIndex: 10,
    entryCount: 5,
  });
  expect(entryGroup.getVisibleItemCount()).toBe(12);
  expect(entryGroup.queryByVisibleIndex(0)).toStrictEqual({
    groupIndex: 0,
    offset: 0,
  });
  expect(entryGroup.queryByVisibleIndex(1)).toStrictEqual({
    groupIndex: 0,
    offset: 1,
  });
  expect(entryGroup.queryByVisibleIndex(2)).toStrictEqual({
    groupIndex: 0,
    offset: 2,
  });
  expect(entryGroup.queryByVisibleIndex(3)).toStrictEqual({
    groupIndex: 0,
    offset: 3,
  });
  expect(entryGroup.queryByVisibleIndex(4)).toStrictEqual({
    groupIndex: 0,
    offset: 4,
  });
  expect(entryGroup.queryByVisibleIndex(5)).toStrictEqual({
    groupIndex: 1,
    offset: 0,
  });
  expect(entryGroup.queryByVisibleIndex(6)).toStrictEqual({
    groupIndex: 2,
    offset: 0,
  });
  expect(entryGroup.queryByVisibleIndex(7)).toStrictEqual({
    groupIndex: 2,
    offset: 1,
  });
  expect(entryGroup.queryByVisibleIndex(8)).toStrictEqual({
    groupIndex: 2,
    offset: 2,
  });
  expect(entryGroup.queryByVisibleIndex(9)).toStrictEqual({
    groupIndex: 2,
    offset: 3,
  });
  expect(entryGroup.queryByVisibleIndex(10)).toStrictEqual({
    groupIndex: 2,
    offset: 4,
  });
  expect(entryGroup.queryByVisibleIndex(11)).toStrictEqual({
    groupIndex: 2,
    offset: 5,
  });

  // fold the first group
  entryGroup.foldGroup(0);
  expect(entryGroup.getGroup(0)).toStrictEqual({
    index: 0,
    name: "3",
    isExpanded: false,
    firstEntryIndex: 0,
    entryCount: 4,
  });
  expect(entryGroup.getVisibleItemCount()).toBe(8);
  expect(entryGroup.queryByVisibleIndex(0)).toStrictEqual({
    groupIndex: 0,
    offset: 0,
  });
  expect(entryGroup.queryByVisibleIndex(1)).toStrictEqual({
    groupIndex: 1,
    offset: 0,
  });
  expect(entryGroup.queryByVisibleIndex(2)).toStrictEqual({
    groupIndex: 2,
    offset: 0,
  });
  expect(entryGroup.queryByVisibleIndex(3)).toStrictEqual({
    groupIndex: 2,
    offset: 1,
  });
  expect(entryGroup.queryByVisibleIndex(4)).toStrictEqual({
    groupIndex: 2,
    offset: 2,
  });
  expect(entryGroup.queryByVisibleIndex(5)).toStrictEqual({
    groupIndex: 2,
    offset: 3,
  });
  expect(entryGroup.queryByVisibleIndex(6)).toStrictEqual({
    groupIndex: 2,
    offset: 4,
  });
  expect(entryGroup.queryByVisibleIndex(7)).toStrictEqual({
    groupIndex: 2,
    offset: 5,
  });

  // append more entries that belong to the third group
  entryGroup.appendEntries([
    {
      content: "mock entry content 16",
      time: 20,
    },
    {
      content: "mock entry content 17",
      time: 21,
    },
    {
      content: "mock entry content 18",
      time: 22,
    },
    {
      content: "mock entry content 19",
      time: 24,
    },
    {
      content: "mock entry content 20",
      time: 26,
    },
  ]);

  expect(entryGroup.getGroup(2)).toStrictEqual({
    index: 2,
    name: "20",
    isExpanded: true,
    firstEntryIndex: 10,
    entryCount: 10,
  });
  expect(entryGroup.getVisibleItemCount()).toBe(13);
  expect(entryGroup.queryByVisibleIndex(0)).toStrictEqual({
    groupIndex: 0,
    offset: 0,
  });
  expect(entryGroup.queryByVisibleIndex(1)).toStrictEqual({
    groupIndex: 1,
    offset: 0,
  });
  expect(entryGroup.queryByVisibleIndex(2)).toStrictEqual({
    groupIndex: 2,
    offset: 0,
  });
  expect(entryGroup.queryByVisibleIndex(3)).toStrictEqual({
    groupIndex: 2,
    offset: 1,
  });
  expect(entryGroup.queryByVisibleIndex(4)).toStrictEqual({
    groupIndex: 2,
    offset: 2,
  });
  expect(entryGroup.queryByVisibleIndex(5)).toStrictEqual({
    groupIndex: 2,
    offset: 3,
  });
  expect(entryGroup.queryByVisibleIndex(6)).toStrictEqual({
    groupIndex: 2,
    offset: 4,
  });
  expect(entryGroup.queryByVisibleIndex(7)).toStrictEqual({
    groupIndex: 2,
    offset: 5,
  });
  expect(entryGroup.queryByVisibleIndex(8)).toStrictEqual({
    groupIndex: 2,
    offset: 6,
  });
  expect(entryGroup.queryByVisibleIndex(9)).toStrictEqual({
    groupIndex: 2,
    offset: 7,
  });
  expect(entryGroup.queryByVisibleIndex(10)).toStrictEqual({
    groupIndex: 2,
    offset: 8,
  });
  expect(entryGroup.queryByVisibleIndex(11)).toStrictEqual({
    groupIndex: 2,
    offset: 9,
  });
  expect(entryGroup.queryByVisibleIndex(12)).toStrictEqual({
    groupIndex: 2,
    offset: 10,
  });
});

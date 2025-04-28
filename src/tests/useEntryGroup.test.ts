import { act, renderHook } from "@testing-library/react";
import { useEntryGroup } from "../data-control";

test("works", () => {
  const { result } = renderHook(() => useEntryGroup());
  expect(result.current).toEqual(
    expect.objectContaining({
      fold: expect.any(Function),
      expand: expect.any(Function),
      append: expect.any(Function),
      getVisibleItemCount: expect.any(Function),
      getRowsByIndexes: expect.any(Function),
    })
  );

  act(() => {
    result.current.append([
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
  });

  expect(result.current.getVisibleItemCount()).toBe(3);
  expect(result.current.getRowsByIndexes([0, 1, 2])).toStrictEqual([
    {
      type: "group",
      data: {
        index: 0,
        name: "3",
        isExpanded: false,
        firstEntryIndex: 0,
        entryCount: 4,
      },
    },
    {
      type: "group",
      data: {
        index: 1,
        name: "6.5",
        isExpanded: false,
        firstEntryIndex: 4,
        entryCount: 6,
      },
    },
    {
      type: "group",
      data: {
        index: 2,
        name: "20",
        isExpanded: false,
        firstEntryIndex: 10,
        entryCount: 5,
      },
    },
  ]);

  // expand the first group
  act(() => {
    result.current.expand(0);
  });

  expect(result.current.getVisibleItemCount()).toBe(7);
  expect(result.current.getRowsByIndexes([0, 1, 2, 3, 4, 5, 6])).toStrictEqual([
    {
      type: "group",
      data: {
        index: 0,
        name: "3",
        isExpanded: true,
        firstEntryIndex: 0,
        entryCount: 4,
      },
    },
    { type: "entry", data: { content: "mock entry content 1", time: 3 } },
    { type: "entry", data: { content: "mock entry content 2", time: 3 } },
    { type: "entry", data: { content: "mock entry content 3", time: 3 } },
    { type: "entry", data: { content: "mock entry content 4", time: 4 } },
    {
      type: "group",
      data: {
        index: 1,
        name: "6.5",
        isExpanded: false,
        firstEntryIndex: 4,
        entryCount: 6,
      },
    },
    {
      type: "group",
      data: {
        index: 2,
        name: "20",
        isExpanded: false,
        firstEntryIndex: 10,
        entryCount: 5,
      },
    },
  ]);

  // expand the third group
  act(() => {
    result.current.expand(2);
  });

  expect(result.current.getVisibleItemCount()).toBe(12);
  expect(
    result.current.getRowsByIndexes([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  ).toStrictEqual([
    {
      type: "group",
      data: {
        index: 0,
        name: "3",
        isExpanded: true,
        firstEntryIndex: 0,
        entryCount: 4,
      },
    },
    { type: "entry", data: { content: "mock entry content 1", time: 3 } },
    { type: "entry", data: { content: "mock entry content 2", time: 3 } },
    { type: "entry", data: { content: "mock entry content 3", time: 3 } },
    { type: "entry", data: { content: "mock entry content 4", time: 4 } },
    {
      type: "group",
      data: {
        index: 1,
        name: "6.5",
        isExpanded: false,
        firstEntryIndex: 4,
        entryCount: 6,
      },
    },
    {
      type: "group",
      data: {
        index: 2,
        name: "20",
        isExpanded: true,
        firstEntryIndex: 10,
        entryCount: 5,
      },
    },
    {
      type: "entry",
      data: { content: "mock entry content 11", time: 20 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 12", time: 20 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 13", time: 20 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 14", time: 20 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 15", time: 20 },
    },
  ]);

  // expand the first group
  act(() => {
    result.current.fold(0);
  });

  expect(result.current.getVisibleItemCount()).toBe(8);
  expect(
    result.current.getRowsByIndexes([0, 1, 2, 3, 4, 5, 6, 7])
  ).toStrictEqual([
    {
      type: "group",
      data: {
        index: 0,
        name: "3",
        isExpanded: false,
        firstEntryIndex: 0,
        entryCount: 4,
      },
    },
    {
      type: "group",
      data: {
        index: 1,
        name: "6.5",
        isExpanded: false,
        firstEntryIndex: 4,
        entryCount: 6,
      },
    },
    {
      type: "group",
      data: {
        index: 2,
        name: "20",
        isExpanded: true,
        firstEntryIndex: 10,
        entryCount: 5,
      },
    },
    {
      type: "entry",
      data: { content: "mock entry content 11", time: 20 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 12", time: 20 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 13", time: 20 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 14", time: 20 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 15", time: 20 },
    },
  ]);

  // append more entries that belong to the third group
  act(() => {
    result.current.append([
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
  });

  expect(result.current.getVisibleItemCount()).toBe(13);
  expect(
    result.current.getRowsByIndexes([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  ).toStrictEqual([
    {
      type: "group",
      data: {
        index: 0,
        name: "3",
        isExpanded: false,
        firstEntryIndex: 0,
        entryCount: 4,
      },
    },
    {
      type: "group",
      data: {
        index: 1,
        name: "6.5",
        isExpanded: false,
        firstEntryIndex: 4,
        entryCount: 6,
      },
    },
    {
      type: "group",
      data: {
        index: 2,
        name: "20",
        isExpanded: true,
        firstEntryIndex: 10,
        entryCount: 10,
      },
    },
    {
      type: "entry",
      data: { content: "mock entry content 11", time: 20 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 12", time: 20 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 13", time: 20 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 14", time: 20 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 15", time: 20 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 16", time: 20 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 17", time: 21 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 18", time: 22 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 19", time: 24 },
    },
    {
      type: "entry",
      data: { content: "mock entry content 20", time: 26 },
    },
  ]);
});

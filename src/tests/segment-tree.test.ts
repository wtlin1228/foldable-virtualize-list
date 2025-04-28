import { SegmentTree } from "../data-control";

const assertTree = (
  tree: SegmentTree,
  rootVal: number,
  capacity: number,
  length: number
) => {
  // @ts-expect-error to test private field
  expect(tree.root.value).toBe(rootVal);
  // @ts-expect-error to test private field
  expect(tree.capacity).toBe(capacity);
  // @ts-expect-error to test private field
  expect(tree.length).toBe(length);
};

it("works", () => {
  const tree = new SegmentTree();
  assertTree(tree, 0, 1, 0);

  tree.add(21);
  assertTree(tree, 21, 1, 1);

  tree.add(4);
  assertTree(tree, 25, 2, 2);

  tree.add(35);
  assertTree(tree, 60, 4, 3);

  tree.add(15);
  assertTree(tree, 75, 4, 4);

  tree.add(25);
  assertTree(tree, 100, 8, 5);

  tree.add(99);
  assertTree(tree, 199, 8, 6);

  tree.set(0, 1); // 21 -> 1
  assertTree(tree, 179, 8, 6);

  tree.set(1, 10); // 4 -> 10
  assertTree(tree, 185, 8, 6);

  tree.set(2, 20); // 35 -> 20
  assertTree(tree, 170, 8, 6);

  tree.set(3, 42); // 15 -> 42
  assertTree(tree, 197, 8, 6);

  tree.set(4, 1); // 25 -> 1
  assertTree(tree, 173, 8, 6);

  tree.set(5, 1); // 99 -> 1
  assertTree(tree, 75, 8, 6);

  //            ________75________
  //      ____73____           ___2___
  //   _11_        _62_      _2_     _0_
  //  1    10    20    42   1   1   0   0
  expect(tree.query(0)).toStrictEqual({ index: 0, offset: 0 });
  expect(tree.query(1)).toStrictEqual({ index: 1, offset: 0 });
  expect(tree.query(2)).toStrictEqual({ index: 1, offset: 1 });
  expect(tree.query(3)).toStrictEqual({ index: 1, offset: 2 });
  expect(tree.query(4)).toStrictEqual({ index: 1, offset: 3 });
  expect(tree.query(5)).toStrictEqual({ index: 1, offset: 4 });
  expect(tree.query(6)).toStrictEqual({ index: 1, offset: 5 });
  expect(tree.query(7)).toStrictEqual({ index: 1, offset: 6 });
  expect(tree.query(8)).toStrictEqual({ index: 1, offset: 7 });
  expect(tree.query(9)).toStrictEqual({ index: 1, offset: 8 });
  expect(tree.query(10)).toStrictEqual({ index: 1, offset: 9 });
  expect(tree.query(11)).toStrictEqual({ index: 2, offset: 0 });
  expect(tree.query(12)).toStrictEqual({ index: 2, offset: 1 });
  // ...
  expect(tree.query(72)).toStrictEqual({ index: 3, offset: 41 });
  expect(tree.query(73)).toStrictEqual({ index: 4, offset: 0 });
  expect(tree.query(74)).toStrictEqual({ index: 5, offset: 0 });
});

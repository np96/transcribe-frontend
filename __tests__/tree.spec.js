import { SegmentTree } from '@/store/segment_tree.js'

describe('segment tree', () => {
  it('correctly builds small segment tree', () => {
    const tree = new SegmentTree([0,1,2,3])
    expect(tree.segmentPeakBottom(0, 3)).toEqual([3, 0])
    expect(tree.segmentPeakBottom(0, 2)).toEqual([2, 0])
    expect(tree.segmentPeakBottom(0, 1)).toEqual([1, 0])
    expect(tree.segmentPeakBottom(0, 0)).toEqual([0, 0])
    expect(tree.segmentSize(0, 1)).toBe(4)
    expect(tree.segmentSize(0, 2)).toBe(2)
    expect(tree.segmentSize(0, 3)).toBe(1)
    expect(tree.segmentSize(1, 1)).toBe(2)
  })
  it('correctly builds large segment tree', () => {
    // odd numbers negative, even positive
    const array = [...Array(20000).keys()].map(v => v % 2 ? -v : v)
    const tree = new SegmentTree(array)
    for (let i = 1; i < 20000; i += 2) {
      expect(tree.segmentPeakBottom(0, i)).toEqual([i - 1, -i])
    }
  })
})
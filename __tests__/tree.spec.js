import { SegmentTree } from '@/store/segment_tree.js'

describe('segment tree', () => {
  it('correctly builds small segment tree', () => {
    const tree = new SegmentTree([0,1,2,3])
    expect(tree.segmentPeakBottom(0, 3)).toEqual([3, 0])
    expect(tree.segmentPeakBottom(0, 2)).toEqual([2, 0])
    expect(tree.segmentPeakBottom(0, 1)).toEqual([1, 0])
    expect(tree.segmentPeakBottom(0, 0)).toEqual([0, 0])
  }) 
})
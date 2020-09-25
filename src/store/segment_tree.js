function listPeak(points) {
  let min = 0, max = 0
  for (let point of points) {
    max = Math.max(point, max)
    min = Math.min(point, min)
  }
  return [max, min]
}


function arrayReducer(arr, reducer) {
  return arr.reduce(reducer)
}

function segmentAvg(points) {
  //return arrayReducer(points, (acc, v) => acc + Math.abs(v)) / points.length * 2
  return arrayReducer(points, (acc, v) => acc + v) / points.length
}
/*
function segmentRms(points) {
  const squareSum = arrayReducer(points, (acc, v) => acc + Math.pow(v, 2))
  return Math.sqrt(squareSum / points.length)
}
*/

function segmentList(data, segSize, from = 0) {
  let avg = [] //, mean = [],  let peak = []
  const segments = Math.ceil(data.length / segSize)
  for (let start = from; start < segments * segSize; start += segSize) {
      avg.push(segmentAvg(data.slice(start, start + segSize)))
      // mean.push(segmentRms(data.slice(start, start + segSize)))
      // peak.push(listPeak(data.slice(start, start + segSize)))
  }
  return {
    'avg': avg,
    //'mean': mean,
    // 'peaks': peak
  }
}


class SegmentTree {
  constructor(chanData) {
    this.data = chanData
    this.tree = new Array(chanData.length * 2 - 1)
    //this.buildSegmentTree(1, 0, chanData.length - 1)
    this.buildTree()
  }

  buildSegmentTree(v, l, r) {
    let data = this.data
    let tree = this.tree
    if (l == r) {
      tree[v] = [data[l], data[l]]
    }
    else {
      this.buildSegmentTree(2 * v, l , (l + r) >> 1)
      this.buildSegmentTree(2 * v + 1, ((l + r) >> 1) + 1, r)
      tree[v] = listPeak(tree[2 * v].concat(tree[2 * v + 1]))
    }
  }

  segmentPeak(l, r, v = 1, tl = 0, tr = this.data.length - 1) {
    if (l > r) {
      return []
    }
    if (l == tl && r == tr) {
      return this.tree[v]
    } else {
      const tm = (tl + tr) >> 1
      const lpeak = this.segmentPeak(l, Math.min(r, tm),
                                     2 * v, tl, tm)
      const rpeak = this.segmentPeak(Math.max(l, tm + 1), r,
                                     2 * v + 1, tm + 1, tr)
      return listPeak(lpeak.concat(rpeak))
    }
  }

  buildTree() {
    let data = this.data
    let tree = this.tree
    const n = data.length
    for (let i = 0; i < n; i++) {
      tree[n - 1 + i] = [data[i], data[i]]
    }
    for (let i = n - 2; i >= 0; i--) {
      tree[i] = listPeak(tree[2 * i + 1].concat(tree[2 * i + 2]))
    }
  }

  segmentPeakBottom(l, r) {
    l += this.data.length - 1
    r += this.data.length - 1
    let left = [], right = []
    while (l < r) {
      if (l % 2 == 0) {
        left = listPeak(left.concat(this.tree[l]))
      }
      l >>= 1
      if (r % 2) {
        right = listPeak(this.tree[r].concat(right))
      }
      r >>= 1; r -= 1
    }
    if (l == r) {
        left = listPeak(this.tree[l].concat(left))
    }
    return listPeak(left.concat(right))
  
  }

  // for given zoom (log2 scale) and number of segments calculate
  // segment size to look up in this tree
  segmentSize(zoomRatio, numSegments) {
    const zoom = 1 + Math.log2(1 + zoomRatio)
    const len = this.data.length
    return Math.floor(len/numSegments/zoom)
  }
}

module.exports = {listPeak, segmentAvg, segmentList, SegmentTree}
<template>
  <canvas id = "c"></canvas>
</template>

<script>
export default {
  render: h => h('div'),
  props: {
    width: {
      type: Number,
      default: 500,
    },
    height: {
      type: Number,
      default: 80,
    }
  },
  data () {
    return {
      ctx: null
    }
  },
  computed: {
    peaksCanvas: function() {
      return this.$store.state.peaks.map(
        p => [this.height/2 - this.height/2 * p[0],
              this.height/2 - this.height/2 * p[1]]
      )

    }
  },
  mounted () {
    const canv = document.getElementById("c")
    canv.setAttribute('width', this.width)
    canv.setAttribute('height', this.height)
    this.ctx = canv.getContext("2d")
    // this.ctx.rect(20, 20, 150, 100)
    // this.ctx.stroke()
    this.$store.dispatch('getWaveform').then(this.drawPeaks())
  },

  methods: {
    drawPeaks () {
      this.ctx.clearRect(0, 0, this.height, this.width)
      this.ctx.lineWidth = 0.5
      this.ctx.strokeStyle = 'red'
      this.ctx.beginPath()
      let x = 0
      this.peaksCanvas.forEach(p => {
        console.log(p[0] + ' ' + p[1])
        this.ctx.moveTo(x, p[0])
        this.ctx.lineTo(x, p[1])
        x++
      })
      this.ctx.stroke()
      // requestAnimationFrame(this.drawPeaks.bind(this))
    },
  }
}
</script>
<template>
  <v-app >
    <AudioPlayer />
    <Waveform />
  </v-app> 
</template>
<script>
 import AudioPlayer from './components/AudioPlayer'
 import Waveform from './components/Waveform'
 export default {
   components: {AudioPlayer, Waveform}
 }
</script>
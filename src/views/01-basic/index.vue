<template>
  <div style="width: 100%; height: 100%; margin: 0; border: 0; padding: 0;">
    <canvas v-if="suportWebGL" ref="canvas" style="width: 100%; height: 100%;"></canvas>
    <div v-else>
      <slot>
      Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>'
      </slot>
    </div>
  </div>
</template>

<script>
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  CubeGeometry,
  MeshBasicMaterial,
  Mesh,
  GridHelper
} from "three";
const suportWebGL = (() => {
  try {
    var canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
})();

export default {
  name: "App",
  data() {
    return {
      suportWebGL,
      camera: new PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.01,
        100000
      ),
      scene: new Scene(),
      renderer: null,
      cube: null,
      reqId: null
    };
  },
  mounted() {
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: this.$refs.canvas
    });
    var geometry = new CubeGeometry(1, 1, 1);
    var material = new MeshBasicMaterial({ color: 0x00ff00 });
    this.initHelp();
    this.cube = new Mesh(geometry, material);
    this.scene.add(this.cube);
    this.camera.position.z = 6;
    this.animate();
  },
  methods: {
    initHelp() {
      let gridHelper = new GridHelper(3200, 320);
      this.scene.add(gridHelper);
    },
    animate() {
      this.reqId = requestAnimationFrame(this.animate);
      this.render();
    },
    render() {
      this.cube.rotation.x += 0.1;
      // this.cube.rotation.y += 0.1
      this.renderer.render(this.scene, this.camera);
    }
  },
  beforeDestroy() {
    cancelAnimationFrame(this.reqId);
  },
  components: {}
};
</script>

<style>
</style>

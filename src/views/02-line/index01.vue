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
  DirectionalLight,
  Geometry,
  LineBasicMaterial,
  Color,
  Vector3,
  Line,
  LineSegments,
  VertexColors,
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
        75,
        window.innerWidth / window.innerHeight,
        1,
        10000
      ),
      light: new DirectionalLight(0xff0000, 1.0, 0),
      scene: new Scene(),
      renderer: null,
      reqId: null
    };
  },
  mounted() {
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: this.$refs.canvas
    });
    this.renderer.setClearColor(0xffffff, 1.0);
    this.initHelp();
    this.initCamera();
    this.initLight();
    this.initObject();
    this.animate();
  },
  methods: {
    initCamera() {
      this.camera.position.x = 0;
      this.camera.position.y = 1000;
      this.camera.position.z = 0;
      this.camera.up.x = 0;
      this.camera.up.y = 0;
      this.camera.up.z = 1;
      this.camera.lookAt(0, 0, 0);
    },
    initLight() {
      this.light.position.set(100, 100, 200);
      this.scene.add(this.light);
    },
    animate() {
      this.reqId = requestAnimationFrame(this.animate);
      this.renderer.clear();
      this.render();
    },
    initHelp() {
      let gridHelper = new GridHelper(1200, 6);
      this.scene.add(gridHelper);
    },
    render() {
      this.renderer.render(this.scene, this.camera);
    },
    initObject() {
      var geometry = new Geometry();
      var material = new LineBasicMaterial({ vertexColors: VertexColors });
      var color1 = new Color(0x444444),
        color2 = new Color(0xff0000);

      // 线的材质可以由2点的颜色决定
      var p1 = new Vector3(-100, 0, 100);
      var p2 = new Vector3(100, 0, -100);
      geometry.vertices.push(p1);
      geometry.vertices.push(p2);
      geometry.colors.push(color1, color2);

      var line = new Line(geometry, material, LineSegments);
      this.scene.add(line);
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

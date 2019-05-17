<template>
<div style="width: 100%; height: 100%; margin: 0; border: 0; padding: 0;background: linear-gradient(#e4e0ba, #f7d9aa);">
  <canvas v-if="suportWebGL" ref="canvas" style="width: 100%; height: 100%;"></canvas>
  <div v-else>
    <slot>
      Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>'
    </slot>
  </div>
</div>
</template>
<script type='text/ecmascript-6'>
import {
  Scene,
  Camera,
  WebGLRenderer,
  PerspectiveCamera,
  Object3D,
  Clock, // Object for keeping track of time. This uses performance.now() if it is available, otherwise it reverts to the less accurate Date.now(). 用来记录时间的物体。如果可用，则使用performance.now()，否则将返回到不太精确的Date.now()。
  Vector3,
  GridHelper,
  Geometry,
  AmbientLight,
  DirectionalLight,
  HemisphereLight, // 半球光光源 这种光源可以为室外场景创建更加贴近自然的光照效果
  LineBasicMaterial,
  Line,
  PointLight, // https://threejs.docschina.org/#api/lights/PointLight
  Color,
  Fog,
  BoxGeometry,
  MeshPhongMaterial,
  Mesh,
  FlatShading,
  CylinderGeometry,
  Matrix4,
  CubeGeometry
} from 'three'
import { OrbitControls } from '@/common/controls/OrbitControls'
import { getSize, getCenter } from '@/common/util'
const suportWebGL = ( () => {
  try {
    var canvas = document.createElement( 'canvas' );
    return !!( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );
  } catch ( e ) {
    return false;
  }
} )();

//COLORS
var Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    pink:0xF5986E,
    brownDark:0x23190f,
    blue:0x68c3c0,
};
export default {

  props: {
    controllable: {
        type: Boolean,
        default: false
    },
    assist: {
      type: Boolean,
      default() {
        return true
      }
    },
    lights: {
        type: Array,
        default() {
            return [
                {
                    type: 'hemispherelight',
                    skyColor: '0xaaaaaa',
                    groundColor: '0x000000',
                    intensity: .9
                },
                {
                  type: 'directionalLight',
                  color: 0xffffff,
                  intensity: .9,
                  position: { x: 150, y: 350, z: 350 },
                  castShadow: true,
                  shadow: {
                    camera: {
                      left: -400,
                      right: 400,
                      top: 400,
                      bottom: -400,
                      near: 1,
                      far: 1000,
                    },
                    mapSize: {
                      width: 2048,
                      height: 2048
                    }
                  }
                }
            ]
        }
    },
    backgroundAlpha: {
        type: Number,
        default: 1
    },
    backgroundColor: {
        default: 0xf6f6f6
    },
    width: {
        type: Number
    },
    height: {
        type: Number
    },
    scale: {
        type: Object,
        default() {
            return { x: 1, y: 1, z: 1 }
        }
    },
    rotation: {
        type: Object,
        default() {
            return { x: 0, y: 0, z: 0 }
        }
    },
    position: {
        type: Object,
        default() {
            return { x: 0, y: 0, z: 0 }
        }
    },
    cameraPosition: {
        type: Object,
        default() {
            return { x: 0, y: 100, z: 200 }
        }
    },
    cameraRotation: {
        type: Object,
        default() {
            return { x: 0, y: 0, z: 0 }
        }
    },
    cameraUp: {
        type: Object
    },
    cameraLookAt: {
        type: Object
    },
    gammaOutput: {
        type: Boolean,
        default: false
    }
  },
  data () {
    return {
      clock: new Clock(),
      controls: null,
      allLights: [],
      size: {
          width: this.width,
          height: this.height
      },
      object: null,
      wrapper: new Object3D(), // https://threejs.docschina.org/#api/core/Object3D
      suportWebGL,
      renderer: null,
      camera: null,
      scene: new Scene(),
      airPlane: null,
      sea: null,
      sky: null,
      mousePos: { x: 0, y: 0 }
    }
  },
  mounted() {
    this.drawAxes(this.scene)
    if ( this.width === undefined || this.height === undefined ) {
      console.log(window.innerWidth, this.$el.offsetWidth)
      console.log(window.innerHeight, this.$el.offsetHeight)
      this.size = {
        width: this.$el.offsetWidth,
        height: this.$el.offsetHeight
      }
    }
    this.camera = new PerspectiveCamera( 60, this.size.width/this.size.height, 1, 10000 )
    this.scene.fog = new Fog(0xf7d9aa, 100,950)
     // whether to perform antialiasing 是否执行反锯齿 alpha - whether the canvas contains an alpha (transparency) buffer or not. Default is false. 画布是否包含alpha(透明度)缓冲区。默认是假的。
    this.renderer = new WebGLRenderer( { antialias: true, alpha: true, canvas: this.$refs.canvas } )
    this.renderer.setPixelRatio( window.devicePixelRatio) // devicePixelRatio 设备像素比
    this.renderer.shadowMap.enabled = true // If set, use shadow maps in the scene. Default is false.如果设置好了，在场景中使用阴影贴图。默认是假的。
    // gammaInput: Boolean 所有的纹理和颜色预乘伽马，默认false
    // gammaOutput: Boolean 需要以预乘的伽马输出，默认false
    // gammaFactor 默认2

    // this.renderer.gammaOutput = true
    // this.renderer.gammaFactor = 2.2
    this.adjust()
    // this.scene.add( this.wrapper )
    this.load()
    this.update()
    this.$el.addEventListener( 'mousemove', this.handleMouseMove, false );
    this.animate()
  },
  methods: {
    createAirPlane () {
      this.airPlane = new Object3D()
      this.airPlane.name = 'airPlane'

      // Create the cabin
      var geomCockpit = new BoxGeometry(60,50,50,1,1,1);
      var matCockpit = new MeshPhongMaterial({color: Colors.red, shading: FlatShading});
      var cockpit = new Mesh(geomCockpit, matCockpit);
      cockpit.castShadow = true;
      cockpit.receiveShadow = true;
      this.airPlane.add(cockpit);

      // Create Engine
      var geomEngine = new BoxGeometry(20,50,50,1,1,1);
      var matEngine = new MeshPhongMaterial({color: Colors.white, shading: FlatShading});
      var engine = new Mesh(geomEngine, matEngine);
      engine.position.x = 40;
      engine.castShadow = true;
      engine.receiveShadow = true;
      this.airPlane.add(engine);

      // Create Tailplane

      var geomTailPlane = new BoxGeometry(15,20,5,1,1,1);
      var matTailPlane = new MeshPhongMaterial({color:Colors.red, shading:FlatShading});
      var tailPlane = new Mesh(geomTailPlane, matTailPlane);
      tailPlane.position.set(-35,25,0);
      tailPlane.castShadow = true;
      tailPlane.receiveShadow = true;
      this.airPlane.add(tailPlane);

      // Create Wing

      var geomSideWing = new BoxGeometry(40,8,150,1,1,1);
      var matSideWing = new MeshPhongMaterial({color:Colors.red, shading:FlatShading});
      var sideWing = new Mesh(geomSideWing, matSideWing);
      sideWing.position.set(0,0,0);
      sideWing.castShadow = true;
      sideWing.receiveShadow = true;
      this.airPlane.add(sideWing);

      // Propeller

      var geomPropeller = new BoxGeometry(20,10,10,1,1,1);
      var matPropeller = new MeshPhongMaterial({color:Colors.brown, shading:FlatShading});
      this.airPlane.propeller = new Mesh(geomPropeller, matPropeller);
      this.airPlane.propeller.castShadow = true;
      this.airPlane.propeller.receiveShadow = true;
      // Blades

      var geomBlade = new BoxGeometry(1,100,20,1,1,1);
      var matBlade = new MeshPhongMaterial({color:Colors.brownDark, shading:FlatShading});

      var blade = new Mesh(geomBlade, matBlade);
      blade.position.set(8,0,0);
      blade.castShadow = true;
      blade.receiveShadow = true;
      this.airPlane.propeller.add(blade);
      this.airPlane.propeller.position.set(50,0,0);
      this.airPlane.add(this.airPlane.propeller);
      this.airPlane.scale.set(.25,.25,.25)
      this.airPlane.position.y = 100
      this.scene.add(this.airPlane)
    },
    createSea () {
      var geom = new CylinderGeometry(600,600,800,40,10);
      geom.applyMatrix(new Matrix4().makeRotationX(-Math.PI/2));
      var mat = new MeshPhongMaterial({
        color:Colors.blue,
        transparent:true,
        opacity:.6,
        shading:FlatShading,
      });
      this.sea = new Mesh(geom, mat)
      this.sea.receiveShadow = true
      this.sea.position.y = -600;
      this.scene.add(this.sea)
    },
    createCloud() {
      let cloud = new Object3D();
      cloud.name = "cloud";
      var geom = new CubeGeometry(20,20,20);
      var mat = new MeshPhongMaterial({
        color:Colors.white,
      });

      var nBlocs = 3+Math.floor(Math.random()*3);
      for (var i=0; i<nBlocs; i++ ){
        var m = new Mesh(geom.clone(), mat);
        m.position.x = i*15;
        m.position.y = Math.random()*10;
        m.position.z = Math.random()*10;
        m.rotation.z = Math.random()*Math.PI*2;
        m.rotation.y = Math.random()*Math.PI*2;
        var s = .1 + Math.random()*.9;
        m.scale.set(s,s,s);
        m.castShadow = true;
        m.receiveShadow = true;
        cloud.add(m);
      }
      return cloud
    },
    creatSky () {
      this.sky = new Object3D();
      this.sky.nClouds = 20;
      this.sky.clouds = [];
      var stepAngle = Math.PI*2 / this.sky.nClouds;
      for(var i=0; i<this.sky.nClouds; i++){
        var c = this.createCloud();
        this.sky.clouds.push(c);
        var a = stepAngle*i;
        var h = 750 + Math.random()*200;
        c.position.y = Math.sin(a)*h;
        c.position.x = Math.cos(a)*h;
        c.position.z = -400-Math.random()*400;
        c.rotation.z = a + Math.PI/2;
        var s = 1+Math.random()*2;
        c.scale.set(s,s,s);
        c.scale.set(s,s,s);
        this.sky.add(c);
      }
      this.sky.position.y = -600;
      this.scene.add(this.sky)
    },
    adjust () {
      this.createAirPlane()
      this.createSea()
      this.creatSky()
    },
    load() {
        if ( !this.src ) return;
        if ( this.object ) {
            this.wrapper.remove( this.object );
        }
        this.loader.load( this.src, ( ...args ) => {
            const object = this.getObject( ...args )
            if ( this.process ) {
                this.process( object );
            }
            this.addObject( object )
            this.$emit( 'on-load' );
        }, xhr => {
            this.$emit( 'on-progress', xhr );
        }, err => {
            this.$emit( 'on-error', err );
        } );
    },
    getObject( object ) {
        return object
    },
    addObject( object ) {
        const center = getCenter( object )
        // correction position -> position A Vector3 representing the object's local position. Default is (0, 0, 0). 表示对象的本地位置的向量3。默认值是(0,0,0)。
        // copy recursive -- if true, descendants of the object are also copied. Default is true. 递归——如果为真，也复制对象的后代。默认是正确的。
        // Copy the given object into this object. 将给定的对象复制到此对象中。
        this.wrapper.position.copy( center.negate() ) // https://threejs.docschina.org/#api/math/Vector3   negate求这个向量的倒数，即集合x = -x, y = -y, z = -z。
        this.object = object
        this.wrapper.add( object )
    },
    updateCamera() {
        const camera = this.camera;
        // const object = this.object;
        // camera.aspect = this.size.width / this.size.height;
        camera.updateProjectionMatrix(); // 调用updateProjectionMatrix方法,更新相机的投影矩阵
        if ( !this.cameraLookAt && !this.cameraUp ) {
            // if ( !object ) return;
            // const distance = getSize( object ).length();
            camera.position.set( this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z );

            console.log('camera', camera)
            camera.rotation.set( this.cameraRotation.x, this.cameraRotation.y, this.cameraRotation.z )
            // if ( this.cameraPosition.x === 0 && this.cameraPosition.y === 0 && this.cameraPosition.z === 0 ) {
            //     camera.position.z = distance;
            // }
            // camera.lookAt( new Vector3() );
        } else {
            camera.position.set( this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z )
            camera.rotation.set( this.cameraRotation.x, this.cameraRotation.y, this.cameraRotation.z )
            camera.up.set( this.cameraUp.x, this.cameraUp.y, this.cameraUp.z )
            camera.lookAt( new Vector3( this.cameraLookAt.x, this.cameraLookAt.y, this.cameraLookAt.z ) )
        }
    },
    updatePlane () {
      var targetY = this.normalize(this.mousePos.y,-.75,.75,25, 175);
      var targetX = this.normalize(this.mousePos.x,-.75,.75,-100, 100);

      this.airPlane.position.y = targetY;
      this.airPlane.position.x = targetX;

      this.airPlane.propeller.rotation.x += 0.3
    },
    handleMouseMove (event) {
      var tx = -1 + (event.clientX / this.size.width)*2;
      var ty = 1 - (event.clientY / this.size.height)*2;
      this.mousePos = {x:tx, y:ty};
    },
    normalize(v,vmin,vmax,tmin, tmax){
      var nv = Math.max(Math.min(v,vmax), vmin);
      var dv = vmax-vmin;
      var pc = (nv-vmin)/dv;
      var dt = tmax-tmin;
      var tv = tmin + (pc*dt);
      return tv;
    },
    update() {
        this.updateRenderer();
        this.updateCamera();
        this.updateLights();
        this.updateControls();
    },
    updateRenderer() {
        const renderer = this.renderer;
        renderer.setSize( this.size.width, this.size.height );
        renderer.setPixelRatio( window.devicePixelRatio || 1 );
        // renderer.setClearColor( new Color( this.backgroundColor ).getHex() );
        // renderer.setClearAlpha( this.backgroundAlpha );
    },
    updateLights() {
        this.scene.remove.apply( this.scene, this.allLights );
        this.allLights = [];
        this.lights.forEach( item => {
            if ( !item.type ) return;
            const type = item.type.toLowerCase();
            let light = null;
            if ( type === 'ambient' || type === 'ambientlight' ) {
                const color = item.color || 0x404040;
                const intensity = item.intensity || 1;
                light = new AmbientLight( color, intensity );
            } else if ( type === 'point' || type === 'pointlight' ) {
                const color = item.color || 0xffffff;
                const intensity = item.intensity || 1;
                const distance = item.distance || 0;
                const decay = item.decay || 1;
                light = new PointLight( color, intensity, distance, decay );
                if ( item.position ) {
                    light.position.copy( item.position );
                } else {
                  light.position.copy(this.camera.position)
                }
            } else if ( type === 'directional' || type === 'directionallight' ) {
                const color = item.color || 0xffffff;
                const intensity = item.intensity || 1;
                light = new DirectionalLight( color, intensity );
                if ( item.position ) {
                    light.position.copy( item.position );
                    console.log('light', light)
                }
                if ( item.target ) {
                    light.target.copy( item.target );
                }
                if (item.castShadow) {
                  // light.castShadow = true
                  // light.shadow = item.shadow
                  light.castShadow = true;
                  light.shadow.camera.left = item.shadow.camera.left;
                  light.shadow.camera.right = item.shadow.camera.right;
                  light.shadow.camera.top = item.shadow.camera.top;
                  light.shadow.camera.bottom = item.shadow.camera.bottom;
                  light.shadow.camera.near = item.shadow.camera.near;
                  light.shadow.camera.far = item.shadow.camera.far;
                  light.shadow.mapSize.width = item.shadow.mapSize.width;
                  light.shadow.mapSize.height = item.shadow.mapSize.height;
                }
            } else if ( type === 'hemisphere' || type === 'hemispherelight' ) {
                const skyColor = item.skyColor || 0xffffff;
                const groundColor = item.groundColor || 0xffffff;
                const intensity = item.intensity || 1;
                console.log('skyColor', skyColor)
                console.log('groundColor', groundColor)
                light = new HemisphereLight( Number(skyColor), Number(groundColor), intensity );
                if ( item.position ) {
                    light.position.copy( item.position );
                }
            }
            this.allLights.push( light );
            this.scene.add( light );
        } )
    },
    adjustControls () {

    },
    updateControls() {
        if ( this.controllable && this.controls ) return;
        if ( this.controllable ) {
            if ( this.controls ) return;
            this.controls = new OrbitControls( this.camera, this.$el );
            this.controls.type = 'orbit';
            this.adjustControls()
        } else {
            if ( this.controls ) {
                this.controls.dispose();
                this.controls = null;
            }
        }
    },
    animate() {
      this.updatePlane()
      this.sea.rotation.z += .005;
      this.sky.rotation.z += .01;
      this.reqId = requestAnimationFrame( this.animate );
      this.render();
    },
    render() {
      this.renderer.render( this.scene, this.camera )
    },
    drawAxes (scene) {
      if (this.assist === true) {
        return false
      }
      let gridHelper = new GridHelper(3200, 32)
      this.scene.add(gridHelper)
      // x-axis 红
      var xGeo = new Geometry()
      xGeo.vertices.push(new Vector3(0, 0, 0))
      xGeo.vertices.push(new Vector3(1000, 0, 0))
      var xMat = new LineBasicMaterial({
        color: 0xff0000
      })
      var xAxis = new Line(xGeo, xMat)
      scene.add(xAxis)

      // y-axis 绿
      var yGeo = new Geometry()
      yGeo.vertices.push(new Vector3(0, 0, 0))
      yGeo.vertices.push(new Vector3(0, 1000, 0))
      var yMat = new LineBasicMaterial({
        color: 0x00ff00
      })
      var yAxis = new Line(yGeo, yMat)
      scene.add(yAxis)

      // z-axis 蓝
      var zGeo = new Geometry()
      zGeo.vertices.push(new Vector3(0, 0, 0))
      zGeo.vertices.push(new Vector3(0, 0, 1000))
      var zMat = new LineBasicMaterial({
        color: 0x00ccff
      })
      var zAxis = new Line(zGeo, zMat)
      scene.add(zAxis)
    }
  }
}
</script>
<style scoped lang='stylus' rel='stylesheet/stylus'>
</style>

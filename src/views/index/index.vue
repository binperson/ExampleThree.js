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
<script type='text/ecmascript-6'>
import {
  Scene,
  Camera,
  WebGLRenderer,
  PerspectiveCamera,
  Object3D,
  Clock, // Object for keeping track of time. This uses performance.now() if it is available, otherwise it reverts to the less accurate Date.now(). 用来记录时间的物体。如果可用，则使用performance.now()，否则将返回到不太精确的Date.now()。
  Vector3,
  SphereBufferGeometry,
  GridHelper,
  Geometry,
  AmbientLight,
  DirectionalLight,
  SpotLight,
  HemisphereLight,
  LineBasicMaterial,
  Line,
  PointLight, // https://threejs.docschina.org/#api/lights/PointLight
  Color,
  ImageUtils,
  CubeGeometry,
  Mesh,
  MeshFaceMaterial,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  MeshPhongMaterial
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
export default {

  props: {
    controllable: {
        type: Boolean,
        default: true
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
                // {
                //     type: 'PointLight',
                //     color: 0xffffff,
                //     intensity: 1
                // },
                // {
                //   type: 'AmbientLight',
                //   color: 0x404040
                // }
            ]
        }
    },
    backgroundAlpha: {
        type: Number,
        default: 1
    },
    backgroundColor: {
        default: 0xbfe3dd
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
            return { x: 0, y: 40, z: -85 }
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
      camera: new PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 100000 ),
      scene: new Scene(),
      otherlights: []
    }
  },
  mounted() {
    this.drawAxes(this.scene)
    if ( this.width === undefined || this.height === undefined ) {
        this.size = {
            width: this.$el.offsetWidth,
            height: this.$el.offsetHeight
        }
    }
     // whether to perform antialiasing 是否执行反锯齿 alpha - whether the canvas contains an alpha (transparency) buffer or not. Default is false. 画布是否包含alpha(透明度)缓冲区。默认是假的。
    this.renderer = new WebGLRenderer( { antialias: true, alpha: true, canvas: this.$refs.canvas } )
    this.renderer.setPixelRatio( window.devicePixelRatio) // devicePixelRatio 设备像素比
    this.renderer.shadowMap.enabled = true // If set, use shadow maps in the scene. Default is false.如果设置好了，在场景中使用阴影贴图。默认是假的。
    // gammaInput: Boolean 所有的纹理和颜色预乘伽马，默认false
    // gammaOutput: Boolean 需要以预乘的伽马输出，默认false
    // gammaFactor 默认2

    this.renderer.gammaOutput = true
    this.renderer.gammaFactor = 2.2
    this.adjust()
    this.scene.add( this.wrapper )
    this.load()
    this.update()
    this.animate()
  },
  methods: {
    adjust () {
      var size = 100;
      var geometry = new PlaneBufferGeometry( size, size );
      var material = new MeshPhongMaterial( { color: 0x222222, specular: 0x222222, shininess: 75 } );
      var transparentMaterial = new MeshPhongMaterial( { color: 0x222222, emissive: 0x88888888, specular: 0x222222, shininess: 75, opacity: 0.3, transparent: true } );

      var room = new Object3D();
      room.position.y = size / 2 - 30;

      // top
      var mesh = new Mesh( geometry, material );
      mesh.rotation.x = Math.PI / 2;
      mesh.position.y = size / 2;
      room.add( mesh );

      // bottom
      mesh = new Mesh( geometry, material );
      mesh.rotation.x = - Math.PI / 2;
      mesh.position.y = - size / 2;
      room.add( mesh );

      // left
      mesh = new Mesh( geometry, material );
      mesh.position.x = - size / 2;
      mesh.rotation.y = Math.PI / 2;
      room.add( mesh );

      // right
      mesh = new Mesh( geometry, material );
      mesh.position.x = size / 2;
      mesh.rotation.y = - Math.PI / 2;
      room.add( mesh );

      // back
      mesh = new Mesh( geometry, material );
      mesh.position.z = - size / 2;
      room.add( mesh );

      this.scene.add( room )

      var distance = 20;

      var c = new Vector3();
      var geometry = new SphereBufferGeometry( 1, 1, 1 );
      var numLights = 40
      for ( var i = 0; i < numLights; i ++ ) {

        var light = new PointLight( 0xffffff, 2.0, distance );
        c.set( window.Math.random(), window.Math.random(), window.Math.random() ).normalize();
        light.color.setRGB( c.x, c.y, c.z );
        this.scene.add( light );
        this.otherlights.push( light );

        var material = new MeshBasicMaterial( { color: light.color } );
        var emitter = new Mesh( geometry, material );
        light.add( emitter );
      }
      var directionalLight = new DirectionalLight( 0x101010 );
      directionalLight.position.set( - 1, 1, 1 ).normalize();
      this.scene.add( directionalLight );

      var spotLight = new SpotLight( 0x404040 );
      spotLight.position.set( 0, 50, 0 );
      this.scene.add( spotLight );
    },
    load() {
        if ( !this.src ) return;
        if ( this.object ) {
            this.wrappetr.remove( this.object );
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
            camera.rotation.set( this.cameraRotation.x, this.cameraRotation.y, this.cameraRotation.z )
            if ( this.cameraPosition.x === 0 && this.cameraPosition.y === 0 && this.cameraPosition.z === 0 ) {
                camera.position.z = distance;
            }
            camera.lookAt( new Vector3() );
        } else {
            camera.position.set( this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z )
            camera.rotation.set( this.cameraRotation.x, this.cameraRotation.y, this.cameraRotation.z )
            camera.up.set( this.cameraUp.x, this.cameraUp.y, this.cameraUp.z )
            camera.lookAt( new Vector3( this.cameraLookAt.x, this.cameraLookAt.y, this.cameraLookAt.z ) )
        }
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
        renderer.setClearAlpha( this.backgroundAlpha );
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
                }
                if ( item.target ) {
                    light.target.copy( item.target );
                }
            } else if ( type === 'hemisphere' || type === 'hemispherelight' ) {
                const skyColor = item.skyColor || 0xffffff;
                const groundColor = item.groundColor || 0xffffff;
                const intensity = item.intensity || 1;
                light = new HemisphereLight( skyColor, groundColor, intensity );
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
        this.reqId = requestAnimationFrame( this.animate );
        this.render();
    },
    render() {
      var delta = this.clock.getDelta();
      var time = Date.now() * 0.0005;


      for ( var i = 0, il = this.otherlights.length; i < il; i ++ ) {

        var light = this.otherlights[ i ];
        var x = Math.sin( time + i * 7.0 ) * 45;
        var y = Math.cos( time + i * 5.0 ) * 45 + 20;
        var z = Math.cos( time + i * 3.0 ) * 45;
        light.position.set( x, y, z );

      }
      this.renderer.render( this.scene, this.camera )
    },
    drawAxes (scene) {
      if (this.assist === false) {
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

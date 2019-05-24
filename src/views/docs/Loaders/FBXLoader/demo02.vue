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
  Vector3,
  GridHelper,
  Geometry,
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  LineBasicMaterial,
  Line,
  PointLight, // https://threejs.docschina.org/#api/lights/PointLight
  Color,
  Mesh,
  CubeGeometry,
  MeshBasicMaterial,
  DoubleSide,
  SpotLight,
  PlaneGeometry,
  MeshLambertMaterial,
  CameraHelper
} from 'three'
import { OrbitControls } from '@/common/controls/OrbitControls'
import { getSize, getCenter } from '@/common/util'
import { FBXLoader } from '@/common/loaders/FBXLoader'
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
                {
                    type: 'PointLight',
                    color: 0xffffff,
                    intensity: 1
                },
                {
                  type: 'AmbientLight',
                  color: 0x404040
                }
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
            return { x: 1000, y: 1000, z: 1000 }
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
      camera: new PerspectiveCamera(60, 400 / 300, 1, 10000),
      scene: new Scene(),
      loader: new FBXLoader()
    }
  },
  async mounted() {
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
    this.renderer.setClearColor(0x000000)
    await this.adjust()
    this.scene.add( this.wrapper )
    this.load()
    this.update()
    this.adjustLight()
    this.animate()
  },
  methods: {
    async adjust () {
      this.model = await this.handleLoad({name: 'footer', position: { x: 0, y: 0, z: 0 }, link: '/static/models/test/f4.fbx'})

      this.model.object.castShadow = true;

      this.scene.add(this.model.object)

      var plane = new Mesh(new PlaneGeometry(1800, 1800, 16, 16), new MeshLambertMaterial({color: 0xcccccc}));
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = -1;
      plane.receiveShadow = true;
      this.scene.add( plane );
    },
    adjustLight () {
      var light = new SpotLight(0xffff00, 1, 10000, Math.PI / 6, 25);
      light.position.set(500, 500, 500);
      light.target = this.model.object;
      light.castShadow = true;
      this.scene.add( light )
      var helper = new CameraHelper( light.shadow.camera );
      this.scene.add( helper )
    },
    handleLoad (item) {
      return new Promise((resolve, reject) => {
        console.log(this.loader.load)
        this.loader.load(item.link, object => {
          if (this.process) {
            this.process(object)
          }
          object.traverse(child => {
            if (child instanceof Mesh) {
              child.material.side = DoubleSide
							child.castShadow = true;
            }
          })
          object.name = item.name
          resolve({object, position: item.position})
        }, this.onProgress, err => {
          reject(err)
        })
      })
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
        renderer.setClearColor( new Color( this.backgroundColor ).getHex() );
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

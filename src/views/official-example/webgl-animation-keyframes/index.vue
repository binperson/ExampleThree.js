<script type='text/ecmascript-6'>
import ThreeMixin from '@/components/three-mixin/index'
import { GLTFLoader } from '@/common/loaders/GLTFLoader'
import { DRACOLoader } from '@/common/loaders/DRACOLoader'
import {
  CubeTextureLoader,
  AnimationMixer, // AnimationMixer 是场景中某个特定对象的动画播放器，当场景中的多个对象单独动画的时候，每个对象都可以使用一个 AnimationMixer。有关 three.js 动画系统的不同元素概览，请参阅本手册 'Next Steps' 部分的 'Animation System' 一文查看。
  PerspectiveCamera
} from 'three'
import { defaultCipherList } from 'constants';
export default {
  mixins: [ThreeMixin],
  props: {
    position: {
        type: Object,
        default() {
            return { x: 1, y: 1, z: 0 }
        }
    },
    scale: {
        type: Object,
        default() {
            return { x: 0.01, y: 0.01, z: 0.01 }
        }
    },
    backgroundColor: {
        default: 0xbfe3dd
    },
    cameraPosition: {
        type: Object,
        default() {
            return { x: 5, y: 2, z: 8 }
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
      smoothing: {
          type: Boolean,
          default: false
      },
      mtlPath: {
          type: String
      },
      mtl: {
          type: String
      }
  },
  components: {
  },
  data() {
      const loader = new GLTFLoader();
      loader.setCrossOrigin( this.crossOrigin );
      return {
          loader,
          mixer: null,
          camera: new PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100 )
      }
  },
  methods: {
    adjust () {
      this.renderer.setSize( window.innerWidth, window.innerHeight )
    },
    adjustControls() {
      this.controls.target.set( 0, 0.5, 0 );
			this.controls.enablePan = false;
    },
    load() {
      var path = '/static/textures/cube/Park2/';
			var format = '.jpg';
			var envMap = new CubeTextureLoader().load( [
				path + 'posx' + format, path + 'negx' + format,
				path + 'posy' + format, path + 'negy' + format,
				path + 'posz' + format, path + 'negz' + format
      ] );
      DRACOLoader.setDecoderPath( 'js/libs/draco/gltf/' )
      this.loader.setDRACOLoader( new DRACOLoader() )
      console.log(this.loader.load)

      this.loader.load( '/static/models/gltf/LittlestTokyo.glb', gltf => {
        console.log(gltf)
				var model = gltf.scene;
				// model.position.set( 1, 1, 0 );
				model.scale.set( 0.01, 0.01, 0.01 );
				model.traverse( function ( child ) {
					if ( child.isMesh ) child.material.envMap = envMap;
        } );
        this.addObject( model )
				this.mixer = new AnimationMixer( model );
        this.mixer.clipAction( gltf.animations[ 0 ] ).play(); // 为传入的 clip 返回一个 AnimationAction，可以选择性地使用一个不同于该 mixer 默认的根对象的根对象。 第一个参数可以是一个 AnimationClip 对象或一个 AnimationClip 的名称。
        console.log('this.mixer1', this.mixer) // https://threejs.docschina.org/#api/animation/AnimationAction
			}, undefined, function ( e ) {
				console.error( e );
			} )
    },
    animate() {
        this.reqId = requestAnimationFrame( this.animate );
        if (this.mixer) {
          //getDelta -> Get the seconds passed since the time oldTime was set and sets oldTime to the current time. If autoStart is true and the clock is not running, also starts the clock.
          // 获取自设置时间oldTime以来经过的秒数，并将oldTime设置为当前时间。如果自动启动为真且时钟未运行，则也将启动时钟。
          var delta = this.clock.getDelta();
          this.mixer.update( delta )
        }
        this.render();
    },
  }
}
</script>
<style scoped lang='stylus' rel='stylesheet/stylus'>
</style>

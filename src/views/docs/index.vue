<template>
<div class="docs">
  <div class="panel">
    <div class="content">
      <div v-for="(items, index) in panelArr" :key="index">
        <h3>{{items.title}}</h3>
        <ul>
          <li v-for="(item, i) in items.list" :key="i">
            <router-link :to="item.link">
              {{item.title}}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div class="viewer">
    <router-view/>
  </div>
</div>
</template>
<script type='text/ecmascript-6'>
export default {
  data () {
    return {
      panelArr: [{
        title: '摄像机(Cameras)',
        list: [{
          title: 'PerspectiveCamera',
          link: '/docs/Camera/PerspectiveCamera'
        }, {
          title: 'OrthographicCamera',
          link: '/docs/Camera/OrthographicCamera'
        }]
      }, {
        title: '几何体(Geometries)',
        list: [{
          title: 'PlaneGeometry',
          link: '/docs/Geometries/PlaneGeometry'
        }]
      }, {
        title: '灯光(Light)',
        list: [{
          title: 'AmbientLight',
          link: '/docs/Light/AmbientLight/demo01'
        }, {
          title: 'DirectionalLight',
          link: '/docs/Light/DirectionalLight/demo01'
        }]
      }, {
        title: '灯光 / 阴影(LightShadow)',
        list: [{
          title: 'DirectionalLightShadow',
          link: '/docs/LightShadow/DirectionalLightShadow/demo01'
        }, {
          title: 'SpotLightShadow',
          link: '/docs/LightShadow/SpotLightShadow/demo01'
        }]
      }, {
        title: '加载器(Loaders)',
        list: [{
          title: 'FBXLoader',
          link: '/docs/Loaders/FBXLoader/demo01'
        }]
      }, {
        title: '物体(Object)',
        list: [{
          title: 'Line',
          link: '/docs/Object/Line/demo01'
        }, {
          title: 'Mesh',
          link: '/docs/Object/Mesh/demo01'
        }]
      }, {
        title: '纹理(Textures)',
        list: [{
          title: 'Texture',
          link: '/docs/Textures/Texture/demo01'
        }]
      }]
    }
  }
}
</script>
<style scoped lang='stylus' rel='stylesheet/stylus'>
.panel
  position fixed
  left 0px
  width 260px
  height 100%
  overflow auto
  padding 0px 20px 0px 20px
  background #fafafa
  box-sizing border-box
  .content
    h3
      color #666
      font-size 16px
      font-weight normal
      margin-top 20px
    ul
      margin-block-start 15px
      margin-block-end 15px
      li
        font-size 15px
        a
          color #2194CE
.viewer
    position absolute
    left 260px
    width calc(100% - 260px)
    height 100%
    overflow auto
</style>

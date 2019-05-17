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
        title: '摄像机',
        list: [{
          title: 'PerspectiveCamera',
          link: '/docs/camera/PerspectiveCamera'
        }, {
          title: 'OrthographicCamera',
          link: '/docs/camera/OrthographicCamera'
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

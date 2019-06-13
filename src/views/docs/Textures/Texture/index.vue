<template>
<div style="width: 100%; height: 100%; margin: 0; border: 0; padding: 0;">
  <div style="display: flex;" class="link-list">
    <router-link to="/docs/Textures/Texture/demo01">
      <div style="padding: 20px 10px 10px 20px; color: #2194ce; font-size:14px">demo01</div>
    </router-link>
    <router-link to="/docs/Textures/Texture/demo02">
      <div style="padding: 20px 10px 10px 20px; color: #2194ce; font-size:14px">demo02</div>
    </router-link>
    <router-link to="/docs/Textures/Texture/demo03">
      <div style="padding: 20px 10px 10px 20px; color: #2194ce; font-size:14px">demo03</div>
    </router-link>
  </div>
  <router-view/>
</div>
</template>
<script type='text/ecmascript-6'>
export default {
}
</script>
<style scoped lang='stylus' rel='stylesheet/stylus'>
</style>

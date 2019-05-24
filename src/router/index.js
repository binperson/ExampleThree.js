import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      redirect: "/docs/Object/Mesh/demo01"
    },
    {
      path: "/init",
      component: () => import("@/views/init/index.vue")
    },
    {
      path: '/demo/the-aviator',
      component: () => import("@/views/demo/the-aviator/index.vue")
    },
    {
      path: '/demo/the-aviator-one',
      component: () => import("@/views/demo/the-aviator-one/index.vue")
    },
    {
      path: "/index",
      component: () => import("@/views/01-basic/index.vue")
    },
    {
      path: "/line",
      component: () => import("@/views/02-line/index.vue")
    },
    {
      path: "/official/webgl-animation-keyframes",
      component: () => import("@/views/official-example/webgl-animation-keyframes")
    },
    {
      path: "/docs",
      component: () => import("@/views/docs"),
      children: [
        {
          path: '/docs/Camera/PerspectiveCamera',
          component: () => import("@/views/docs/Camera/PerspectiveCamera")
        },
        {
          path: '/docs/Camera/OrthographicCamera',
          component: () => import("@/views/docs/Camera/OrthographicCamera")
        },
        {
          path: '/docs/Geometries/PlaneGeometry',
          component: () => import("@/views/docs/Geometries/PlaneGeometry")
        },
        {
          path: '/docs/Object/Line',
          component: () => import("@/views/docs/Object/Line"),
          children: [{
            path: 'demo01',
            component: () => import("@/views/docs/Object/Line/demo01")
          }]
        },
        {
          path: '/docs/Object/Mesh',
          component: () => import("@/views/docs/Object/Mesh"),
          children: [{
            path: 'demo01',
            component: () => import("@/views/docs/Object/Mesh/demo01")
          }]
        },
        {
          path: '/docs/LightShadow/DirectionalLightShadow',
          component: () => import("@/views/docs/LightShadow/DirectionalLightShadow"),
          children: [{
            path: 'demo01',
            component: () => import("@/views/docs/LightShadow/DirectionalLightShadow/demo01")
          }]
        },{
          path: '/docs/LightShadow/SpotLightShadow',
          component: () => import("@/views/docs/LightShadow/SpotLightShadow"),
          children: [{
            path: 'demo01',
            component: () => import("@/views/docs/LightShadow/SpotLightShadow/demo01")
          }]
        },
        {
          path: '/docs/Loaders/FBXLoader',
          component: () => import("@/views/docs/Loaders/FBXLoader"),
          children: [{
            path: 'demo01',
            component: () => import("@/views/docs/Loaders/FBXLoader/demo01")
          }, {
            path: 'demo02',
            component: () => import("@/views/docs/Loaders/FBXLoader/demo02")
          }, {
            path: 'demo03',
            component: () => import("@/views/docs/Loaders/FBXLoader/demo03")
          }]
        },
        {
          path: '/docs/Light/AmbientLight',
          component: () => import("@/views/docs/Light/AmbientLight"),
          children: [{
            path: 'demo01',
            component: () => import("@/views/docs/Light/AmbientLight/demo01")
          }]
        },
        {
          path: '/docs/Light/DirectionalLight',
          component: () => import("@/views/docs/Light/DirectionalLight"),
          children: [{
            path: 'demo01',
            component: () => import("@/views/docs/Light/DirectionalLight/demo01")
          }, {
            path: 'demo02',
            component: () => import("@/views/docs/Light/DirectionalLight/demo02")
          }]
        }
      ]
    }
  ]
});

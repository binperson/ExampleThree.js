import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      redirect: "/docs/camera/PerspectiveCamera"
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
          path: '/docs/camera/PerspectiveCamera',
          component: () => import("@/views/docs/camera/PerspectiveCamera")
        },
        {
          path: '/docs/camera/OrthographicCamera',
          component: () => import("@/views/docs/camera/OrthographicCamera")
        },
        {
          path: '/docs/Geometries/PlaneGeometry',
          component: () => import("@/views/docs/Geometries/PlaneGeometry")
        },
        {
          path: '/docs/LightShadow/DirectionalLightShadow',
          component: () => import("@/views/docs/LightShadow/DirectionalLightShadow")
        }
      ]
    }
  ]
});

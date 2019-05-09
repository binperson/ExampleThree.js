import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      redirect: "/official/webgl-animation-keyframes"
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
    }
  ]
});

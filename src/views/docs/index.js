export default [{
  title: '摄像机(Cameras)',
  path: '/docs/Camera',
  component: () => import("@/views/docs"),
  children: [{
    title: 'PerspectiveCamera',
    path: '/docs/Camera/PerspectiveCamera',
    component: () => import("@/views/docs/Camera/PerspectiveCamera")
  }, {
    title: 'OrthographicCamera',
    path: '/docs/Camera/OrthographicCamera',
    component: () => import("@/views/docs/Camera/OrthographicCamera")
  }]
}, {
  title: '几何体(Geometries)',
  path: '/docs/Geometries',
  component: () => import("@/views/docs"),
  children: [{
    title: 'PlaneGeometry',
    path: '/docs/Geometries/PlaneGeometry',
    component: () => import("@/views/docs/Geometries/PlaneGeometry")
  }]
}, {
  title: '灯光(Light)',
  path: '/docs/Light/DirectionalLight',
  component: () => import("@/views/docs/Light/DirectionalLight"),
  children: [{
    title: 'AmbientLight',
    path: '/docs/Light/AmbientLight/demo01',
    component: () => import("@/views/docs/Light/AmbientLight/demo01")
  }, {
    title: 'DirectionalLight',
    path: '/docs/Light/DirectionalLight/demo01',
    component: () => import("@/views/docs/Light/DirectionalLight/demo01")
  }]
}, {
  title: '灯光 / 阴影(LightShadow)',
  path: '/docs/LightShadow/DirectionalLightShadow',
  component: () => import("@/views/docs/LightShadow/DirectionalLightShadow"),
  children: [{
    title: 'DirectionalLightShadow',
    path: '/docs/LightShadow/DirectionalLightShadow/demo01',
    component: () => import("@/views/docs/LightShadow/DirectionalLightShadow/demo01")
  }, {
    title: 'SpotLightShadow',
    path: '/docs/LightShadow/SpotLightShadow/demo01',
    component: () => import("@/views/docs/LightShadow/SpotLightShadow/demo01")
  }]
}, {
  title: '加载器(Loaders)',
  path: '/docs/Loaders/FBXLoader',
  component: () => import("@/views/docs/Loaders/FBXLoader"),
  children: [{
    title: 'FBXLoader',
    path: '/docs/Loaders/FBXLoader/demo01',
    component: () => import("@/views/docs/Loaders/FBXLoader/demo01")
  }]
}, {
  title: '物体(Object)',
  path: '/docs/Object/Line/demo01',
  component: () => import("@/views/docs/Object/Line/demo01"),
  children: [{
    title: 'Line',
    path: '/docs/Object/Line/demo01',
    component: () => import("@/views/docs/Object/Line/demo01")
  }, {
    title: 'Mesh',
    path: '/docs/Object/Mesh/demo01',
    component: () => import("@/views/docs/Object/Mesh")
  }]
}, {
  title: '纹理(Textures)',
  path: '/docs/Textures/Texture',
  component: () => import("@/views/docs/Textures/Texture"),
  children: [{
    title: 'Texture',
    path: '/docs/Textures/Texture/demo01',
    component: () => import("@/views/docs/Textures/Texture")
  }]
}]

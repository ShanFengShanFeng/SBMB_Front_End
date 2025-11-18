<template>
    <Renderer ref="renderer" antialias :orbit-ctrl="{ enableDamping: true, target }" resize shadow
        :shadow-map="{ enabled: true, type: 'PCFSoftShadowMap' }">
        <Camera :position="{ x: 120, y: 270, z: 501 }" />
        <Scene ref="scene" background="#a8a9aa">
            <HemisphereLight />

            <DirectionalLight :position="{ x: -300, y: 300, z: 300 }"
                :shadow-camera="{ top: 200, bottom: -200, left: -300, right: 300, near: 0.1, far: 1000 }"
                :shadow-map-size="{ width: 1000, height: 1000 }" />
            <Plane :width="1000" :height="1000" receive-shadow>
                <PhongMaterial color="#a8a9aa" :props="{ depthWrite: false }" />
            </Plane>

            <FbxModel :src="props.file" :key="props.file" @load="onLoad" />
        </Scene>
    </Renderer>
</template>

<script setup>
// Model from mixamo.com
import { AnimationMixer, Clock, Color, Fog, GridHelper, Vector3 } from "three";
import {
    Camera,
    DirectionalLight,
    FbxModel,
    HemisphereLight,
    Renderer,
    PhongMaterial,
    Plane,
    Scene,
} from "troisjs";
import { onMounted, ref } from "vue";
const props = defineProps({
    file: {
        type: String,
        default: ""
    }
});
const target = new Vector3(0, 80, 0);
const renderer = ref();
const scene = ref();
onMounted(() => {
    const scene1 = scene.value;
    scene1.scene.fog = new Fog(0xa8a9aa, 300, 1000);
    const grid = new GridHelper(1000, 20, 0x000000, 0x000000);
    grid.material.opacity = 0.5;
    grid.material.transparent = true;
    scene1.add(grid);
});
let mixer = null;
let clock = null;
const updateMixer = () => {
    mixer.update(clock.getDelta());
};
const onLoad = (object) => {
    mixer = new AnimationMixer(object);
    const action = mixer.clipAction(object.animations[0]);
    action.play();
    // 定义颜色
    const brown = new Color(0x8B4513); // 褐色
    object.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.color = brown;
            child.material.needsUpdate = true;
            child.material.map = null
        }
    });
    clock = new Clock();
    renderer.value.onBeforeRender(updateMixer);
};
</script>

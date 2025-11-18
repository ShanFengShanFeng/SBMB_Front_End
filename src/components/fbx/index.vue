<template>
    <section class="py-1 flex-1 flex-col overflow-hidden relative ">
        <section class="absolute left-0 right-0 top-0 h-12 text-[#001925] px-4 leading-12 font-bold text-base flex justify-between">
            <span>Real time posture</span>
            <label class="flex items-center text-sm gap-2">
                <input type="checkbox" v-model="showFbx" class="mr-2" />
                Show
            </label>
        </section>
        <section class="flex-1 h-full border-[#006674] border overflow-hidden" :class="{'bg-[#c7c8c9]': !showFbx}">
            <RenderFbx v-if="showFbx && file" :action="fbxAction"  :file="file"/>
        </section>
    </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { useWebSocketSimulator } from "@/composables/useWebSocketSimulator";
import RenderFbx from "./render.vue";
import Running from "@/assets/fbx/Running.fbx";
import Walking from "@/assets/fbx/Walking.fbx";
import AscendingStairs from "@/assets/fbx/AscendingStairs.fbx";
import DescendingStairs from "@/assets/fbx/DescendingStairs.fbx";
import Jump from "@/assets/fbx/Jump.fbx";
import LayingNodding from "@/assets/fbx/LayingNodding.fbx";
import SittingIdle from "@/assets/fbx/SittingIdle.fbx";
import StandingIdle from "@/assets/fbx/StandingIdle.fbx";
const { onMessage } = useWebSocketSimulator();
const fbxAction = ref(-1);
const showFbx= ref(false);

const fbxList = [
    { url: SittingIdle, action: 0, },
    { url: StandingIdle, action: 1, },
    { url: Walking, action: 2 },
    { url: Jump, action: 3 },
    { url: AscendingStairs, action: 4 },
    { url: DescendingStairs, action: 5 },
    { url: LayingNodding, action: 6 },
    { url: Running, action: 7 }
];

const file = computed(()=>{
    const fbx = fbxList.find(item => item.action === fbxAction.value);
    return fbx ? fbx.url : null;
})
// 监听数据更新消息
onMessage('activity', (message) => {
    const data = message.data;
    if (data.label_id) {
        fbxAction.value = data.label_id
        console.log('最新的fbxaction', fbxAction.value)
    }
});
</script>

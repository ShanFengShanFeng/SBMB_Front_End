<template>
  <section class="px-2 py-1 h-screen flex flex-col overflow-hidden bg-[#012746] text-[#11ebd7]  font-sans box-border">
    <div class="flex justify-between overflow-hidden items-center  !mb-2 !pt-2 relative max-sm:!mt-2 flex-shrink-0">
      <svg class="invisible lg:visible" width="100%" height="100%" viewBox="0 0 1876 51" version="1.1" xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" data-v-15b104b0="">
        <defs data-v-15b104b0="">
          <linearGradient x1="0.386698263%" y1="100%" x2="100%" y2="100%" id="linearGradient-1" data-v-15b104b0="">
            <stop stop-color="#00EBEE" stop-opacity="0" offset="0%" data-v-15b104b0=""></stop>
            <stop stop-color="#00EBEE" offset="49.1630928%" data-v-15b104b0=""></stop>
            <stop stop-color="#00EBEE" stop-opacity="0" offset="100%" data-v-15b104b0=""></stop>
          </linearGradient>
          <linearGradient x1="20.8850042%" y1="50%" x2="97.3547308%" y2="50%" id="linearGradient-2" data-v-15b104b0="">
            <stop stop-color="#00D4DC" stop-opacity="0" offset="0%" data-v-15b104b0=""></stop>
            <stop stop-color="#00C3CC" stop-opacity="0.095388986" offset="51.933837%" data-v-15b104b0=""></stop>
            <stop stop-color="#00AAB6" stop-opacity="0.729524626" offset="100%" data-v-15b104b0=""></stop>
          </linearGradient>
        </defs>
        <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" data-v-15b104b0="">
          <g id="数据可视化" transform="translate(-35.000000, -12.000000)" data-v-15b104b0="">
            <g id="编组" transform="translate(35.000000, 10.000000)" data-v-15b104b0="">
              <g id="编组-44" transform="translate(0.000000, 3.000000)" data-v-15b104b0="">
                <polyline id="路径" stroke="url(#linearGradient-1)" stroke-width="2"
                  points="0 0 707 0 754 38 789 38 800 49 1050 49 1061 38 1096 38 1143 0 1850 0" data-v-15b104b0="">
                </polyline>
                <path
                  d="M 692,15 L 717,41 L 698,41 L 673,15 L 692,15 ZM 648,15 L 673,41 L 654,41 L 629,15 L 648,15 ZM 604,15 L 629,41 L 610,41 L 585,15 L 604,15 ZM 560,15 L 585,41 L 566,41 L 541,15 L 560,15 ZM 516,15 L 541,41 L 522,41 L 497,15 L 516,15 ZM 472,15 L 497,41 L 478,41 L 453,15 L 472,15 ZM 428,15 L 453,41 L 434,41 L 409,15 L 428,15 ZM 384,15 L 409,41 L 390,41 L 365,15 L 384,15 Z"
                  id="形状结合备份-2" fill="url(#linearGradient-2)" data-v-15b104b0=""></path>
                <path
                  d="M 1994,15 L 2019,41 L 2000,41 L 1975,15 L 1994,15 ZM 1950,15 L 1975,41 L 1956,41 L 1931,15 L 1950,15 ZM 1906,15 L 1931,41 L 1912,41 L 1887,15 L 1906,15 ZM 1862,15 L 1887,41 L 1868,41 L 1843,15 L 1862,15 ZM 1818,15 L 1843,41 L 1824,41 L 1799,15 L 1818,15 ZM 1774,15 L 1799,41 L 1780,41 L 1755,15 L 1774,15 ZM 1730,15 L 1755,41 L 1736,41 L 1711,15 L 1730,15 ZM 1686,15 L 1711,41 L 1692,41 L 1667,15 L 1686,15 Z"
                  id="形状结合备份-3" fill="url(#linearGradient-2)"
                  transform="translate(1574.000000, 27.000000) scale(-1, 1) translate(-1574.000000, -27.000000) "
                  data-v-15b104b0=""></path>
                <rect id="矩形" fill="#11EBD7" x="802" y="44" width="250" height="3" data-v-15b104b0=""></rect>
              </g>
            </g>
          </g>
        </g>
      </svg>
      <p class="text-2xl font-bold absolute left-0 top-3">{{ userInfo }}</p>
      <p class=" absolute left-0 right-0 flex justify-center items-center">
        <span class="2xl:text-2xl lg:text-xl text-base text-center fon-bold relative -left-2 bottom-2">Smart Bio-motion Bodysuit</span>
      </p>
      <ClockComponent class="!absolute right-0 top-3" />
    </div>
    <section class="w-full flex-1 overflow-hidden grid grid-cols-3 gap-2 max-sm:hidden">
      <LeftComponent></LeftComponent>
      <section class="flex-1 flex flex-col justify-between gap-2 py-1 overflow-hidden">
        <Timeline class="flex-1" eventName="ecg_stream" dataField="easi_ai" key="ai" />
        <Timeline class="flex-1" eventName="ecg_stream" dataField="easi_es" key="es" />
        <Timeline class="flex-1" eventName="ecg_stream" dataField="easi_as" key="as" />
      </section>
      <Fbx/>
    </section>

    <Tabs default-value="1" class="sm:hidden w-full flex-1">
      <TabsList class="grid grid-cols-3 w-full bg-[#001925]">
        <TabsTrigger value="1" class="text-white data-[state=active]:text-[#001925]">
          Base Data
        </TabsTrigger>
        <TabsTrigger value="2"  class="text-white data-[state=active]:text-[#001925]">
          ECG Data
        </TabsTrigger>
        <TabsTrigger value="3"  class="text-white data-[state=active]:text-[#001925]">
          Action
        </TabsTrigger>
      </TabsList>
      <TabsContent value="1">
        <LeftComponent></LeftComponent>
      </TabsContent>
      <TabsContent value="2">
        <section class="h-full min-h-[85vh] flex flex-col justify-between gap-2">
          <Timeline class="flex-1" eventName="ecg_stream" dataField="easi_as" key="as" />
          <Timeline class="flex-1" eventName="ecg_stream" dataField="easi_ai" key="ai" />
          <Timeline class="flex-1" eventName="ecg_stream" dataField="easi_es" key="es" />
        </section>
      </TabsContent>
      <TabsContent value="3">
        <Fbx />
      </TabsContent>
    </Tabs>

  </section>
</template>

<script setup>
import Timeline from "@/components/timeline/index.vue";
import { onMounted } from "vue";
import { useWebSocketSimulator } from "@/composables/useWebSocketSimulator";
import ClockComponent from '@/components/clock/index.vue'
import Fbx from '@/components/fbx/index.vue'
import LeftComponent from '@/components/left/index.vue'
import { userInfo } from '@/lib/websocketSimulator'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
// 使用WebSocket模拟器
const { connect } = useWebSocketSimulator();
// 页面加载时自动连接WebSocket
onMounted(() => {
  connect();
});

</script>

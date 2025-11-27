<script setup lang="ts">
import { use } from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    ToolboxComponent,
    DataZoomSliderComponent
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";
import { ref, provide, computed, onMounted, onUnmounted } from "vue";
import { useWebSocketSimulator } from "@/composables/useWebSocketSimulator";
import type { EcgUpdateMessage, TempUpdateMessage } from "@/types/websocket";

// 导入图标
import HRIcon from "@/assets/images/HR.png";
import SDNNRMSSDIcon from "@/assets/images/SDNN-RMSSD.png";
import RRIcon from "@/assets/images/RR.png";
import ATIcon from "@/assets/images/AT.png";
import STIcon from "@/assets/images/ST.png";

use([
    GridComponent,
    SVGRenderer,
    ToolboxComponent,
    LineChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    DataZoomSliderComponent
]);

provide(THEME_KEY, "dark");

// WebSocket模拟器
const { onMessage, connect } = useWebSocketSimulator();

// 最新数据值
const latestEcgData = ref({
    hr_mean_bpm: 0,
    sdnn_ms: 0,
    rmssd_ms: 0,
    resp_rate_bpm: 0
})

const latestTempData = ref({
    object_c: 0,
    ambient_c: 0
})

// 上方数据展示列表配置
const topSectionList = [
    {
        label: 'HR/BPM',
        dataKey: 'hr_mean_bpm',
        dataSource: 'ecg',
        icon: HRIcon,
        hasIcon: true,
        flexClass: ''
    },
    {
        label: 'SDNN/ms',
        dataKey: 'sdnn_ms',
        dataSource: 'ecg',
        icon: SDNNRMSSDIcon,
        hasIcon: false,
        flexClass: 'flex-col'
    },
    {
        label: 'RMSSD/ms',
        dataKey: 'rmssd_ms',
        dataSource: 'ecg',
        icon: SDNNRMSSDIcon,
        hasIcon: false,
        flexClass: 'flex-col'
    },
    {
        label: 'RR/BPM',
        dataKey: 'resp_rate_bpm',
        dataSource: 'ecg',
        icon: RRIcon,
        hasIcon: false,
        flexClass: 'flex-col'
    },
    {
        label: 'AT/°C',
        dataKey: 'object_c',
        dataSource: 'temp',
        icon: ATIcon,
        hasIcon: false,
        flexClass: 'flex-col'
    },
    {
        label: 'ST/°C',
        dataKey: 'ambient_c',
        dataSource: 'temp',
        icon: STIcon,
        hasIcon: false,
        flexClass: 'flex-col'
    }
]

// 获取显示值的计算属性
const getDisplayValue = (section: any): number => {
    const dataSource = section.dataSource === 'ecg' ? latestEcgData.value : latestTempData.value
    return (dataSource as any)[section.dataKey] || 0
}

// 数据类型配置
const dataTypeConfigs = {
    'ecg': {
        title: 'Base Data',
        yAxisName: 'Value',
        color: '#ef4444',
        areaColor: {
            start: 'rgba(239, 68, 68, 0.3)',
            end: 'rgba(239, 68, 68, 0.05)'
        }
    },
    'temp': {
        title: 'Temprature Data',
        yAxisName: 'Temperature(°C)',
        color: '#f97316',
        areaColor: {
            start: 'rgba(249, 115, 22, 0.3)',
            end: 'rgba(249, 115, 22, 0.05)'
        }
    }
};

// 通用数据和时间标签
const ecgChartData = ref<Array<{
    hr_mean_bpm: number
    sdnn_ms: number
    rmssd_ms: number
    resp_rate_bpm: number
}>>([]);
const ecgTimeLabels = ref<string[]>([]);
const tempChartData = ref<Array<{
    object_c: number
    ambient_c: number
}>>([]);
const tempTimeLabels = ref<string[]>([]);
const maxDataPoints = 20;

// 自定义 legend 选中状态（true 表示“隐藏该条曲线”）
const ecgSeriesShow = ref<Record<string, boolean>>({
    HR: true,
    SDNN: true,
    RMSSD: true,
    RR: true
});

const tempSeriesShow = ref<Record<string, boolean>>({
    ST: true,
    AT: true
});

const ecgLegendList = [
    { label: 'HR', key: 'HR' },
    { label: 'SDNN', key: 'SDNN' },
    { label: 'RMSSD', key: 'RMSSD' },
    { label: 'RR', key: 'RR' }
];

const tempLegendList = [
    { label: 'ST', key: 'ST' },
    { label: 'AT', key: 'AT' }
];

// ECG图表配置
const ecgOption = computed(() => {
    const config = dataTypeConfigs['ecg'];
    return {
        backgroundColor: '#001925',
        title: {
            text: config.title,
            top: '8px',
            left: '8px',
            textStyle: {
                fontSize: 13
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: (params: any[]) => {
                return params.map((param: any) => {
                    return new Date(+param.name).toLocaleTimeString('zh-CN', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }) + ': ' + param.value;
                }).join('<br/>');
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ecgTimeLabels.value,
            axisLabel: {
                interval: Math.ceil(ecgChartData.value.length / 10),
                formatter: (value: any) => {
                    return value ? new Date(parseInt(value)).toLocaleTimeString('zh-CN', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }) : ''
                }
            }
        },
        yAxis: {
            type: 'value',
            name: config.yAxisName,
            axisLabel: {
                formatter: (val: any) => val.toFixed(1)
            }
        },
        series: [
            // 勾选表示隐藏，对应 series 不返回或返回空数组
            {
                name: 'HR',
                type: 'line',
                symbol: 'none',
                data: ecgSeriesShow.value.HR
                    ? ecgChartData.value.map(item => item.hr_mean_bpm) : [],
                itemStyle: {
                    color: '#ef4444'
                }
            },
            {
                name: 'SDNN',
                type: 'line',
                symbol: 'none',
                data: ecgSeriesShow.value.SDNN
                    ? ecgChartData.value.map(item => item.sdnn_ms) : [],
                itemStyle: {
                    color: '#3b82f6'
                }
            },
            {
                name: 'RMSSD',
                type: 'line',
                symbol: 'none',
                data: ecgSeriesShow.value.RMSSD
                    ? ecgChartData.value.map(item => item.rmssd_ms) : [],
                itemStyle: {
                    color: '#10b981'
                }
            },
            {
                name: 'RR',
                type: 'line',
                symbol: 'none',
                data: ecgSeriesShow.value.RR
                    ? ecgChartData.value.map(item => item.resp_rate_bpm) : [],
                itemStyle: {
                    color: '#8b5cf6'
                }
            }
        ]
    }
});

// 温度图表配置
const tempOption = computed(() => {
    const config = dataTypeConfigs['temp'];
    return {
        backgroundColor: '#001925',
        title: {
            text: config.title,
            top: '8px',
            left: '8px',
            textStyle: {
                fontSize: 13
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: (params: any[]) => {
                return params.map((param: any) => {
                    return new Date(+param.name).toLocaleTimeString('zh-CN', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }) + ': ' + param.value + '°C';
                }).join('<br/>');
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: tempTimeLabels.value,
            axisLabel: {
                interval: Math.ceil(tempChartData.value.length / 10),
                formatter: (value: any) => {
                    return value ? new Date(parseInt(value)).toLocaleTimeString('zh-CN', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }) : ''
                }
            }
        },
        yAxis: {
            type: 'value',
            name: config.yAxisName,
            max: 50,
            min: 0,
            axisLabel: {
                formatter: (val: any) => val.toFixed(1) + '°C'
            }
        },
        series: [
            {
                name: 'ST',
                type: 'line',
                symbol: 'none',
                data: tempSeriesShow.value.ST
                    ? tempChartData.value.map(item => item.object_c) : [],
                itemStyle: {
                    color: '#f97316'
                }
            },
            {
                name: 'AT',
                type: 'line',
                symbol: 'none',
                data: tempSeriesShow.value.AT
                    ? tempChartData.value.map(item => item.ambient_c) : [],
                itemStyle: {
                    color: '#eab308'
                }
            }
        ]
    }
});

// 格式化数值显示
function formatNumber(value: number, decimals: number = 1): string {
    return value <= 0 ? "\\" : value.toFixed(decimals)
}

onMounted(() => {
    // 启动WebSocket连接
    connect()

    // 监听ECG更新事件
    onMessage('ecg_update', (message) => {
        const data = message.data as EcgUpdateMessage;
        if (data) {
            latestEcgData.value = {
                hr_mean_bpm: data.hr_mean_bpm,
                sdnn_ms: data.sdnn_ms,
                rmssd_ms: data.rmssd_ms,
                resp_rate_bpm: data.resp_rate_bpm
            }

            // 添加新数据点
            const ts = data.ts || new Date().getTime();
            const timestamp = ts.toString();
            ecgChartData.value.push({
                hr_mean_bpm: data.hr_mean_bpm,
                sdnn_ms: data.sdnn_ms,
                rmssd_ms: data.rmssd_ms,
                resp_rate_bpm: data.resp_rate_bpm
            });
            ecgTimeLabels.value.push(timestamp);

            // 保持数据点数量在限制内
            if (ecgChartData.value.length > maxDataPoints) {
                ecgChartData.value.shift();
                ecgTimeLabels.value.shift();
            }
        }
    })

    // 监听温度更新事件
    onMessage('temp_update', (message) => {
        const data = message.data as TempUpdateMessage;
        if (data) {
            latestTempData.value = {
                object_c: data.object_c,
                ambient_c: data.ambient_c
            }
            // 添加新数据点
            const ts = data.ts || new Date().getTime();
            const timestamp = ts.toString();
            tempChartData.value.push({
                object_c: data.object_c,
                ambient_c: data.ambient_c
            });
            tempTimeLabels.value.push(timestamp);

            // 保持数据点数量在限制内
            if (tempChartData.value.length > maxDataPoints) {
                tempChartData.value.shift();
                tempTimeLabels.value.shift();
            }
        }
    })
})

onUnmounted(() => {
    // 组件销毁时清理
})

</script>

<template>
    <div class="w-full h-full grid grid-rows-5 gap-2 border-box py-1 overflow-hidden">
        <!-- 最上层：六个数据最新值展示（两行三列） -->
        <div class="row-span-1 grid grid-cols-3 gapx-2 bg-[#001925] border-[#006674] border border-box">
            <section v-for="section in topSectionList" :key="section.label" class="flex px-3">
                <section class="w-16 flex justify-center items-center">
                    <img :src="section.icon" alt="" class="w-12 h-12">
                </section>
                <section class="flex flex-col justify-center items-center">
                    <p class="text-base font-medium text-gray-500">{{ section.label }}</p>
                    <div class="text-2xl font-bold text-white">
                        {{ formatNumber(getDisplayValue(section)) }}
                    </div>
                </section>
            </section>
        </div>

        <!-- 中间：ECG数据折线图 -->
        <section class="row-span-2 overflow-hidden border-[#006674] border border-box relative">
            <!-- 自定义 ECG legend -->
            <div class="flex gap-4 px-3 py-1 text-xs text-gray-300 absolute right-2 top-2  z-100">
                <label v-for="item in ecgLegendList" :key="item.key" class="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" v-model="ecgSeriesShow[item.key]" class="w-3 h-3" />
                    <span class="flex items-center gap-1">
                        {{ item.label }}
                        <span
                            class="legend-line"
                            :style="{
                                backgroundColor:
                                    item.key === 'HR'
                                        ? '#ef4444'
                                        : item.key === 'SDNN'
                                            ? '#3b82f6'
                                            : item.key === 'RMSSD'
                                                ? '#10b981'
                                                : '#8b5cf6'
                            }"
                        ></span>
                    </span>
                </label>
            </div>
            <VChart class="chart" :option="ecgOption" />
        </section>
        <!-- 下方：温度折线图 -->
        <section class="row-span-2 overflow-hidden border-[#006674] border border-box relative">
            <div class="flex gap-4 px-3 py-1 text-xs text-gray-300 absolute right-2 top-2  z-100">
                <label v-for="item in tempLegendList" :key="item.key" class="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" v-model="tempSeriesShow[item.key]" class="w-3 h-3" />
                    <span class="flex items-center gap-1">
                        {{ item.label }}
                        <span
                            class="legend-line"
                            :style="{
                                backgroundColor:
                                    item.key === 'ST'
                                        ? '#f97316'
                                        : '#eab308'
                            }"
                        ></span>
                    </span>
                </label>
            </div>
            <VChart class="chart" :option="tempOption" />
        </section>
    </div>
</template>

<style scoped>
.card-content {
    padding: 1rem;
}

.chart {
    height: 100%;
}

.legend-line {
    display: inline-block;
    width: 10px;
    height: 2px;
    border-radius: 999px;
}
</style>

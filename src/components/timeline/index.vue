<template>
    <section class="overflow-hidden box-border border-[#006674] border relative text-white">
        <label class="flex items-center gap-1 cursor-pointer z-100 absolute right-4 top-3">
            <input type="checkbox" v-model="showLegend" class="w-3 h-3" />
            <span class="text-xs ml-1">{{ getCurrentConfig().title }}</span>
        </label>
        <VChart class="chart" :option="option" v-show="showLegend"/>
        <div class="corner lt"></div>
        <div class="corner rt"></div>
        <div class="corner lb"></div>
        <div class="corner rb"></div>
    </section>
</template>

<script setup>
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
import VChart from "vue-echarts";
import { ref, computed } from "vue";
import { useWebSocketSimulator } from "@/composables/useWebSocketSimulator";

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
const showLegend = ref(true)
// provide(THEME_KEY, "dark");
const props = defineProps(['eventName', 'dataField'])
const option = computed(() => {
    const config = getCurrentConfig();
    return {
        backgroundColor: '#001925',
        title: {
            text: config.title + '/mV',
            top: '8px',
            left: '16px',
            textStyle: {
                color: "white",
                fontSize: 13
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                return params.map((param) => {
                    return new Date(+param.name).toDateString()
                }
                ).join('<br/>');
            }
        },
        grid: {
            left: '4%',
            right: '4%',
            bottom: '4%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeLabels.value,
            axisLabel: {
                interval: Math.ceil(chartData.value.length / 10),
                formatter: (value) => {
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
            min: config.yAxisMin,
            max: config.yAxisMax,
            axisLabel: {
                formatter: val => val.toFixed(4)
            },
            splitLine: {
                show: true,
                lineStyle: {
                    opacity: 0.3
                }
            }
        },
        series: [
            {
                name: config.title,
                type: 'line',
                symbol: 'none',
                data: chartData.value,
                itemStyle: {
                    color: config.color
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: config.areaColor.start
                        }, {
                            offset: 1, color: config.areaColor.end
                        }]
                    }
                }
            }
        ]
    }
});
// 数据类型配置
const dataTypeConfigs = {
    'easi_ai': {
        title: 'ECG-1',
        yAxisMin: function (value) {
            return value.min - (value.max - value.min) * 0.1; // 下边留 10%
        },
        yAxisMax: function (value) {
            return value.max + (value.max - value.min) * 0.1; // 上边留 10%
        },
        color: '#ff6b6b',
        areaColor: {
            start: 'rgba(255, 107, 107, 0.3)',
            end: 'rgba(255, 107, 107, 0.05)'
        }
    },
    'easi_es': {
        title: 'ECG-2',
        color: '#4ecdc4',
        areaColor: {
            start: 'rgba(78, 205, 196, 0.3)',
            end: 'rgba(78, 205, 196, 0.05)'
        }
    },
    'easi_as': {
        title: 'ECG-3',
        yAxisMin: function (value) {
            return value.min - (value.max - value.min) * 1; // 下边留 10%
        },
        yAxisMax: function (value) {
            return value.max + (value.max - value.min) * 1; // 上边留 10%
        },
        color: '#45b7d1',
        areaColor: {
            start: 'rgba(69, 183, 209, 0.3)',
            end: 'rgba(69, 183, 209, 0.05)'
        }
    }
};


// 使用WebSocket模拟器
const { onMessage } = useWebSocketSimulator();

// 通用数据和时间标签
const chartData = ref([]);
const timeLabels = ref([]);
const maxDataPoints = 30;

// 获取当前数据类型配置
const getCurrentConfig = () => {
    return dataTypeConfigs[props.dataField]
};

// 获取数据值的通用函数
const getDataValue = (data) => {
    const value = data[props.dataField];
    if (typeof value === 'number') {
        return value
    }
    return 0;
};

// 监听数据更新消息
onMessage(props.eventName, (message) => {
    const data = message.data;
    const ts = data.ts || data.t || new Date().getTime();
    const timestamp = ts.toString();
    const config = getCurrentConfig();
    const value = getDataValue(data, config);

    // 添加新数据点
    chartData.value.push(value);
    timeLabels.value.push(timestamp);

    // 保持数据点数量在限制内
    if (chartData.value.length > maxDataPoints) {
        chartData.value.shift();
        timeLabels.value.shift();
    }
});

// Timeline组件只负责数据监听，连接管理由父组件负责
</script>

<style scoped>
.chart {
    height: 100%;
}

.corner {
    width: 24px;
    height: 24px;
    position: absolute;
}

.corner.lt {
    left: 0;
    top: 0;
    border-left: 2px solid #11ebd7;
    border-top: 2px solid #11ebd7;
}

.corner.rt {
    right: 0;
    top: 0;
    border-right: 2px solid #11ebd7;
    border-top: 2px solid #11ebd7;
}

.corner.lb {
    left: 0;
    bottom: 0;
    border-left: 2px solid #11ebd7;
    border-bottom: 2px solid #11ebd7;
}

.rb {
    right: 0;
    bottom: 0;
    border-right: 2px solid #11ebd7;
    border-bottom: 2px solid #11ebd7;
}
</style>
<template>
    <div class="text-3xl font-bold overflow-hidden h-10 relative top-2">
        <div class="inline-block">
            <!-- 小时 -->
            <span class="inline-block w-5 text-center">
                    <span :key="hourTens" class="inline-block">{{ hourTens }}</span>
            </span>
            <span class="inline-block w-5 text-center">
                    <span :key="hourOnes" class="inline-block">{{ hourOnes }}</span>
            </span>
            <span class="inline-block w-5 text-center relative -top-1">:</span>
            <!-- 分钟 -->
            <span class="inline-block w-5 text-center">
                    <span :key="minuteTens" class="inline-block">{{ minuteTens }}</span>
            </span>
            <span class="inline-block w-5 text-center">
                    <span :key="minuteOnes" class="inline-block">{{ minuteOnes }}</span>
            </span>
            <span class="inline-block w-5 text-center relative -top-1">:</span>
            <!-- 秒 -->
            <span class="inline-block w-5 text-center">
                    <span :key="secondTens" class="inline-block">{{ secondTens }}</span>
            </span>
            <span class="inline-block w-5 text-center">
                    <span :key="secondOnes" class="inline-block">{{ secondOnes }}</span>
            </span>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'

const hourTens = ref('')
const hourOnes = ref('')
const minuteTens = ref('')
const minuteOnes = ref('')
const secondTens = ref('')
const secondOnes = ref('')

const updateTime = () => {
    const now = dayjs()
    const timeStr = now.format('HHmmss')
    
    hourTens.value = timeStr[0]
    hourOnes.value = timeStr[1]
    minuteTens.value = timeStr[2]
    minuteOnes.value = timeStr[3]
    secondTens.value = timeStr[4]
    secondOnes.value = timeStr[5]
}

let timer
onMounted(() => {
    updateTime()
    timer = setInterval(updateTime, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.4s ease;
}

.slide-up-enter-from {
    transform: translateY(100%);
    opacity: 0;
}

.slide-up-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}
</style>


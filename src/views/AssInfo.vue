<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCounterStore } from '@/stores/mainStore';
import { storeToRefs } from 'pinia';

const mainStore = useCounterStore();


let { isSubLoaded } = storeToRefs(mainStore);
let { subtitleFile } = storeToRefs(mainStore);

const isShowAssView = ref(true);

async function copyAss() {
    try {
        await navigator.clipboard.writeText(subtitleFile.value.encode());
    }
    catch (error) {
        console.error("复制失败", error);
    }
}

</script>



<template>
    <div id="assView" v-if="isShowAssView">
        <span v-show="!isSubLoaded" class="beforeSubLoad">文本预览区</span>
        <div v-show="isSubLoaded">
            <label>ASS</label>
            <button @click="copyAss">复制</button>
            <span>{{ subtitleFile.encode() }}</span>
        </div>
    </div>
</template>



<style scoped>
#assView {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
    word-break: break-word;

    span {
        display: inline-block;
        padding: 0.4rem;
    }

    >div {
        height: 100%;
        overflow: hidden;

        >span {
            height: calc(100% - 3rem - 2px);
            overflow-y: auto;
            overflow-x: hidden;
            word-break: break-word;
        }

        >label,
        >button {
            padding-top: 0;
            padding-bottom: 0;
            margin: 0.4rem;
            height: 1.5rem;
        }
    }
}
</style>
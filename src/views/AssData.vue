<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCounterStore } from '@/stores/mainStore';
import { storeToRefs } from 'pinia';

const mainStore = useCounterStore();


let { isSubLoaded } = storeToRefs(mainStore);
let { subtitleFile } = storeToRefs(mainStore);

const isShowAssView = ref(true);

function selectStyleRow(index: number) {

}

async function copyAss() {
    try {
        await navigator.clipboard.writeText(subtitleFile.value.encode());
    }
    catch (error) {
        console.error("复制失败", error);
    }
}

async function saveSub() {
    const content = subtitleFile.value.encode()
    // 创建一个Blob对象，类型为文本
    const blob = new Blob([content], { type: 'text/plain' });
    // 创建一个下载链接
    const link = document.createElement('a');
    // 设置链接的href属性为Blob对象的URL
    link.href = URL.createObjectURL(blob);
    // 设置下载文件的名称
    link.download = 'synchrsub.ass';
    // 将链接添加到文档中
    document.body.appendChild(link);
    // 触发链接的点击事件，开始下载
    link.click();
    // 下载完成后移除链接
    document.body.removeChild(link);
}

// info editor

const playResXModel = computed({
    get: () => subtitleFile.value.info.PlayResX === 0 ? '' : subtitleFile.value.info.PlayResX,
    set: (newVal) => subtitleFile.value.info.PlayResX = newVal ? Number(newVal) : 0
});

const playResYModel = computed({
    get: () => subtitleFile.value.info.PlayResY === 0 ? '' : subtitleFile.value.info.PlayResY,
    set: (newVal) => subtitleFile.value.info.PlayResY = newVal ? Number(newVal) : 0
});

const playDepthModel = computed({
    get: () => subtitleFile.value.info.PlayDepth === 0 ? '' : subtitleFile.value.info.PlayDepth,
    set: (newVal) => subtitleFile.value.info.PlayDepth = newVal ? Number(newVal) : 0
});

const scaledBorderAndShadowModel = computed({
    get: () => subtitleFile.value.info.ScaledBorderAndShadow === 'yes',
    set: (newVal) => subtitleFile.value.info.ScaledBorderAndShadow = newVal ? 'yes' : 'no'
});

</script>



<template>
    <div id="assInfoEditor">
        <span v-show="!isSubLoaded" class="beforeSubLoad">Info 编辑区</span>
        <div v-show="isSubLoaded" id="assInfoEditorSpace">

            <div class="twoOneLine">
                <label for="info-title">Title</label>
                <input id="info-title" type="text" v-model="subtitleFile.info.Title" placeholder="Title" />
            </div>


            <div class="twoOneLine">
                <label for="info-original-script">Original Script</label>
                <input id="info-original-script" type="text" v-model="subtitleFile.info.Original_Script"
                    placeholder="Original Script" />
            </div>

            <div class="twoOneLine">
                <label for="info-original-translation">Original Translation</label>
                <input id="info-original-translation" type="text" v-model="subtitleFile.info.Original_Translation"
                    placeholder="Original Translation" />
            </div>

            <div class="twoOneLine">
                <label for="info-original-editing">Original Editing</label>
                <input id="info-original-editing" type="text" v-model="subtitleFile.info.Original_Editing"
                    placeholder="Original Editing" />
            </div>

            <div class="twoOneLine">
                <label for="info-original-timing">Original Timing</label>
                <input id="info-original-timing" type="text" v-model="subtitleFile.info.Original_Timing"
                    placeholder="Original Timing" />
            </div>

            <div class="twoOneLine">
                <label for="info-synch-point">Synch Point</label>
                <input id="info-synch-point" type="text" v-model="subtitleFile.info.Synch_Point"
                    placeholder="Synch Point" />
            </div>

            <div class="twoOneLine">
                <label for="info-script-updated-by">Script Updated By</label>
                <input id="info-script-updated-by" type="text" v-model="subtitleFile.info.Script_Updated_By"
                    placeholder="Script Updated By" />
            </div>

            <div class="twoOneLine">
                <label for="info-update-details">Update Details</label>
                <input id="info-update-details" type="text" v-model="subtitleFile.info.Update_Details"
                    placeholder="Update Details" />
            </div>

            <div class="threeOneLine">
                <input id="info-play-res-x" type="number" min="0" step="1" class="editToPlayRes" v-model="playResXModel"
                    placeholder="PlayResX" />
                <input id="info-play-res-y" type="number" min="0" step="1" class="editToPlayRes" v-model="playResYModel"
                    placeholder="PlayResY" />
                <input id="info-play-res-depth" type="number" min="0" step="1" class="editToPlayRes"
                    v-model="playDepthModel" placeholder="PlayDepth" />
            </div>

            <div class="twoOneLine">
                <label for="editToYCbCrMatrix">YCbCr Matrix</label>
                <select v-model="subtitleFile.info.YCbCr_Matrix" id="editToYCbCrMatrix">
                    <option value="None">None</option>
                    <option value="TV.601">TV.601</option>
                    <option value="TV.709">TV.709</option>
                    <option value="PC.601">PC.601</option>
                    <option value="PC.709">PC.709</option>
                    <option value="TV.FCC">TV.FCC</option>
                    <option value="PC.FCC">PC.FCC</option>
                    <option value="TV.240M">TV.240M</option>
                    <option value="PC.240M">PC.240M</option>
                </select>
            </div>

            <div class="twoOneLine">
                <label for="editToWrapStyle" class="editToWrapStyle">Wrap Style</label>
                <select v-model="subtitleFile.info.WrapStyle" id="editToWrapStyle">
                    <option value="0">0: 智能换行，上行较宽</option>
                    <option value="1">1: 尾词换行，仅 \N 能强制换行</option>
                    <option value="2">2: 不换行，\n 和 \N 强制换行</option>
                    <option value="3">3: 智能换行，下行较宽</option>
                </select>
            </div>
            <div class="twoOneLine">
                <label for="editToScaledBorderAndShadow">Scaled Border And
                    Shadow</label>
                <input type="checkbox" id="editToScaledBorderAndShadow" v-model="scaledBorderAndShadowModel" />
            </div>
        </div>
    </div>

    <div id="assStylesEditor">
        <span v-show="!isSubLoaded" class="beforeSubLoad">Styles 编辑区</span>
        <div v-show="isSubLoaded">
            <div class="bar">
                <button @click="" id="moveStyleUp" title="Move style up">
                    <img src="@/assets/arrow.svg"></button>
                <button @click="" id="moveStyleDown" title="Move style down">
                    <img src="@/assets/arrow.svg"></button>
                <button @click="" id="delStyle" title="Delete style">Del</button>
                <button @click="" id="newStyle" title="Create new style">New</button>
            </div>


            <tr v-for="(item, index) in subtitleFile.styleList.val" @click="selectStyleRow(index)" :class="{}">
                {{ item.Name }}
            </tr>

            <div id="assStylesEditorSpace">

            </div>
        </div>
    </div>

    <div id="assView" v-if="isShowAssView">
        <span v-show="!isSubLoaded" class="beforeSubLoad">文本预览区</span>
        <div v-show="isSubLoaded">
            <div class="bar">
                <label>ASS</label>
                <button @click="">编辑</button>
                <button @click="copyAss">复制</button>
                <button @click="saveSub">导出</button>
            </div>

            <span>{{ subtitleFile.encode() }}</span>
        </div>
    </div>
</template>



<style scoped>
#assInfoEditor {
    position: relative;
    height: calc(30% - 2px);
    width: 100%;
    display: inline-block;
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: thin;

    border-bottom: 1px solid lightgray;

    #assInfoEditorSpace {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        padding: 0.4rem;

        .threeOneLine {
            width: 100%;
            display: flex;
            gap: 1rem;
            justify-content: center;
            align-items: center;

            >* {
                width: calc(31% - 2px - 1rem);
            }
        }

        .twoOneLine {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;

            >* {
                width: calc(50% - 2px - 1rem);
            }

            label {
                white-space: nowrap;
            }

            label.editToWrapStyle {
                width: 6rem;
            }

            #editToWrapStyle {
                width: 13rem;
            }
        }

        .editToPlayRes {
            appearance: textfield;
        }
    }
}

#assStylesEditor {
    position: relative;
    height: calc(40% - 2px);
    width: 100%;
    display: inline-block;
    overflow: hidden;
    border-bottom: 1px solid lightgray;
}

#assView {
    position: relative;
    height: calc(30% - 1px);
    width: 100%;
    overflow: hidden;
    display: inline-block;

    >div {
        position: relative;
        height: 100%;
        width: 100%;
        overflow: hidden;
        display: inline-block;

        >span {
            display: inline-block;
            height: calc(100% - 2rem - 21px);
            width: calc(100% - 0.4rem);
            overflow-x: hidden;
            overflow-y: auto;
            padding: 0.4rem;
            padding-right: 0;
            white-space: pre-wrap;
            word-break: break-word;
        }

    }
}

div.bar {
    position: relative;
    width: calc(100% - 2rem);
    height: 20px;
    padding: 0.6rem 1rem;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;

    display: flex;
    align-items: center;
    justify-content: left;
    column-gap: 1rem;
    border-bottom: 1px solid lightgray;

    >label {
        display: block;
        height: 100%;
        line-height: calc(1.5rem - 2px);
    }

    >button {
        position: relative;
        font-size: 0.84rem;
        height: 1.5rem;
        padding: calc(0.08rem - 2px) 4px;
        line-height: 1.5rem;
        white-space: nowrap;
    }

    #moveStyleUp {
        width: 1.5rem;
    }

    #moveStyleUp>img {
        position: absolute;
        left: 0.18rem;
        top: 0.25rem;
        transform: rotate(180deg);
    }

    #moveStyleDown {
        width: 1.5rem;
    }

    #moveStyleDown>img {
        position: absolute;
        left: 0.18rem;
        top: 0.17rem;
    }
}
</style>
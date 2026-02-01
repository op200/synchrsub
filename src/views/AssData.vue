<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useMainStore } from '@/stores/mainStore'
import { storeToRefs } from 'pinia'

// 自定义字幕类
import { SubStyle } from '@/subtitle'

const mainStore = useMainStore()


let { isSubLoaded } = storeToRefs(mainStore)
let { subtitleFile } = storeToRefs(mainStore)

const isShowAssView = ref(true)

function selectStyleRow(index: number) {
    subtitleFile.value.styleList.currentRowIndex = index
}

async function copyAss() {
    try {
        await navigator.clipboard.writeText(subtitleFile.value.encode())
    }
    catch (error) {
        console.error("复制失败", error)
    }
}

async function saveSub() {
    const content = subtitleFile.value.encode()
    // 创建一个Blob对象，类型为文本
    const blob = new Blob([content], { type: 'text/plain' })
    // 创建一个下载链接
    const link = document.createElement('a')
    // 设置链接的href属性为Blob对象的URL
    link.href = URL.createObjectURL(blob)
    // 设置下载文件的名称
    link.download = 'synchrsub.ass'
    // 将链接添加到文档中
    document.body.appendChild(link)
    // 触发链接的点击事件，开始下载
    link.click()
    // 下载完成后移除链接
    document.body.removeChild(link)
}

// info editor

const playResXModel = computed({
    get: () => subtitleFile.value.info.PlayResX === 0 ? '' : subtitleFile.value.info.PlayResX,
    set: newVal => subtitleFile.value.info.PlayResX = newVal ? Number(newVal) : 0
})

const playResYModel = computed({
    get: () => subtitleFile.value.info.PlayResY === 0 ? '' : subtitleFile.value.info.PlayResY,
    set: newVal => subtitleFile.value.info.PlayResY = newVal ? Number(newVal) : 0
})

const playDepthModel = computed({
    get: () => subtitleFile.value.info.PlayDepth === 0 ? '' : subtitleFile.value.info.PlayDepth,
    set: newVal => subtitleFile.value.info.PlayDepth = newVal ? Number(newVal) : 0
})

const layoutResXModel = computed({
    get: () => subtitleFile.value.info.LayoutResX === 0 ? '' : subtitleFile.value.info.LayoutResX,
    set: newVal => subtitleFile.value.info.LayoutResX = newVal ? Number(newVal) : 0
})

const layoutResYModel = computed({
    get: () => subtitleFile.value.info.LayoutResY === 0 ? '' : subtitleFile.value.info.LayoutResY,
    set: newVal => subtitleFile.value.info.LayoutResY = newVal ? Number(newVal) : 0
})

const scaledBorderAndShadowModel = computed({
    get: () => subtitleFile.value.info.ScaledBorderAndShadow === 'yes',
    set: newVal => subtitleFile.value.info.ScaledBorderAndShadow = newVal ? 'yes' : 'no'
})

// style editor

const checkName = computed(() => {
    if (subtitleFile.value.styleList.val.length === 0) return 'var(--background-color)'
    return subtitleFile.value.styleList.checkName(subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].Name, subtitleFile.value.styleList.currentRowIndex) ? 'var(--background-color)' : 'red'
})

const primaryColourHTMLModel = computed({
    get: () => subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].PrimaryColour.getHTMLColor(),
    set: (newVal) => subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].PrimaryColour.set(newVal)
})

const secondaryColourHTMLModel = computed({
    get: () => subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].SecondaryColour.getHTMLColor(),
    set: (newVal) => subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].SecondaryColour.set(newVal)
})

const outlineColourHTMLModel = computed({
    get: () => subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].OutlineColour.getHTMLColor(),
    set: (newVal) => subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].OutlineColour.set(newVal)
})

const backColourHTMLModel = computed({
    get: () => subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].BackColour.getHTMLColor(),
    set: (newVal) => subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].BackColour.set(newVal)
})

const primaryColourAssModel = computed({
    get: () => subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].PrimaryColour.getAssStyleColor(),
    set: (newVal) => subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].PrimaryColour.set(newVal)
})

const secondaryColourAssModel = computed({
    get: () => subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].SecondaryColour.getAssStyleColor(),
    set: (newVal) => subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].SecondaryColour.set(newVal)
})

const outlineColourAssModel = computed({
    get: () => subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].OutlineColour.getAssStyleColor(),
    set: (newVal) => subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].OutlineColour.set(newVal)
})

const backColourAssModel = computed({
    get: () => subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].BackColour.getAssStyleColor(),
    set: (newVal) => subtitleFile.value.styleList.val[subtitleFile.value.styleList.currentRowIndex].BackColour.set(newVal)
});

</script>



<template>
    <div id="assInfoEditor">
        <span v-show="!isSubLoaded" class="beforeSubLoad">Info 编辑区</span>
        <div v-if="isSubLoaded" id="assInfoEditorSpace">

            <div class="twoOneLine">
                <label for="info-title">Title</label>
                <input id="info-title" type="text" v-model="subtitleFile.info.Title" placeholder="Title" />
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
                <input type="number" min="0" step="1" v-model="layoutResXModel" class="editToLayoutRes"
                    placeholder="LayoutResX" />
                <input type="number" min="0" step="1" v-model="layoutResYModel" class="editToLayoutRes"
                    placeholder="LayoutResY" />
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
                    <option value="1">1: 尾词换行，仅 \N 强制换行</option>
                    <option value="2">2: 不换行，\n 和 \N 强制换行</option>
                    <option value="3">3: 智能换行，下行较宽</option>
                </select>
            </div>

            <div class="twoOneLine">
                <label for="editToScaledBorderAndShadow">Scaled Border And
                    Shadow</label>
                <input type="checkbox" id="editToScaledBorderAndShadow" v-model="scaledBorderAndShadowModel" />
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

        </div>
    </div>

    <div id="assStylesEditor">
        <span v-show="!isSubLoaded" class="beforeSubLoad">Styles 编辑区</span>
        <div v-if="isSubLoaded" style="width: 100%;height: 100%;position: relative;">

            <div class="bar">
                <label>Styles</label>

                <button @click="subtitleFile.styleList.moveUp" id="moveStyleUp" title="Move style up">
                    <img src="@/assets/arrow.svg"></button>

                <button @click="subtitleFile.styleList.moveDown" id="moveStyleDown" title="Move style down">
                    <img src="@/assets/arrow.svg"></button>

                <button @click="subtitleFile.styleList.delect" id="delStyle" title="Delete style">Del</button>

                <button @click="subtitleFile.styleList.insert(new SubStyle('New' + Date.now()))" id="newStyle"
                    title="Create new style">New</button>

                <button @click="subtitleFile.styleList.copy" id="copyStyle" title="Create new style">Copy</button>
            </div>


            <div id="assStylesEditSpace">
                <div id="assStylesListView">
                    <span v-for="(item, index) in subtitleFile.styleList.val" @click="selectStyleRow(index)" :class="{
                        selected: index === subtitleFile.styleList.currentRowIndex
                    }">{{ item.Name }}
                    </span>
                </div>

                <div id="assStylesListDetail">
                    <!-- Name -->
                    <div class="textLine">
                        <label for="style-name">Name</label>
                        <input id="style-name" type="text"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].Name">
                    </div>
                    <!-- Fontname -->
                    <div class="textLine">
                        <label for="style-fontname">Fontname</label>
                        <input id="style-fontname" type="text"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].Fontname">
                    </div>
                    <!-- Fontsize -->
                    <div class="textLine">
                        <label for="style-fontsize">Fontsize</label>
                        <input id="style-fontsize" type="number" min="0" step="1"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].Fontsize">
                    </div>
                    <!-- PrimaryColour -->
                    <div class="colorLine" for="style-primary-colour">
                        <label for="style-primary-colour">Primary Colour</label>
                        <input id="style-primary-colour" type="color" v-model="primaryColourHTMLModel">
                        <input type="number" min="0" max="255" step="1" title="Alpha"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].PrimaryColour.a">
                        <input type="text" title="HTML color" v-model="primaryColourHTMLModel">
                        <input type="text" title="ASS style color" v-model="primaryColourAssModel">
                    </div>
                    <!-- SecondaryColour -->
                    <div class="colorLine">
                        <label for="style-secondary-colour">Secondary Colour</label>
                        <input id="style-secondary-colour" type="color" v-model="secondaryColourHTMLModel">
                        <input type="number" min="0" max="255" step="1" title="Alpha"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].SecondaryColour.a">
                        <input type="text" title="HTML color" v-model="secondaryColourHTMLModel">
                        <input type="text" title="ASS style color" v-model="secondaryColourAssModel">
                    </div>
                    <!-- OutlineColour -->
                    <div class="colorLine">
                        <label for="style-outline-colour">Outline Colour</label>
                        <input id="style-outline-colour" type="color" v-model="outlineColourHTMLModel">
                        <input type="number" min="0" max="255" step="1" title="Alpha"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].OutlineColour.a">
                        <input type="text" title="HTML color" v-model="outlineColourHTMLModel">
                        <input type="text" title="ASS style color" v-model="outlineColourAssModel">
                    </div>
                    <!-- BackColour -->
                    <div class="colorLine">
                        <label for="style-back-colour">Back Colour</label>
                        <input id="style-back-colour" type="color" v-model="backColourHTMLModel">
                        <input type="number" min="0" max="255" step="1" title="Alpha"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].BackColour.a">
                        <input type="text" title="HTML color" v-model="backColourHTMLModel">
                        <input type="text" title="ASS style color" v-model="backColourAssModel">
                    </div>
                    <!-- Bold -->
                    <div class="checkboxLine">
                        <label for="style-bold">Bold</label>
                        <div>
                            <input id="style-bold" type="checkbox"
                                v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].Bold">
                        </div>

                    </div>
                    <!-- Italic -->
                    <div class="checkboxLine">
                        <label for="style-italic">Italic</label>
                        <div>
                            <input id="style-italic" type="checkbox"
                                v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].Italic">
                        </div>

                    </div>
                    <!-- Underline -->
                    <div class="checkboxLine">
                        <label for="style-underline">Underline</label>
                        <div>
                            <input id="style-underline" type="checkbox"
                                v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].Underline">
                        </div>

                    </div>
                    <!-- StrikeOut -->
                    <div class="checkboxLine">
                        <label for="style-strikeout">StrikeOut</label>
                        <div>
                            <input id="style-strikeout" type="checkbox"
                                v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].StrikeOut">
                        </div>

                    </div>
                    <!-- ScaleX -->
                    <div class="numberLine">
                        <label for="style-scale-x">ScaleX</label>
                        <input id="style-scale-x" type="number" min="0"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].ScaleX">
                    </div>
                    <!-- ScaleY -->
                    <div class="numberLine">
                        <label for="style-scale-y">ScaleY</label>
                        <input id="style-scale-y" type="number" min="0"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].ScaleY">
                    </div>
                    <!-- Spacing -->
                    <div class="numberLine">
                        <label for="style-spacing">Spacing</label>
                        <input id="style-spacing" type="number" min="0"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].Spacing">
                    </div>
                    <!-- Angle -->
                    <div class="numberLine">
                        <label for="style-angle">Angle</label>
                        <input id="style-angle" type="number"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].Angle">
                    </div>
                    <!-- BorderStyle -->
                    <div class="numberLine">
                        <label for="style-border-style">BorderStyle</label>
                        <select id="style-border-style"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].BorderStyle">
                            <option :value="1">1</option>
                            <option :value="3">3</option>
                        </select>
                    </div>
                    <!-- Outline -->
                    <div class="numberLine">
                        <label for="style-outline">Outline</label>
                        <input id="style-outline" type="number" min="0" step="1"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].Outline">
                    </div>
                    <!-- Shadow -->
                    <div class="numberLine">
                        <label for="style-shadow">Shadow</label>
                        <input id="style-shadow" type="number" min="0" step="1"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].Shadow">
                    </div>
                    <!-- Alignment -->
                    <div class="numberLine">
                        <label for="style-alignment">Alignment</label>
                        <input id="style-alignment" type="number" min="1" max="9" step="1"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].Alignment">
                    </div>
                    <!-- MarginL -->
                    <div class="numberLine">
                        <label for="style-margin-l">MarginL</label>
                        <input id="style-margin-l" type="number" min="0" step="1"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].MarginL">
                    </div>
                    <!-- MarginR -->
                    <div class="numberLine">
                        <label for="style-margin-r">MarginR</label>
                        <input id="style-margin-r" type="number" min="0" step="1"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].MarginR">
                    </div>
                    <!-- MarginV -->
                    <div class="numberLine">
                        <label for="style-margin-v">MarginV</label>
                        <input id="style-margin-v" type="number" min="0" step="1"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].MarginV">
                    </div>
                    <!-- Encoding -->
                    <div class="numberLine">
                        <label for="style-encoding">Encoding</label>
                        <select id="style-encoding"
                            v-model="subtitleFile.styleList.val[subtitleFile.styleList.currentRowIndex].Encoding">
                            <option :value="-1">-1. 自动检测文本书写方向 (libass)</option>
                            <option :value="0">0. ANSI</option>
                            <option :value="1">1. Default</option>
                            <option :value="2">2. Symbol</option>
                            <option :value="77">77. Mac</option>
                            <option :value="128">128. Shift JIS</option>
                            <option :value="129">129. Hangul</option>
                            <option :value="130">130. Johab</option>
                            <option :value="134">134. GB2312</option>
                            <option :value="136">136. Chinese Big5</option>
                            <option :value="161">161. Greek</option>
                            <option :value="162">162. Turkish</option>
                            <option :value="163">163. Vietnamese</option>
                            <option :value="177">177. Hebrew</option>
                            <option :value="178">178. Arabic</option>
                            <option :value="186">186. Baltic</option>
                            <option :value="204">204. Russian</option>
                            <option :value="222">222. Thai</option>
                            <option :value="238">238. Eastern European</option>
                            <option :value="255">255. OEM</option>
                        </select>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <div id="assView" v-if="isShowAssView">
        <span v-show="!isSubLoaded" class="beforeSubLoad">文本预览区</span>
        <div v-if="isSubLoaded">
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
/* global */

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

/* info */

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
                text-align: right;
                padding-right: 0.5rem;
            }

            input {
                padding-left: 0.5rem;
            }

            label.editToWrapStyle {
                width: 6rem;
            }

            #editToWrapStyle {
                width: 12.5rem;
            }
        }

        .editToPlayRes {
            appearance: textfield;
        }

        .editToLayoutRes {
            appearance: textfield;
            margin: auto;
            width: calc(44% - 2px - 1rem);
        }
    }
}

/* style */

#assStylesEditor {
    position: relative;
    height: calc(40% - 2px);
    width: 100%;
    display: inline-block;
    overflow: hidden;
    border-bottom: 1px solid lightgray;

    #assStylesEditSpace {
        position: relative;
        display: inline-block;
        width: 100%;
        height: calc(100% - 20px - 1.2rem);
        padding: 0;
        overflow: hidden;

        #assStylesListView {
            background-color: v-bind(checkName);

            position: relative;
            height: calc(30% - 1px - 0.8rem);
            padding: 0.4rem;
            border-bottom: 1px solid lightgray;

            display: flex;
            flex-wrap: wrap;
            column-gap: 0.7rem;
            row-gap: 0.5rem;
            align-content: flex-start;

            user-select: none;
            overflow-y: auto;
            scrollbar-width: thin;

            >span {
                display: inline-block;
                height: 1rem;
                font-size: 1rem;
                border: 1px solid gray;
                border-radius: 4px;
                white-space: nowrap;
                padding: 0.2rem 0.3rem;
                cursor: pointer;
                color: var(--text-color);
                background-color: var(--background-color);
            }

            >span.selected {
                color: var(--text-color);
                background-color: var(--selected-background-color);
            }

            >span:hover,
            >span.selected:hover {
                color: var(--text-color);
                background-color: var(--hover-background-color);
            }
        }

        #assStylesListDetail {
            position: relative;
            width: calc(100% - 0.8rem);
            height: calc(70% - 0.8rem);
            padding: 0.4rem;
            overflow-y: auto;
            overflow-x: hidden;
            scrollbar-width: thin;
            user-select: none;

            display: flex;
            flex-direction: column;
            gap: 0.3rem;

            .textLine {
                display: flex;
                gap: 0.3rem;
                align-items: center;

                label {
                    width: 8rem;
                    white-space: nowrap;
                    text-align: right;
                }

                input {
                    display: inline;
                    width: calc(100% - 8rem);
                }
            }

            .colorLine {
                display: flex;
                gap: 0.3rem;
                align-items: center;
                width: 100%;

                label {
                    text-align: right;
                    width: 50%;
                    min-width: fit-content;
                    white-space: nowrap;
                }

                input {
                    display: inline;
                    min-width: 2rem;
                    width: fit-content;
                    padding: 1px 2px;

                }
            }

            .checkboxLine {
                display: flex;
                gap: 0.3rem;
                align-items: center;

                label {
                    text-align: right;
                    width: 50%;
                    white-space: nowrap;
                }

                >div {
                    width: 50%;
                    height: 100%;

                    >input {
                        display: inline;
                        width: 100%;
                    }
                }
            }

            .numberLine {
                display: flex;
                gap: 0.3rem;
                align-items: center;

                label {
                    text-align: right;
                    width: 8rem;
                    white-space: nowrap;
                }

                input {
                    display: inline;
                    width: calc(100% - 8rem);
                }
            }
        }
    }
}

/* view */

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
</style>
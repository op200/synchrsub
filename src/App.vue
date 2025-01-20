<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { computed, onMounted, onBeforeUnmount, reactive, ref, watch, type VNodeRef } from 'vue'

// Pinia
import { useCounterStore } from '@/stores/mainStore';
import { storeToRefs } from 'pinia';
const mainStore = useCounterStore();

// ASS 渲染库
import ASS from 'assjs';

// 自定义字幕类
import { Sub, SubFile } from '@/subtitle'



const deskClass = reactive({
  deskDefaultWidth: true,
  deskSecWidth: false
})

function switchWidth() {
  deskClass.deskDefaultWidth = !deskClass.deskDefaultWidth
  deskClass.deskSecWidth = !deskClass.deskSecWidth
}

const tableFontSize = { str: '0.8rem', val: 0.8 }

let { subtitleFile } = storeToRefs(mainStore);

// 字幕加载与保存

let { isSubLoaded } = storeToRefs(mainStore);

let subViewTip = ref('等待载入字幕');

async function openSub() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.ass';

  isSubLoaded.value = false, subViewTip.value = '载入字幕中...';

  input.onchange = (event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target) {
            subtitleFile.value = SubFile.decode(e.target.result as string);
            isSubLoaded.value = true;
            setTimeout(() => {
              flushAssRender();
            });
          }
        };
        reader.readAsText(file);
      }
    }
  };

  input.click(); // 触发点击事件，打开文件选择器
}

function saveSub() {
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

// 字幕行选择

const isMultiSelectRow = ref(false);

function selectRow(index: number) {
  if (isMultiSelectRow.value)
    subtitleFile.value.rowList.val[index].selected = !subtitleFile.value.rowList.val[index].selected;
  else {
    subtitleFile.value.rowList.clearSelected();
    subtitleFile.value.rowList.val[index].selected = true;
  }
  subtitleFile.value.rowList.currentRowIndex = index;
}

const multiSelectButtonBackgroundColor = computed(() => {
  return isMultiSelectRow.value ? 'lightgray' : 'rgb(230, 230, 230)';
});

class KeyBordListener {
  static keyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Control') {
      isMultiSelectRow.value = true;
    }
  }
  static keyUp(event: KeyboardEvent) {
    if (!event.ctrlKey && event.key === 'Control') {
      isMultiSelectRow.value = false;
    }
  }
}

// 字幕行显示

const isShowLayer = computed(() => {
  for (const item of subtitleFile.value.rowList.val)
    if (item.sub.Layer !== 0)
      return true;
  return false;
})

const isShowActor = computed(() => {
  for (const item of subtitleFile.value.rowList.val)
    if (item.sub.Actor !== '')
      return true;
  return false;
})

const isShowEffect = computed(() => {
  for (const item of subtitleFile.value.rowList.val)
    if (item.sub.Effect !== '')
      return true;
  return false;
})

// 视频预览

const isVideoLoaded = ref(false);

const videoViewTip = ref('视频预览区');

const videoSrc = ref('');

const isFulshAssRenderOk = ref(true)

// ASS 渲染库相关变量
const videoId = 'video';
const assContainerId = 'ass-container';
const assRender = ref<ASS>();

function loadAssRender() {
  // if (isSubLoaded.value && isVideoLoaded.value) {
  assRender.value = new ASS(
    subtitleFile.value.encode(),
    document.querySelector('#' + videoId) as HTMLVideoElement,
    {
      container: document.querySelector('#' + assContainerId) as HTMLVideoElement
    }
  );
  // }
}

async function flushAssRender() {
  isFulshAssRenderOk.value = false;
  setTimeout(() => {
    isFulshAssRenderOk.value = true;
  });
  setTimeout(() => {
    loadAssRender();
  });
}

async function openVideo() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'video/*';

  isVideoLoaded.value = false, videoViewTip.value = '载入视频中...';

  input.onchange = (event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      if (file) {
        videoSrc.value = URL.createObjectURL(file);
        isVideoLoaded.value = true;
        setTimeout(() => {
          flushAssRender();
        }, 100);
      }
    }
  };

  input.click(); // 触发点击事件，打开文件选择器
}

// 视频播放控制

const videoElement = ref<HTMLVideoElement>();

const videoProgress = ref(0); // 0..100.0

const videoCurrentTime = ref<string>(Sub.ms2str(videoElement.value?.currentTime || 0));

const videoDurationTime = ref<string>(Sub.ms2str(videoElement.value?.duration || 0));

function flushVideoProgress() {
  const currentTime = videoElement.value?.currentTime || 0;
  const durationTime = videoElement.value?.duration || 0;

  videoCurrentTime.value = Sub.ms2str(currentTime * 1000);
  videoDurationTime.value = Sub.ms2str(durationTime * 1000);

  if (durationTime)
    videoProgress.value = 100 * (currentTime as number) / durationTime;
}

// 播放 / 暂停
function playVideo() {
  if (videoElement.value?.paused === undefined)
    return;
  if (videoElement.value.paused)
    videoElement.value?.play();
  else
    videoElement.value?.pause();
}

// 跳转到指定时间
function seekVideo(ms: number) {
  videoElement.value!.currentTime = ms / 1000;
}

// 静音开关
const isMuted = ref(true);

const switchMuteButtonBackgroundColor = computed(() => {
  return isMuted.value ? 'lightgray' : 'rgb(230, 230, 230)';
});

function switchMute() {
  if (videoElement.value) {
    videoElement.value.muted = !videoElement.value.muted;
    isMuted.value = videoElement.value.muted;
  }
}



// 字幕编辑

const layerModel = computed({
  get: () => subtitleFile.value.rowList.val[subtitleFile.value.rowList.currentRowIndex].sub.Layer,
  set: (newVal) => subtitleFile.value.rowList.val[subtitleFile.value.rowList.currentRowIndex].sub.Layer = newVal ? Number(newVal) : 0
});

// 生命周期

onMounted(() => {

  // 按键监听

  window.addEventListener('keydown', KeyBordListener.keyDown);
  window.addEventListener('keyup', KeyBordListener.keyUp);

  // 视频预览

  loadAssRender();
  watch(subtitleFile, () => {
    if (isSubLoaded.value && isVideoLoaded.value)
      flushAssRender();
  }, { deep: true });
});

onBeforeUnmount(() => {

  // 按键监听

  window.removeEventListener('keydown', KeyBordListener.keyDown);
  window.removeEventListener('keyup', KeyBordListener.keyUp);
});
</script>



<template>
  <div id="desk" :class="deskClass">
    <button id="deskClassSwitchButton" @click="switchWidth">
      <img src="@/assets/arrow.svg">
    </button>

    <div class="buttonBar">
      <button @click="openSub" id="openSub">载入字幕</button>
      <button @click="saveSub" id="saveSub">保存字幕</button>
      <button @click="openVideo" id="openVideo">载入视频</button>

      <button @click="isMultiSelectRow = !isMultiSelectRow;" id="multiSelect">选择多行</button>
      <button @click="subtitleFile.rowList.val = subtitleFile.rowList.val.filter(item => !item.selected)"
        id="delSelected">删除所选</button>
      <button @click="subtitleFile.rowList.insertEmpty(0)" id="insertBefore">前插</button>
      <button @click="subtitleFile.rowList.insertEmpty(1)" id="multiAfter">后插</button>

      <button @click="playVideo">播放 / 暂停</button>
      <button @click="seekVideo(subtitleFile.rowList.val[subtitleFile.rowList.currentRowIndex].sub.Start)">跳转</button>
      <button @click="switchMute" id="switchMute">静音</button>

      <div id="videoProgress">
        <input type="range" v-model="videoProgress"
          @input="seekVideo(videoProgress * (videoElement?.duration || 0) * 10)" min="0" max="100">
        <span>{{ videoCurrentTime }} / {{ videoDurationTime }}</span>
      </div>
    </div>



    <div class="workSpace">


      <div class="subViewSpace">
        <table v-show="isSubLoaded">
          <colgroup>
            <col class="tNum">
            <col class="tLayer" v-show="isShowLayer">
            <col class="tStart">
            <col class="tEnd">
            <col class="tStyle">
            <col class="tActor" v-show="isShowActor">
            <col class="tEffect" v-show="isShowEffect">
            <col class="tText">
          </colgroup>
          <thead>
            <tr>
              <th class="tNum">#</th>
              <th class="tLayer" v-show="isShowLayer">L</th>
              <th class="tStart">Start</th>
              <th class="tEnd">End</th>
              <th class="tStyle">Style</th>
              <th class="tActor" v-show="isShowActor">Actor</th>
              <th class="tEffect" v-show="isShowEffect">Effect</th>
              <th class="tText">Text</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in subtitleFile.rowList.val" @click="selectRow(index)" :class="{
              comment: item.sub.Comment,
              selected: item.selected,
              selectedAndComment: item.selected && item.sub.Comment,
              current: index === subtitleFile.rowList.currentRowIndex
            }">
              <td class="tNum">{{ index + 1 }}</td>
              <td class="tLayer" v-show="isShowLayer">{{ item.sub['Layer'] === 0 ? '' : item.sub['Layer'] }}</td>
              <td class="tStart">{{ item.sub.getStartStr() }}</td>
              <td class="tEnd">{{ item.sub.getEndStr() }}</td>
              <td class="tStyle">{{ item.sub['Style'] }}</td>
              <td class="tActor" v-show="isShowActor">{{ item.sub['Actor'] }}</td>
              <td class="tEffect" v-show="isShowEffect">{{ item.sub['Effect'] }}</td>
              <td class="tText">{{ item.sub['Text'] }}</td>
            </tr>
          </tbody>
        </table>
        <span v-show="!isSubLoaded" class="beforeSubLoad">{{ subViewTip }}</span>
      </div>


      <div class="editorSpace">

        <div id="videoView">
          <span v-show="!isVideoLoaded" class="beforeSubLoad">{{ videoViewTip }}</span>
          <div id="player" v-show="isVideoLoaded">
            <video ref="videoElement" :id="videoId" :src="videoSrc" muted volume="0.1" @timeupdate="flushVideoProgress"
              @loadedmetadata="flushVideoProgress"></video>
            <div :id="assContainerId" v-if="isFulshAssRenderOk"></div>
          </div>
        </div>

        <div id="assEditor">
          <span v-show="!isSubLoaded" class="beforeSubLoad">字幕编辑区</span>
          <div v-if="isSubLoaded">
            <div class="editorBar">

              <!-- 注释 -->
              <span class="checkboxSpace">
                <input type="checkbox" id="rowCommentCheckbox"
                  v-model="subtitleFile.rowList.val[subtitleFile.rowList.currentRowIndex].sub.Comment">
                <label for="rowCommentCheckbox">注释</label>
              </span>

              <!-- 层级 -->
              <input type="number" min="0" step="1" id="layerEditor" placeholder="Layer" v-model="layerModel">

              <!-- 样式 -->
              <input type="text" id="styleEditor" placeholder="Style"
                v-model="subtitleFile.rowList.val[subtitleFile.rowList.currentRowIndex].sub.Style">

              <!-- 开始时间 -->
              <input type="text" id="startEditor" placeholder="Start" title="开始时间"
                v-model="subtitleFile.rowList.val[subtitleFile.rowList.currentRowIndex].sub.Start">

              <!-- 结束时间 -->
              <input type="text" id="endEditor" placeholder="End" title="结束时间"
                v-model="subtitleFile.rowList.val[subtitleFile.rowList.currentRowIndex].sub.End">

              <!-- 说话人 -->
              <input type="text" id="actorEditor" placeholder="Actor"
                v-model="subtitleFile.rowList.val[subtitleFile.rowList.currentRowIndex].sub.Actor">

              <!-- 特效 -->
              <input type="text" id="effectEditor" placeholder="Effect"
                v-model="subtitleFile.rowList.val[subtitleFile.rowList.currentRowIndex].sub.Effect">

              <!-- 左边距 -->
              <input type="number" min="0" step="1" id="marginLEditor" placeholder="Left Margin" title="左边距"
                v-model="subtitleFile.rowList.val[subtitleFile.rowList.currentRowIndex].sub.MarginL">

              <!-- 右边距 -->
              <input type="number" min="0" step="1" id="marginREditor" placeholder="Right Margin" title="右边距"
                v-model="subtitleFile.rowList.val[subtitleFile.rowList.currentRowIndex].sub.MarginR">

              <!-- 垂直边距 -->
              <input type="number" min="0" step="1" id="marginVEditor" placeholder="Vertical Margin" title="垂直边距"
                v-model="subtitleFile.rowList.val[subtitleFile.rowList.currentRowIndex].sub.MarginV">

            </div>
            <textarea spellcheck="false" placeholder="Text"
              v-model="subtitleFile.rowList.val[subtitleFile.rowList.currentRowIndex].sub.Text"></textarea>
          </div>
        </div>


      </div>
    </div>
    <!-- <div class="buttonNav">
    </div> -->
  </div>


  <div id="panel" v-show="deskClass.deskDefaultWidth">
    <nav>
      <RouterLink to="/">ASS Info</RouterLink>
      <RouterLink to="/setting">Setting</RouterLink>
      <RouterLink to="/userlink">User</RouterLink>
    </nav>
    <RouterView style="height: calc(100% - 1.6rem);width: 100%;" />
  </div>
</template>



<style scoped>
/* global */

.checkboxSpace {
  cursor: pointer;

  * {
    cursor: pointer;
    user-select: none;
  }
}

.router-link-exact-active {
  background-color: rgb(226, 226, 226);
}

/* desk */

#desk {
  display: inline-block;
  height: 100%;
  position: relative;
  overflow: hidden;

  >#deskClassSwitchButton>img {
    position: absolute;
    left: 2px;
    top: 7.5px;
  }
}

.deskDefaultWidth {
  width: 75%;
  border-right: 1px solid lightgray;

  >#deskClassSwitchButton>img {
    transform: rotate(270deg);
  }
}

.deskSecWidth {
  width: 100%;

  >#deskClassSwitchButton>img {
    transform: rotate(90deg);
  }
}

#deskClassSwitchButton {
  position: absolute;
  top: calc(50% - 1rem);
  right: -1rem;
  border: 1px solid lightgray;
  background-color: rgb(240, 240, 240);
  border-radius: 50%;
  height: 2rem;
  width: 2rem;
}

#deskClassSwitchButton:hover {
  background-color: rgb(210, 210, 210);
}

/* button bar */

.buttonBar {
  display: inline-block;
  width: calc(100% - 1.5px - 4rem);
  height: 15%;
  border: 1px solid lightgray;
  margin: 1rem 2rem;

  >button {
    margin: 1rem;
    margin-right: 0;
    background-color: rgb(230, 230, 230);
    border: 1px solid gray;
    border-radius: 4px;
  }

  #openSub:hover {
    background-color: lightgray;
  }

  #saveSub:hover {
    background-color: lightgray;
  }

  #multiSelect {
    background-color: v-bind(multiSelectButtonBackgroundColor);
  }

  #switchMute {
    background-color: v-bind(switchMuteButtonBackgroundColor);
  }

  #videoProgress {
    display: flex;
    width: calc(100% - 2rem);
    margin: 0 1rem;

    >input {
      display: inline-block;
      width: calc(100% - 13rem);
    }

    >span {
      display: inline-block;
      width: auto;
      height: 100%;
      text-align: center;
      margin: auto;
      padding: 0;
    }
  }
}

/* work space */

.workSpace {
  display: flex;
  flex-wrap: nowrap;
  height: 90%;
  width: 100%;
}

.subViewSpace {
  display: inline-block;
  position: relative;
  line-height: 1rem;
  border: 1px solid lightgray;
  border-right-width: 0.5px;
  margin: 0 0 2rem 2rem;
  height: calc(90% - 2px - 2rem);
  width: calc(65% - 1.5px - 2rem);
  overflow-x: hidden;
  overflow-y: scroll;

  >table {
    width: 100%;
    border-collapse: collapse;
    font-size: v-bind('tableFontSize.str');
    letter-spacing: auto;
    table-layout: auto;
    user-select: none;

    >thead {
      width: 100%;
      position: sticky;
      top: 0;

      th {
        padding: 0.2rem;
        border: 1px solid gray;
        border-top: 0;
        background-color: var(--background-color);
      }
    }

    >tbody {
      width: 100%;

      td {
        border: 1px solid gray;
        padding: 0.2rem;
      }

      tr:hover {
        background-color: lightgray;
      }

      tr.comment {
        background-color: rgb(216, 222, 245);
      }

      tr.selected {
        background-color: lightgray;
      }

      tr.selectedAndComment {
        background-color: rgb(177, 185, 214);
      }

      tr.current>td {
        border-bottom: 1px solid red;
      }

      tr.current>td:first-child {
        border-left: 1px solid red;
      }

      tr.current>td:last-child {
        border-right: 1px solid red;
      }
    }

    .tNum {
      text-align: center;
    }

    .tLayer {
      text-align: center;
    }

    .tStart {
      text-align: center;
    }

    .tEnd {
      text-align: center;
    }

    .tStyle {
      text-align: left;
    }

    .tActor {
      text-align: left;
    }

    td.tActor {
      word-break: break-word;
    }

    .tEffect {
      text-align: left;
    }

    td.tEffect {
      word-break: break-word;
    }

    .tText {
      text-align: left;
    }

    td.tText {
      word-break: break-word;
    }
  }
}

.editorSpace {
  display: inline-block;
  overflow-x: hidden;
  overflow-y: auto;
  line-height: 1rem;
  border: 1px solid lightgray;
  border-left-width: 0.5px;
  margin: 0 2rem 2rem 0;
  height: calc(90% - 2px - 2rem);
  width: calc(35% - 1.5px - 2rem);

  >div {
    width: 100%;
    position: relative;
    border-bottom: 1px solid lightgray;
  }
}

#videoView {
  width: 100%;
  aspect-ratio: 16 / 9;
  position: sticky;
  overflow: hidden;
  top: 0;
  z-index: 100;

  #player {
    width: 100%;
    height: 100%;

    >video {
      -webkit-width: 100px;
      width: 100%;
      height: 100%;
    }

    >div {
      width: 100%;
      height: 100%;
    }
  }
}

#assEditor {
  min-height: 20%;
  height: auto;
  border-bottom: 0;

  >div {

    >.editorBar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      min-height: 1rem;
      margin: 0.5rem 0;
      padding: 0 0.3rem;

      >input {
        display: inline;
        width: 5rem;
      }

      #layerEditor {
        width: 3.5rem;
      }

      #styleEditor {
        width: auto;
        min-width: 4rem;
      }

      #startEditor {
        width: calc(50% - 1rem);
      }

      #endEditor {
        width: calc(50% - 1rem);
      }

      #actorEditor {
        width: calc(50% - 1rem);
      }

      #effectEditor {
        width: calc(50% - 1rem);
      }

      #marginLEditor {
        width: calc(33% - 1.2rem);
        appearance: textfield;
      }

      #marginREditor {
        width: calc(33% - 1.2rem);
        appearance: textfield;
      }

      #marginVEditor {
        width: calc(33% - 1.2rem);
        appearance: textfield;
      }
    }

    textarea {
      width: calc(100% - 12px);
      min-height: 4rem;
      height: auto;
      margin: 0 4px;
      padding: 0;
      font-size: 1rem;
      word-break: break-word;
      resize: vertical;
    }
  }
}



/* panel */

#panel {
  display: inline-block;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  height: 100%;
  width: calc(25% - 1px);
  line-height: 1rem;

  >nav {
    height: 1.6rem;
    overflow-x: auto;
    border-bottom: 1px solid lightgray;
    line-height: 1.6rem;

    >* {
      display: inline;
      text-decoration: none;
      color: var(--text-color);
      border-right: 1px solid lightgray;
      padding: 0.3rem 1rem;
      white-space: nowrap;
    }

    >*:hover {
      background-color: rgb(226, 226, 226);
    }
  }
}
</style>

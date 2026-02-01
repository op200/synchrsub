import { ref, watch } from 'vue'
import { Sub, SubFile } from '@/subtitle'
import { defineStore } from 'pinia'

export const useMainStore = defineStore('mainStore', () => {

  let isSubLoaded = ref(false)


  const subtitleFile = ref(SubFile.decode(''))
  const name = "synchsub_subtitleFile"
  const jsonStr = localStorage.getItem(name)
  if (jsonStr) {
    subtitleFile.value = SubFile.decode(JSON.parse(jsonStr))
    isSubLoaded.value = true
  }
  watch(subtitleFile,
    () => {
      localStorage.setItem(name, JSON.stringify(subtitleFile.value.encode()))
    },
    { deep: true })

  return { isSubLoaded, subtitleFile }
})

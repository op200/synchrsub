import { ref, reactive, computed } from 'vue'
import { Sub, SubFile } from '@/subtitle'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('mainStore', () => {

  const emptySubFile = SubFile.decode('');
  const subtitleFile = ref(emptySubFile);

  let isSubLoaded = ref(false);

  return { isSubLoaded, subtitleFile }
})

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800 font-sans py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      
      <div class="text-center mb-10">
        <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
          🛠️ PDF 极客工具箱
        </h1>
        <p class="text-lg text-gray-500">100% 浏览器本地处理 · 绝对保护隐私</p>
      </div>

      <div class="flex justify-center space-x-4 mb-8">
        <button 
          @click="currentTab = 'split'"
          :class="['px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2', currentTab === 'split' ? 'bg-blue-600 text-white shadow-md focus:ring-blue-500 hover:bg-blue-700' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-200']"
        >
          📄 PDF 拆分
        </button>
        <button 
          @click="currentTab = 'merge'"
          :class="['px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2', currentTab === 'merge' ? 'bg-blue-600 text-white shadow-md focus:ring-blue-500 hover:bg-blue-700' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-200']"
        >
          🔗 PDF 合并
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        <div v-if="currentTab === 'split'" class="p-8">
          
          <div class="mb-8">
            <label class="block text-sm font-medium text-gray-700 mb-3">1. 选择 PDF 文件：</label>
            <div v-if="!splitFileName" class="flex items-center justify-center w-full">
                <label for="split-dropzone-file" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg class="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <p class="mb-2 text-sm text-gray-500"><span class="font-semibold">点击上传</span> 或拖拽文件至此</p>
                        <p class="text-xs text-gray-400">仅支持 PDF 格式</p>
                    </div>
                    <input id="split-dropzone-file" type="file" class="hidden" accept="application/pdf" @change="handleSplitFileChange" />
                </label>
            </div>
            
            <div v-if="splitFileName" class="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between border border-blue-100">
              <div class="flex items-center min-w-0 flex-1 mr-4">
                <span class="text-sm font-medium text-blue-800 truncate pr-4">✅ {{ splitFileName }}</span>
                <span v-if="splitTotalPages > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                  共 {{ splitTotalPages }} 页
                </span>
              </div>
              <button @click="removeSplitFile" class="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors flex-shrink-0" title="删除文件">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          </div>

          <div v-if="splitTotalPages > 0" class="mb-8">
            <label class="block text-sm font-medium text-gray-700 mb-3">2. 选择提取范围：</label>
            
            <div class="flex space-x-6 mb-4">
              <label class="inline-flex items-center cursor-pointer">
                <input type="radio" value="range" v-model="splitMode" class="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                <span class="ml-2 text-sm text-gray-700">连续区间</span>
              </label>
              <label class="inline-flex items-center cursor-pointer">
                <input type="radio" value="custom" v-model="splitMode" class="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                <span class="ml-2 text-sm text-gray-700">高级自定义</span>
              </label>
            </div>

            <div v-if="splitMode === 'range'" class="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center text-sm text-gray-700">
              <span>从第</span>
              <input type="number" v-model="startPage" min="1" :max="endPage" class="mx-2 w-16 text-center rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-1.5 px-3" />
              <span>页 到第</span>
              <input type="number" v-model="endPage" :min="startPage" :max="splitTotalPages" class="mx-2 w-16 text-center rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-1.5 px-3" />
              <span>页</span>
            </div>

            <div v-if="splitMode === 'custom'" class="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input type="text" v-model="customRange" :placeholder="`例如: 1-3, 5, ${splitTotalPages}`" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3" />
              <p class="mt-2 text-xs text-gray-500">格式：单个页码(如 5) 或 范围(如 1-3)，用英文逗号分隔。</p>
            </div>
          </div>

          <div v-if="splitTotalPages > 0" class="mb-8">
            <label class="block text-sm font-medium text-gray-700 mb-3">3. 选择输出方式：</label>
            <div class="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-6">
              <label class="inline-flex items-center cursor-pointer">
                <input type="radio" value="merge" v-model="exportMode" class="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                <span class="ml-2 text-sm text-gray-700">合并为一个 PDF</span>
              </label>
              <label class="inline-flex items-center cursor-pointer">
                <input type="radio" value="zip" v-model="exportMode" class="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                <span class="ml-2 text-sm text-gray-700">拆分为多个独立 PDF (ZIP 打包)</span>
              </label>
            </div>
          </div>

          <button 
            @click="executeSplit" 
            :disabled="!splitFile || isProcessing || (splitMode === 'custom' && !customRange)"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg v-if="isProcessing" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ isProcessing ? '处理中...' : '立即拆分并下载' }}
          </button>
        </div>


        <div v-if="currentTab === 'merge'" class="p-8">
          
          <div class="mb-8">
            <label class="block text-sm font-medium text-gray-700 mb-3">1. 上传多个 PDF 文件：</label>
            <div class="flex items-center justify-center w-full">
                <label for="merge-dropzone-file" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg class="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                        <p class="mb-2 text-sm text-gray-500"><span class="font-semibold">点击选择</span> 多个文件，支持按住 Ctrl 多选</p>
                    </div>
                    <input id="merge-dropzone-file" type="file" multiple class="hidden" accept="application/pdf" @change="handleMergeFilesChange" />
                </label>
            </div>
          </div>

          <div v-if="mergeList.length > 0" class="mb-8">
            <label class="block text-sm font-medium text-gray-700 mb-3">2. 调整合并顺序：</label>
            
            <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <ul class="divide-y divide-gray-200">
                <li 
                  v-for="(item, index) in mergeList" 
                  :key="item.id"
                  class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-move drag-item"
                  draggable="true"
                  @dragstart="handleDragStart(index)"
                  @dragover.prevent
                  @drop="handleDrop(index)"
                >
                  <div class="flex items-center min-w-0 flex-1 mr-4">
                    <div class="text-gray-400 cursor-grab active:cursor-grabbing mr-3">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </div>
                    <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mr-3 flex-shrink-0">
                      {{ index + 1 }}
                    </span>
                    <span class="text-sm font-medium text-gray-900 truncate" :title="item.name">{{ item.name }}</span>
                    <span class="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap flex-shrink-0">
                      {{ item.pageCount }} 页
                    </span>
                  </div>
                  
                  <div class="flex items-center space-x-2 flex-shrink-0">
                    <button @click="moveUp(index)" :disabled="index === 0" class="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100 transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                    </button>
                    <button @click="moveDown(index)" :disabled="index === mergeList.length - 1" class="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100 transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <button @click="removeFile(index)" class="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors ml-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                </li>
              </ul>
            </div>
            
            <div class="mt-3 flex justify-end text-sm text-gray-600">
              当前已选 <span class="font-bold text-blue-600 mx-1">{{ mergeList.length }}</span> 个文件，合并后预估 <span class="font-bold text-blue-600 mx-1">{{ totalMergePages }}</span> 页。
            </div>
          </div>

          <button 
            @click="executeMerge" 
            :disabled="mergeList.length < 2 || isProcessing"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg v-if="isProcessing" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ isProcessing ? '处理中...' : '立即合并' }}
          </button>
        </div>
      </div>

      <div v-if="errorMessage" class="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start">
        <svg class="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p class="text-sm text-red-700">{{ errorMessage }}</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { splitAndDownloadPdf, getPdfPageCount, splitToZipAndDownload, mergePdfs } from './utils/pdfProcessor';

const currentTab = ref<'split' | 'merge'>('split');
const isProcessing = ref(false);
const errorMessage = ref('');

// ================= 拆分模式状态 =================
const splitFile = ref<File | null>(null);
const splitFileName = ref('');
const splitTotalPages = ref(0);
const splitMode = ref<'range' | 'custom'>('range');
const startPage = ref(1);
const endPage = ref(1);
const customRange = ref('');
const exportMode = ref<'merge' | 'zip'>('merge');

const handleSplitFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    splitFile.value = target.files[0];
    splitFileName.value = splitFile.value.name;
    errorMessage.value = '';
    splitTotalPages.value = 0;
    try {
      splitTotalPages.value = await getPdfPageCount(splitFile.value);
      endPage.value = splitTotalPages.value;
      startPage.value = 1;
    } catch (error) {
      errorMessage.value = '读取 PDF 失败，文件可能已损坏。';
    }
  }
};

// 新增：清除拆分文件函数
const removeSplitFile = () => {
  splitFile.value = null;
  splitFileName.value = '';
  splitTotalPages.value = 0;
  customRange.value = '';
  // 顺便把底层的 input 的 value 清空，防止用户删除后，再次上传同一个文件时不触发 change 事件
  const input = document.getElementById('split-dropzone-file') as HTMLInputElement;
  if (input) {
    input.value = '';
  }
};

const finalRangeString = computed(() => {
  return splitMode.value === 'range' ? `${startPage.value}-${endPage.value}` : customRange.value;
});

const executeSplit = async () => {
  if (!splitFile.value) return;
  isProcessing.value = true;
  errorMessage.value = '';
  try {
    if (exportMode.value === 'merge') {
      await splitAndDownloadPdf(splitFile.value, finalRangeString.value);
    } else {
      await splitToZipAndDownload(splitFile.value, finalRangeString.value);
    }
  } catch (error: any) {
    errorMessage.value = error.message;
  } finally {
    isProcessing.value = false;
  }
};

// ================= 合并模式状态 =================
interface MergeItem { id: number; file: File; name: string; pageCount: number; }
const mergeList = ref<MergeItem[]>([]);
const draggedIndex = ref<number | null>(null);
let nextId = 1; 

const totalMergePages = computed(() => mergeList.value.reduce((t, i) => t + i.pageCount, 0));

const handleMergeFilesChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    errorMessage.value = '';
    const filesArray = Array.from(target.files);
    for (const file of filesArray) {
      try {
        const pages = await getPdfPageCount(file);
        mergeList.value.push({ id: nextId++, file: file, name: file.name, pageCount: pages });
      } catch (error) {
        errorMessage.value = `读取 ${file.name} 失败，已跳过。`;
      }
    }
    target.value = ''; 
  }
};

const handleDragStart = (index: number) => { draggedIndex.value = index; };
const handleDrop = (index: number) => {
  if (draggedIndex.value === null || draggedIndex.value === index) return;
  const list = [...mergeList.value];
  const [draggedItem] = list.splice(draggedIndex.value, 1);
  list.splice(index, 0, draggedItem);
  mergeList.value = list;
  draggedIndex.value = null;
};
const moveUp = (index: number) => {
  if (index === 0) return;
  const temp = mergeList.value[index];
  mergeList.value[index] = mergeList.value[index - 1];
  mergeList.value[index - 1] = temp;
};
const moveDown = (index: number) => {
  if (index === mergeList.value.length - 1) return;
  const temp = mergeList.value[index];
  mergeList.value[index] = mergeList.value[index + 1];
  mergeList.value[index + 1] = temp;
};
const removeFile = (index: number) => { mergeList.value.splice(index, 1); };

const executeMerge = async () => {
  if (mergeList.value.length < 2) return;
  isProcessing.value = true;
  errorMessage.value = '';
  try {
    const filesToMerge = mergeList.value.map(item => item.file);
    await mergePdfs(filesToMerge);
  } catch (error: any) {
    errorMessage.value = error.message;
  } finally {
    isProcessing.value = false;
  }
};
</script>
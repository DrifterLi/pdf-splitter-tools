import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
/**
 * 解析用户输入的页码范围规则
 * @param inputStr 用户输入的字符串，如 "1-3, 5, 8"
 * @param maxPages PDF的总页数
 * @returns 排序去重后的页码数组 (基于0的索引)
 */
export function parsePageRanges(inputStr: string, maxPages: number): number[] {
  const pages = new Set<number>();
  const parts = inputStr.split(',');

  for (let part of parts) {
    part = part.trim();
    if (!part) continue;

    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= maxPages) pages.add(i - 1);
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= maxPages) {
        pages.add(page - 1);
      }
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * 核心拆分并触发下载函数
 */
export async function splitAndDownloadPdf(file: File, rangeStr: string): Promise<void> {
  // 1. 读取原始 PDF
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = srcDoc.getPageCount();

  // 2. 解析需要提取的页码
  const selectedPages = parsePageRanges(rangeStr, totalPages);
  
  if (selectedPages.length === 0) {
    throw new Error('未识别到有效的页码，请检查输入格式或是否超出总页数！');
  }

  // 3. 创建新 PDF 并拷贝页面
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, selectedPages);
  copiedPages.forEach((page) => newDoc.addPage(page));

  // 4. 导出并触发浏览器本地下载
  const pdfBytes = await newDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `拆分结果_${file.name}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 快速获取 PDF 文件的总页数
 */
export async function getPdfPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  // 仅加载文档元数据以提升速度
  const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return doc.getPageCount();
}

/**
 * 将 PDF 的指定页码分别拆分为独立文件，并打包为 ZIP 下载
 */
export async function splitToZipAndDownload(file: File, rangeStr: string): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = srcDoc.getPageCount();

  const selectedPages = parsePageRanges(rangeStr, totalPages);
  
  if (selectedPages.length === 0) {
    throw new Error('未识别到有效的页码！');
  }

  // 初始化 ZIP 实例
  const zip = new JSZip();
  // 创建一个文件夹存放这些 PDF
  const folderName = `拆分结果_${file.name.replace('.pdf', '')}`;
  const imgFolder = zip.folder(folderName);

  // 遍历每一个选中的页码，生成独立的 PDF
  for (let i = 0; i < selectedPages.length; i++) {
    const pageIndex = selectedPages[i];
    
    // 创建单页文档
    const singleDoc = await PDFDocument.create();
    const [copiedPage] = await singleDoc.copyPages(srcDoc, [pageIndex]);
    singleDoc.addPage(copiedPage);
    
    // 保存单页 PDF 为二进制
    const pdfBytes = await singleDoc.save();
    
    // 添加到 ZIP 文件夹中（文件名加上实际的页码，基于 1 开始）
    if (imgFolder) {
      imgFolder.file(`第_${pageIndex + 1}_页.pdf`, pdfBytes);
    }
  }

  // 生成最终的 ZIP 文件
  const zipContent = await zip.generateAsync({ type: 'blob' });
  
  // 触发浏览器下载 ZIP
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipContent);
  link.download = `${folderName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 将多个 PDF 文件按照数组顺序合并为一个 PDF 并下载
 * @param files 已经通过拖拽排好序的文件数组
 */
export async function mergePdfs(files: File[]): Promise<void> {
  if (files.length === 0) {
    throw new Error('请至少选择一个 PDF 文件进行合并！');
  }

  // 1. 创建一个全新的空 PDF 文档
  const mergedDoc = await PDFDocument.create();

  // 2. 依次循环读取并合并每一个文件
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    // 忽略加密，保证读取顺利
    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    
    // 生成当前文件所有页面的索引数组 (例如 5 页就是 [0, 1, 2, 3, 4])
    const pageIndices = Array.from({ length: srcDoc.getPageCount() }, (_, i) => i);
    
    // 从源文档中拷贝所有页面
    const copiedPages = await mergedDoc.copyPages(srcDoc, pageIndices);
    
    // 将拷贝的页面依次追加到合并文档中
    copiedPages.forEach((page) => mergedDoc.addPage(page));
  }

  // 3. 保存并触发浏览器本地下载
  const pdfBytes = await mergedDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  // 用当前时间戳命名防止重名
  link.download = `合并生成_${new Date().getTime()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
/// <reference lib="webworker" />

import { functions } from '../lib/pdfium/functions';
import { createPdfium } from '../lib/pdfium/pdfium';

type PDFiumModule = any;

let pdfium: PDFiumModule | null = null;
let wrappedModule: any = null;

// Helper to wrap functions (similar to base.ts)
function wrapModule(mod: any) {
    const wrapped: any = { pdfium: mod };
    for (const key in functions) {
        // If the module already has the function (provided by pdfium.js), use it.
        // Otherwise, try to cwrap it.
        if (typeof mod[key] === 'function') {
            wrapped[key] = mod[key];
        } else {
            const ident = key as keyof typeof functions;
            const args = functions[ident][0];
            const ret = functions[ident][1];
            try {
                wrapped[ident] = mod.cwrap(key, ret, args);
            } catch (e) {
                console.warn(`Failed to wrap ${key}`, e);
            }
        }
    }
    return wrapped;
}

async function initPDFium() {
    if (wrappedModule) return;

    try {
        // @ts-ignore
        const Module = await createPdfium({
            locateFile: (path: string) => {
                if (path.endsWith('.wasm')) return self.location.origin + '/pdfium.wasm';
                return path;
            }
        });

        pdfium = Module;
        wrappedModule = wrapModule(Module);

        // Initialize library using PDFiumExt_Init (custom extension wrapper)
        if (wrappedModule.PDFiumExt_Init) {
            console.log('[Worker Debug] Calling PDFiumExt_Init');
            wrappedModule.PDFiumExt_Init();
        } else {
            console.warn('[Worker Debug] PDFiumExt_Init not found - library may not initialize properly');
        }

        console.log('PDFium Module Ready');
        const exports = Module.wasmExports || Module.asm;
        if (exports) {
            console.log('WASM Exports found');
        } else {
            console.log('WASM Exports missing');
        }

        self.postMessage({ type: 'READY' });
    } catch (err) {
        console.error('Failed to init PDFium', err);
        self.postMessage({ type: 'ERROR', payload: String(err) });
    }
}

self.onmessage = async (e: MessageEvent) => {
    const { type, payload, id } = e.data;

    if (type === 'INIT') {
        await initPDFium();
        return;
    }

    if (!wrappedModule) {
        await initPDFium();
    }

    try {
        switch (type) {
            case 'GENERATE_THUMBNAIL':
                await handleGenerateThumbnail(payload, id);
                break;
            case 'GENERATE_PAGE_THUMBNAIL':
                await handleGeneratePageThumbnail(payload.file, payload.pageIndex, id);
                break;
            case 'GENERATE_ALL_PAGE_THUMBNAILS':
                await handleGenerateAllPageThumbnails(payload, id);
                break;
            case 'GET_PAGE_COUNT':
                await handleGetPageCount(payload, id);
                break;
            case 'MERGE_PDFS':
                await handleMergePDFs(payload, id);
                break;
            case 'MERGE_PDFS_WITH_ORDER':
                await handleMergePDFsWithOrder(payload, id);
                break;
            case 'SPLIT_PDF':
                await handleSplitPDF(payload.file, payload.splitRanges, id);
                break;
            case 'ADD_BLANK_PAGES':
                await handleAddBlankPages(payload.file, payload.blankPages, id);
                break;
            case 'N_UP_PDF':
                await handleNUpPDF(payload.file, payload.options, id);
                break;
            case 'ROTATE_PDF':
                await handleRotatePDF(payload.file, payload.rotations, id);
                break;
            case 'COMBINE_SINGLE_PAGE':
                await handleCombineSinglePage(payload.file, payload.options, id);
                break;
            case 'DETECT_BLANK_PAGES':
                await handleDetectBlankPages(payload.file, payload.threshold, id);
                break;
            case 'REMOVE_BLANK_PAGES':
                await handleRemoveBlankPages(payload.file, payload.blankPageIndexes, id);
                break;
            case 'COMPRESS_PDF':
                await handleCompressPDF(payload.file, payload.options, id);
                break;
            case 'POSTERIZE_PDF':
                await handlePosterizePDF(payload.file, payload.pageIndexes, payload.gridCols, payload.gridRows, payload.overlapPts, id);
                break;
            default:
                console.warn('Unknown message type', type);
        }
    } catch (error: any) {
        self.postMessage({
            type: 'ERROR',
            id,
            payload: error.message || String(error)
        });
    }
};

async function handleGenerateThumbnail(file: File, reqId: string) {
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Use wasmExports.malloc like the old project
    const wasmExports = wrappedModule.pdfium.wasmExports;
    if (!wasmExports || !wasmExports.malloc || !wasmExports.free) {
        console.error("[Worker Debug] wasmExports.malloc/free not found on module");
        throw new Error("wasmExports.malloc/free not found");
    }

    console.log(`[Worker Debug] Allocating ${uint8Array.length} bytes`);
    const fileData = wasmExports.malloc(uint8Array.length);
    console.log(`[Worker Debug] Allocated at ptr=${fileData}`);

    // Use HEAPU8 directly like the old project
    if (!wrappedModule.pdfium.HEAPU8) {
        console.error("[Worker Debug] HEAPU8 not available on module");
        throw new Error("HEAPU8 not available");
    }

    console.log(`[Worker Debug] Writing to HEAPU8 (len=${wrappedModule.pdfium.HEAPU8.length}) at ${fileData}`);
    wrappedModule.pdfium.HEAPU8.set(uint8Array, fileData);

    console.log(`[Worker Debug] calling FPDF_LoadMemDocument`);
    const doc = wrappedModule.FPDF_LoadMemDocument(fileData, uint8Array.length, "");
    if (!doc) {
        wasmExports.free(fileData);
        throw new Error("Failed to load document");
    }

    const page = wrappedModule.FPDF_LoadPage(doc, 0);
    if (!page) {
        wrappedModule.FPDF_CloseDocument(doc);
        wasmExports.free(fileData);
        throw new Error("Failed to load page 0");
    }

    const scale = 1.0; // Higher scale for sharper thumbnails
    let width = wrappedModule.FPDF_GetPageWidth(page);
    let height = wrappedModule.FPDF_GetPageHeight(page);

    console.log(`[Worker Debug] Page info: w=${width}, h=${height}`);

    const thumbWidth = Math.floor(width * scale);
    const thumbHeight = Math.floor(height * scale);

    const bitmap = wrappedModule.FPDFBitmap_Create(thumbWidth, thumbHeight, 0);
    if (!bitmap) {
        wrappedModule.FPDF_ClosePage(page);
        wrappedModule.FPDF_CloseDocument(doc);
        wasmExports.free(fileData);
        throw new Error("Failed to create bitmap");
    }

    console.log(`[Worker Debug] Bitmap created: w=${thumbWidth}, h=${thumbHeight}`);

    const fillRect = 0xFFFFFFFF;
    wrappedModule.FPDFBitmap_FillRect(bitmap, 0, 0, thumbWidth, thumbHeight, fillRect);

    wrappedModule.FPDF_RenderPageBitmap(bitmap, page, 0, 0, thumbWidth, thumbHeight, 0, 0);

    // Verify buffer and stride
    const ptr = wrappedModule.FPDFBitmap_GetBuffer(bitmap);
    const stride = wrappedModule.FPDFBitmap_GetStride(bitmap);

    // Use HEAPU8 directly for reading bitmap data
    const bitmapHeap = wrappedModule.pdfium.HEAPU8;

    // Safety check
    if (!bitmapHeap || bitmapHeap.length === 0) {
        throw new Error("WASM memory heap is invalid or detached");
    }

    const bufferLen = stride * thumbHeight;

    console.log(`[Worker Debug] Thumbnail Gen: ptr=${ptr}, stride=${stride}, h=${thumbHeight}, len=${bufferLen}, heap=${bitmapHeap.length}, end=${ptr + bufferLen}`);

    if (ptr + bufferLen > bitmapHeap.length) {
        throw new Error(`Memory access out of bounds: ptr=${ptr}, len=${bufferLen}, heap=${bitmapHeap.length}`);
    }

    // copy data
    const pixelData = new Uint8Array(bitmapHeap.subarray(ptr, ptr + bufferLen)).slice();

    wrappedModule.FPDFBitmap_Destroy(bitmap);
    wrappedModule.FPDF_ClosePage(page);
    wrappedModule.FPDF_CloseDocument(doc);
    wasmExports.free(fileData);

    self.postMessage({
        type: 'THUMBNAIL_GENERATED',
        id: reqId,
        payload: {
            width: thumbWidth,
            height: thumbHeight,
            stride,
            data: pixelData
        }
    }, [pixelData.buffer]);
}

// Generate thumbnail for a specific page
async function handleGeneratePageThumbnail(file: File, pageIndex: number, reqId: string) {
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    const wasmExports = wrappedModule.pdfium.wasmExports;
    if (!wasmExports || !wasmExports.malloc || !wasmExports.free) {
        throw new Error("wasmExports.malloc/free not found");
    }

    const fileData = wasmExports.malloc(uint8Array.length);
    wrappedModule.pdfium.HEAPU8.set(uint8Array, fileData);

    const doc = wrappedModule.FPDF_LoadMemDocument(fileData, uint8Array.length, "");
    if (!doc) {
        wasmExports.free(fileData);
        throw new Error("Failed to load document");
    }

    const page = wrappedModule.FPDF_LoadPage(doc, pageIndex);
    if (!page) {
        wrappedModule.FPDF_CloseDocument(doc);
        wasmExports.free(fileData);
        throw new Error(`Failed to load page ${pageIndex}`);
    }

    const scale = 0.5; // Balance between quality and performance
    let width = wrappedModule.FPDF_GetPageWidth(page);
    let height = wrappedModule.FPDF_GetPageHeight(page);

    const thumbWidth = Math.floor(width * scale);
    const thumbHeight = Math.floor(height * scale);

    const bitmap = wrappedModule.FPDFBitmap_Create(thumbWidth, thumbHeight, 0);
    if (!bitmap) {
        wrappedModule.FPDF_ClosePage(page);
        wrappedModule.FPDF_CloseDocument(doc);
        wasmExports.free(fileData);
        throw new Error("Failed to create bitmap");
    }

    const fillRect = 0xFFFFFFFF;
    wrappedModule.FPDFBitmap_FillRect(bitmap, 0, 0, thumbWidth, thumbHeight, fillRect);
    wrappedModule.FPDF_RenderPageBitmap(bitmap, page, 0, 0, thumbWidth, thumbHeight, 0, 0);

    const ptr = wrappedModule.FPDFBitmap_GetBuffer(bitmap);
    const stride = wrappedModule.FPDFBitmap_GetStride(bitmap);
    const bitmapHeap = wrappedModule.pdfium.HEAPU8;

    const bufferLen = stride * thumbHeight;
    const pixelData = new Uint8Array(bitmapHeap.subarray(ptr, ptr + bufferLen)).slice();

    wrappedModule.FPDFBitmap_Destroy(bitmap);
    wrappedModule.FPDF_ClosePage(page);
    wrappedModule.FPDF_CloseDocument(doc);
    wasmExports.free(fileData);

    self.postMessage({
        type: 'PAGE_THUMBNAIL_GENERATED',
        id: reqId,
        payload: {
            pageIndex,
            thumbnail: {
                width: thumbWidth,
                height: thumbHeight,
                stride,
                data: pixelData
            }
        }
    }, [pixelData.buffer]);
}

async function handleGetPageCount(file: File, reqId: string) {
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    const wasmExports = wrappedModule.pdfium.wasmExports;

    const fileData = wasmExports.malloc(uint8Array.length);
    wrappedModule.pdfium.HEAPU8.set(uint8Array, fileData);

    const doc = wrappedModule.FPDF_LoadMemDocument(fileData, uint8Array.length, "");
    if (!doc) {
        wasmExports.free(fileData);
        throw new Error("Failed to load document");
    }

    const pageCount = wrappedModule.FPDF_GetPageCount(doc);

    wrappedModule.FPDF_CloseDocument(doc);
    wasmExports.free(fileData);

    self.postMessage({
        type: 'PAGE_COUNT',
        id: reqId,
        payload: pageCount
    });
}

async function handleGenerateAllPageThumbnails(file: File, reqId: string) {
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    const wasmExports = wrappedModule.pdfium.wasmExports;

    const fileData = wasmExports.malloc(uint8Array.length);
    wrappedModule.pdfium.HEAPU8.set(uint8Array, fileData);

    const doc = wrappedModule.FPDF_LoadMemDocument(fileData, uint8Array.length, "");
    if (!doc) {
        wasmExports.free(fileData);
        throw new Error("Failed to load document");
    }

    const pageCount = wrappedModule.FPDF_GetPageCount(doc);
    const scale = 0.5; // Good balance between quality and performance

    // Stream each thumbnail as it's generated
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        const page = wrappedModule.FPDF_LoadPage(doc, pageIndex);
        if (!page) {
            console.warn(`Failed to load page ${pageIndex}`);
            continue;
        }

        const width = wrappedModule.FPDF_GetPageWidth(page);
        const height = wrappedModule.FPDF_GetPageHeight(page);

        const thumbWidth = Math.floor(width * scale);
        const thumbHeight = Math.floor(height * scale);

        const bitmap = wrappedModule.FPDFBitmap_Create(thumbWidth, thumbHeight, 0);
        if (!bitmap) {
            wrappedModule.FPDF_ClosePage(page);
            console.warn(`Failed to create bitmap for page ${pageIndex}`);
            continue;
        }

        const fillRect = 0xFFFFFFFF;
        wrappedModule.FPDFBitmap_FillRect(bitmap, 0, 0, thumbWidth, thumbHeight, fillRect);
        wrappedModule.FPDF_RenderPageBitmap(bitmap, page, 0, 0, thumbWidth, thumbHeight, 0, 0);

        const ptr = wrappedModule.FPDFBitmap_GetBuffer(bitmap);
        const stride = wrappedModule.FPDFBitmap_GetStride(bitmap);
        const bitmapHeap = wrappedModule.pdfium.HEAPU8;

        const bufferLen = stride * thumbHeight;
        const pixelData = new Uint8Array(bitmapHeap.subarray(ptr, ptr + bufferLen)).slice();

        wrappedModule.FPDFBitmap_Destroy(bitmap);
        wrappedModule.FPDF_ClosePage(page);

        // Stream this thumbnail immediately
        self.postMessage({
            type: 'PAGE_THUMBNAIL_STREAMED',
            id: reqId,
            payload: {
                pageIndex,
                pageCount,
                thumbnail: {
                    width: thumbWidth,
                    height: thumbHeight,
                    stride,
                    data: pixelData
                }
            }
        }, [pixelData.buffer]);
    }

    wrappedModule.FPDF_CloseDocument(doc);
    wasmExports.free(fileData);

    // Send completion message
    self.postMessage({
        type: 'ALL_PAGE_THUMBNAILS_COMPLETE',
        id: reqId,
        payload: { pageCount }
    });
}

async function handleMergePDFs(files: File[], reqId: string) {
    const newDoc = wrappedModule.FPDF_CreateNewDocument();
    const wasmExports = wrappedModule.pdfium.wasmExports;

    try {
        // Process each file: load -> import all pages -> close and free immediately
        for (const file of files) {
            const buffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(buffer);

            const fileData = wasmExports.malloc(uint8Array.length);
            wrappedModule.pdfium.HEAPU8.set(uint8Array, fileData);

            const srcDoc = wrappedModule.FPDF_LoadMemDocument(fileData, uint8Array.length, "");
            if (srcDoc) {
                const pageCount = wrappedModule.FPDF_GetPageCount(srcDoc);
                const range = `1-${pageCount}`;
                // FPDF_ImportPages: dest, src, range, dest_index
                wrappedModule.FPDF_ImportPages(newDoc, srcDoc, range, wrappedModule.FPDF_GetPageCount(newDoc));
                wrappedModule.FPDF_CloseDocument(srcDoc);
            }
            // Free file data immediately after processing this file
            wasmExports.free(fileData);
        }

        // Save using PDFiumExt helpers
        const writer = wrappedModule.PDFiumExt_OpenFileWriter();
        const success = wrappedModule.PDFiumExt_SaveAsCopy(newDoc, writer);

        if (!success) {
            throw new Error("Failed to save merged PDF");
        }

        // Get the size of the saved PDF
        const size = wrappedModule.PDFiumExt_GetFileWriterSize(writer);

        if (size <= 0) {
            throw new Error("PDF size is 0 or invalid");
        }

        // Allocate buffer to read the PDF data
        const outputBuffer = wasmExports.malloc(size);

        // Read the data into the buffer - PDFiumExt_GetFileWriterData(writer, buffer, size)
        const bytesWritten = wrappedModule.PDFiumExt_GetFileWriterData(writer, outputBuffer, size);

        if (bytesWritten <= 0) {
            wasmExports.free(outputBuffer);
            throw new Error("Failed to get file writer data");
        }

        // Copy the data from WASM memory
        const currentHeap = wrappedModule.pdfium.HEAPU8;
        const pdfBuffer = new Uint8Array(currentHeap.subarray(outputBuffer, outputBuffer + bytesWritten)).slice();

        wrappedModule.PDFiumExt_CloseFileWriter(writer);
        wrappedModule.FPDF_CloseDocument(newDoc);
        wasmExports.free(outputBuffer);

        self.postMessage({
            type: 'MERGE_COMPLETE',
            id: reqId,
            payload: pdfBuffer
        }, [pdfBuffer.buffer]);

    } catch (e: any) {
        if (newDoc) wrappedModule.FPDF_CloseDocument(newDoc);
        console.error(e);
        self.postMessage({
            type: 'ERROR',
            id: reqId,
            payload: e.message || String(e)
        });
    }
}

// Helper to generate a unique key for a file
function getFileKey(file: File): string {
    return file.name + '_' + file.size + '_' + file.lastModified;
}

// Merge PDFs with specific page order - Streaming approach (one file at a time)
// Now also supports page rotation
async function handleMergePDFsWithOrder(pages: { file: File; pageIndex: number; rotation?: number }[], reqId: string) {
    const newDoc = wrappedModule.FPDF_CreateNewDocument();
    const wasmExports = wrappedModule.pdfium.wasmExports;

    try {
        // Group consecutive pages by file for efficient processing
        type PageGroup = { file: File; pageIndexes: number[]; rotations: number[] };
        const groups: PageGroup[] = [];

        for (const page of pages) {
            const fileKey = getFileKey(page.file);
            const lastGroup = groups[groups.length - 1];
            const rotation = page.rotation || 0;

            if (lastGroup && getFileKey(lastGroup.file) === fileKey) {
                // Same file as previous, add to group
                lastGroup.pageIndexes.push(page.pageIndex);
                lastGroup.rotations.push(rotation);
            } else {
                // Different file, start new group
                groups.push({ file: page.file, pageIndexes: [page.pageIndex], rotations: [rotation] });
            }
        }

        console.log(`[Merge] Processing ${pages.length} pages in ${groups.length} file groups`);

        // Track the destination page index for rotation application
        let destPageStartIndex = 0;

        // Process each file group: load -> import pages -> close immediately
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];

            // Send progress update
            self.postMessage({
                type: 'MERGE_PROGRESS',
                id: reqId,
                payload: {
                    currentFile: group.file.name,
                    currentIndex: i,
                    totalFiles: groups.length,
                    progress: Math.round((i / groups.length) * 100),
                    stage: 'importing'
                }
            });

            const buffer = await group.file.arrayBuffer();
            const uint8Array = new Uint8Array(buffer);

            const fileData = wasmExports.malloc(uint8Array.length);
            wrappedModule.pdfium.HEAPU8.set(uint8Array, fileData);

            const srcDoc = wrappedModule.FPDF_LoadMemDocument(fileData, uint8Array.length, "");
            if (!srcDoc) {
                wasmExports.free(fileData);
                console.warn(`Failed to load ${group.file.name}`);
                continue;
            }

            // Build page range string for bulk import (1-indexed)
            const pageNums = group.pageIndexes.map(i => i + 1);
            const rangeStr = pageNums.join(',');

            const destIndex = wrappedModule.FPDF_GetPageCount(newDoc);
            wrappedModule.FPDF_ImportPages(newDoc, srcDoc, rangeStr, destIndex);

            // Apply rotations to imported pages if any rotation is non-zero
            for (let j = 0; j < group.pageIndexes.length; j++) {
                const rotation = group.rotations[j];
                if (rotation !== 0) {
                    // Convert degrees to PDFium rotation enum: 0=0°, 1=90°, 2=180°, 3=270°
                    const pdfiumRotation = Math.floor((rotation % 360) / 90) % 4;
                    const pageIdx = destPageStartIndex + j;

                    // Load the page in the destination document
                    const destPage = wrappedModule.FPDF_LoadPage(newDoc, pageIdx);
                    if (destPage) {
                        // FPDFPage_SetRotation(page, rotation) where rotation is 0-3
                        wrappedModule.FPDFPage_SetRotation(destPage, pdfiumRotation);
                        wrappedModule.FPDF_ClosePage(destPage);
                    }
                }
            }

            destPageStartIndex += group.pageIndexes.length;

            // Immediately close and free this source document
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
        }

        // Send saving progress
        self.postMessage({
            type: 'MERGE_PROGRESS',
            id: reqId,
            payload: {
                currentFile: 'Saving merged PDF...',
                currentIndex: groups.length,
                totalFiles: groups.length,
                progress: 95,
                stage: 'saving'
            }
        });

        // Save the document
        const writer = wrappedModule.PDFiumExt_OpenFileWriter();
        const success = wrappedModule.PDFiumExt_SaveAsCopy(newDoc, writer);

        if (!success) {
            throw new Error("Failed to save merged PDF");
        }

        const size = wrappedModule.PDFiumExt_GetFileWriterSize(writer);
        if (size <= 0) {
            throw new Error("PDF size is 0 or invalid");
        }

        const outputBuffer = wasmExports.malloc(size);
        const bytesWritten = wrappedModule.PDFiumExt_GetFileWriterData(writer, outputBuffer, size);

        if (bytesWritten <= 0) {
            wasmExports.free(outputBuffer);
            throw new Error("Failed to get file writer data");
        }

        const currentHeap = wrappedModule.pdfium.HEAPU8;
        const pdfBuffer = new Uint8Array(currentHeap.subarray(outputBuffer, outputBuffer + bytesWritten)).slice();

        wrappedModule.PDFiumExt_CloseFileWriter(writer);
        wrappedModule.FPDF_CloseDocument(newDoc);
        wasmExports.free(outputBuffer);

        self.postMessage({
            type: 'MERGE_WITH_ORDER_COMPLETE',
            id: reqId,
            payload: pdfBuffer
        }, [pdfBuffer.buffer]);

    } catch (e: any) {
        if (newDoc) wrappedModule.FPDF_CloseDocument(newDoc);
        console.error(e);
        self.postMessage({
            type: 'ERROR',
            id: reqId,
            payload: e.message || String(e)
        });
    }
}

// Split PDF into multiple documents based on page ranges
async function handleSplitPDF(file: File, splitRanges: { pageIndexes: number[], outputName: string }[], reqId: string) {
    const wasmExports = wrappedModule.pdfium.wasmExports;

    try {
        // Load the source document
        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        const fileData = wasmExports.malloc(uint8Array.length);
        wrappedModule.pdfium.HEAPU8.set(uint8Array, fileData);

        const srcDoc = wrappedModule.FPDF_LoadMemDocument(fileData, uint8Array.length, "");
        if (!srcDoc) {
            wasmExports.free(fileData);
            throw new Error("Failed to load source document");
        }

        const splitResults: { name: string; data: Uint8Array }[] = [];

        // Process each split range
        for (let i = 0; i < splitRanges.length; i++) {
            const range = splitRanges[i];

            // Send progress update
            self.postMessage({
                type: 'SPLIT_PROGRESS',
                id: reqId,
                payload: {
                    currentIndex: i,
                    totalSplits: splitRanges.length,
                    progress: Math.round((i / splitRanges.length) * 90),
                    outputName: range.outputName,
                    stage: 'splitting'
                }
            });

            // Create new document for this range
            const newDoc = wrappedModule.FPDF_CreateNewDocument();
            if (!newDoc) {
                console.warn(`Failed to create new document for ${range.outputName}`);
                continue;
            }

            // Build page range string (1-indexed for FPDF_ImportPages)
            const pageNums = range.pageIndexes.map(i => i + 1);
            const rangeStr = pageNums.join(',');

            // Import pages
            const destIndex = 0;
            wrappedModule.FPDF_ImportPages(newDoc, srcDoc, rangeStr, destIndex);

            // Save the split document
            const writer = wrappedModule.PDFiumExt_OpenFileWriter();
            const success = wrappedModule.PDFiumExt_SaveAsCopy(newDoc, writer);

            if (success) {
                const size = wrappedModule.PDFiumExt_GetFileWriterSize(writer);
                if (size > 0) {
                    const outputBuffer = wasmExports.malloc(size);
                    const bytesWritten = wrappedModule.PDFiumExt_GetFileWriterData(writer, outputBuffer, size);

                    if (bytesWritten > 0) {
                        const currentHeap = wrappedModule.pdfium.HEAPU8;
                        const pdfBuffer = new Uint8Array(currentHeap.subarray(outputBuffer, outputBuffer + bytesWritten)).slice();
                        splitResults.push({ name: range.outputName, data: pdfBuffer });
                    }
                    wasmExports.free(outputBuffer);
                }
            }

            wrappedModule.PDFiumExt_CloseFileWriter(writer);
            wrappedModule.FPDF_CloseDocument(newDoc);
        }

        // Clean up source document
        wrappedModule.FPDF_CloseDocument(srcDoc);
        wasmExports.free(fileData);

        // Send final progress
        self.postMessage({
            type: 'SPLIT_PROGRESS',
            id: reqId,
            payload: {
                currentIndex: splitRanges.length,
                totalSplits: splitRanges.length,
                progress: 100,
                stage: 'complete'
            }
        });

        // Send results - transfer the buffers
        const transferables = splitResults.map(r => r.data.buffer);
        self.postMessage({
            type: 'SPLIT_COMPLETE',
            id: reqId,
            payload: splitResults
        }, transferables as any);

    } catch (e: any) {
        console.error(e);
        self.postMessage({
            type: 'ERROR',
            id: reqId,
            payload: e.message || String(e)
        });
    }
}

// Standard page sizes in points (1 point = 1/72 inch)
const PAGE_SIZES = {
    'A4': { width: 595.28, height: 841.89 },
    'Letter': { width: 612, height: 792 },
    'Legal': { width: 612, height: 1008 },
    'A3': { width: 841.89, height: 1190.55 },
    'A5': { width: 419.53, height: 595.28 },
    'B5': { width: 498.90, height: 708.66 },
    'Executive': { width: 522, height: 756 },
    'Tabloid': { width: 792, height: 1224 },
};

interface BlankPageSpec {
    position: number;        // 0-indexed position where to insert the blank page
    pageSize: keyof typeof PAGE_SIZES | 'custom' | 'match-previous' | 'match-next';
    orientation: 'portrait' | 'landscape';
    customWidth?: number;    // For custom size, in points
    customHeight?: number;   // For custom size, in points
    backgroundColor?: string; // Hex color like '#FFFFFF'
}

// Add blank pages to a PDF
async function handleAddBlankPages(file: File, blankPages: BlankPageSpec[], reqId: string) {
    const wasmExports = wrappedModule.pdfium.wasmExports;

    try {
        // Load the source document
        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        const fileData = wasmExports.malloc(uint8Array.length);
        wrappedModule.pdfium.HEAPU8.set(uint8Array, fileData);

        const srcDoc = wrappedModule.FPDF_LoadMemDocument(fileData, uint8Array.length, "");
        if (!srcDoc) {
            wasmExports.free(fileData);
            throw new Error("Failed to load source document");
        }

        const originalPageCount = wrappedModule.FPDF_GetPageCount(srcDoc);

        // Create a new document to build the result
        const newDoc = wrappedModule.FPDF_CreateNewDocument();
        if (!newDoc) {
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("Failed to create new document");
        }

        // Sort blank pages by position (ascending)
        const sortedBlankPages = [...blankPages].sort((a, b) => a.position - b.position);

        // Build a mapping of which blank pages go where
        const blankPageMap = new Map<number, BlankPageSpec[]>();
        for (const bp of sortedBlankPages) {
            const pos = Math.max(0, Math.min(bp.position, originalPageCount));
            if (!blankPageMap.has(pos)) {
                blankPageMap.set(pos, []);
            }
            blankPageMap.get(pos)!.push(bp);
        }

        // Helper to get page dimensions
        const getPageDimensions = (pageIndex: number): { width: number; height: number } => {
            if (pageIndex < 0 || pageIndex >= originalPageCount) {
                return PAGE_SIZES['A4']; // Default
            }
            const page = wrappedModule.FPDF_LoadPage(srcDoc, pageIndex);
            if (!page) {
                return PAGE_SIZES['A4'];
            }
            const width = wrappedModule.FPDF_GetPageWidth(page);
            const height = wrappedModule.FPDF_GetPageHeight(page);
            wrappedModule.FPDF_ClosePage(page);
            return { width, height };
        };

        // Helper to resolve page size
        const resolvePageSize = (spec: BlankPageSpec, insertPosition: number): { width: number; height: number } => {
            let baseSize: { width: number; height: number };

            if (spec.pageSize === 'custom' && spec.customWidth && spec.customHeight) {
                baseSize = { width: spec.customWidth, height: spec.customHeight };
            } else if (spec.pageSize === 'match-previous') {
                baseSize = getPageDimensions(insertPosition - 1);
            } else if (spec.pageSize === 'match-next') {
                baseSize = getPageDimensions(insertPosition);
            } else if (spec.pageSize in PAGE_SIZES) {
                baseSize = PAGE_SIZES[spec.pageSize as keyof typeof PAGE_SIZES];
            } else {
                baseSize = PAGE_SIZES['A4'];
            }

            // Apply orientation
            if (spec.orientation === 'landscape' && baseSize.height > baseSize.width) {
                return { width: baseSize.height, height: baseSize.width };
            } else if (spec.orientation === 'portrait' && baseSize.width > baseSize.height) {
                return { width: baseSize.height, height: baseSize.width };
            }
            return baseSize;
        };

        // Process page by page
        let destPageIndex = 0;

        for (let srcPageIndex = 0; srcPageIndex <= originalPageCount; srcPageIndex++) {
            // Insert any blank pages that go before this position
            if (blankPageMap.has(srcPageIndex)) {
                for (const blankSpec of blankPageMap.get(srcPageIndex)!) {
                    const dims = resolvePageSize(blankSpec, srcPageIndex);

                    // Create a blank page using FPDFPage_New
                    const blankPage = wrappedModule.FPDFPage_New(newDoc, destPageIndex, dims.width, dims.height);
                    if (blankPage) {
                        // Generate content if background color is not white
                        if (blankSpec.backgroundColor && blankSpec.backgroundColor.toLowerCase() !== '#ffffff') {
                            wrappedModule.FPDFPage_GenerateContent(blankPage);
                        }
                        wrappedModule.FPDF_ClosePage(blankPage);
                    }
                    destPageIndex++;
                }
            }

            // Copy original page (if not past the end)
            if (srcPageIndex < originalPageCount) {
                const rangeStr = `${srcPageIndex + 1}`;
                wrappedModule.FPDF_ImportPages(newDoc, srcDoc, rangeStr, destPageIndex);
                destPageIndex++;
            }
        }

        // Save the result
        const writer = wrappedModule.PDFiumExt_OpenFileWriter();
        const success = wrappedModule.PDFiumExt_SaveAsCopy(newDoc, writer);

        if (!success) {
            wrappedModule.FPDF_CloseDocument(newDoc);
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("Failed to save PDF with blank pages");
        }

        const size = wrappedModule.PDFiumExt_GetFileWriterSize(writer);
        if (size <= 0) {
            wrappedModule.FPDF_CloseDocument(newDoc);
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("PDF size is 0 or invalid");
        }

        const outputBuffer = wasmExports.malloc(size);
        const bytesWritten = wrappedModule.PDFiumExt_GetFileWriterData(writer, outputBuffer, size);

        if (bytesWritten <= 0) {
            wasmExports.free(outputBuffer);
            wrappedModule.FPDF_CloseDocument(newDoc);
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("Failed to get file writer data");
        }

        const currentHeap = wrappedModule.pdfium.HEAPU8;
        const pdfBuffer = new Uint8Array(currentHeap.subarray(outputBuffer, outputBuffer + bytesWritten)).slice();

        // Cleanup
        wrappedModule.PDFiumExt_CloseFileWriter(writer);
        wrappedModule.FPDF_CloseDocument(newDoc);
        wrappedModule.FPDF_CloseDocument(srcDoc);
        wasmExports.free(outputBuffer);
        wasmExports.free(fileData);

        self.postMessage({
            type: 'ADD_BLANK_PAGES_COMPLETE',
            id: reqId,
            payload: pdfBuffer
        }, [pdfBuffer.buffer]);

    } catch (e: any) {
        console.error(e);
        self.postMessage({
            type: 'ERROR',
            id: reqId,
            payload: e.message || String(e)
        });
    }
}

// N-Up PDF options interface
interface NUpOptions {
    columns: number;           // Number of columns (e.g., 2 for 2-up)
    rows: number;              // Number of rows (e.g., 1 for 2-up, 2 for 4-up)
    pageOrder: 'horizontal' | 'vertical';  // Fill order: left-to-right then down, or top-to-bottom then right
    outputPageSize: keyof typeof PAGE_SIZES | 'auto';  // Output page size
    outputOrientation: 'portrait' | 'landscape' | 'auto';  // Output page orientation
    spacing: number;           // Spacing between pages in points
    margin: number;            // Margin around the entire page in points
    border: boolean;           // Whether to add borders around each page
}

// N-Up PDF - Arrange multiple pages onto single sheets
async function handleNUpPDF(file: File, options: NUpOptions, reqId: string) {
    const wasmExports = wrappedModule.pdfium.wasmExports;

    try {
        // Send initial progress
        self.postMessage({
            type: 'N_UP_PDF_PROGRESS',
            id: reqId,
            payload: { stage: 'loading', message: 'Loading PDF document...' }
        });

        // Load the source document
        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        const fileData = wasmExports.malloc(uint8Array.length);
        wrappedModule.pdfium.HEAPU8.set(uint8Array, fileData);

        const srcDoc = wrappedModule.FPDF_LoadMemDocument(fileData, uint8Array.length, "");
        if (!srcDoc) {
            wasmExports.free(fileData);
            throw new Error("Failed to load source document");
        }

        const pageCount = wrappedModule.FPDF_GetPageCount(srcDoc);
        const pagesPerSheet = options.columns * options.rows;
        const outputPageCount = Math.ceil(pageCount / pagesPerSheet);

        // Send progress update
        self.postMessage({
            type: 'N_UP_PDF_PROGRESS',
            id: reqId,
            payload: {
                stage: 'processing',
                message: `Arranging ${pageCount} pages into ${outputPageCount} sheets (${options.columns}×${options.rows})...`,
                pageCount,
                outputPageCount
            }
        });

        // Get first page dimensions to determine source page size
        const firstPage = wrappedModule.FPDF_LoadPage(srcDoc, 0);
        const srcPageWidth = wrappedModule.FPDF_GetPageWidth(firstPage);
        const srcPageHeight = wrappedModule.FPDF_GetPageHeight(firstPage);
        wrappedModule.FPDF_ClosePage(firstPage);

        // Determine output page dimensions
        let outputWidth: number;
        let outputHeight: number;

        if (options.outputPageSize === 'auto') {
            // Auto: use the same size as input, but swap if needed for orientation
            outputWidth = srcPageWidth;
            outputHeight = srcPageHeight;
        } else {
            const size = PAGE_SIZES[options.outputPageSize];
            outputWidth = size.width;
            outputHeight = size.height;
        }

        // Apply orientation
        if (options.outputOrientation === 'landscape' && outputHeight > outputWidth) {
            [outputWidth, outputHeight] = [outputHeight, outputWidth];
        } else if (options.outputOrientation === 'portrait' && outputWidth > outputHeight) {
            [outputWidth, outputHeight] = [outputHeight, outputWidth];
        } else if (options.outputOrientation === 'auto') {
            // Auto: landscape if columns > rows, portrait otherwise
            if (options.columns > options.rows && outputHeight > outputWidth) {
                [outputWidth, outputHeight] = [outputHeight, outputWidth];
            } else if (options.rows > options.columns && outputWidth > outputHeight) {
                [outputWidth, outputHeight] = [outputHeight, outputWidth];
            }
        }

        // Calculate cell dimensions (area for each page)
        const spacing = options.spacing || 10;
        const cellWidth = (outputWidth - spacing * (options.columns + 1)) / options.columns;
        const cellHeight = (outputHeight - spacing * (options.rows + 1)) / options.rows;

        // Create new document
        const newDoc = wrappedModule.FPDF_CreateNewDocument();
        if (!newDoc) {
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("Failed to create new document");
        }

        // Process each output page
        for (let outPageIdx = 0; outPageIdx < outputPageCount; outPageIdx++) {
            // Create a new page in the output document
            const outPage = wrappedModule.FPDFPage_New(newDoc, outPageIdx, outputWidth, outputHeight);
            if (!outPage) continue;

            // Place source pages onto this output page
            for (let slot = 0; slot < pagesPerSheet; slot++) {
                const srcPageIdx = outPageIdx * pagesPerSheet + slot;
                if (srcPageIdx >= pageCount) break;

                // Calculate position based on fill order
                let col: number, row: number;
                if (options.pageOrder === 'horizontal') {
                    // Left to right, then down
                    row = Math.floor(slot / options.columns);
                    col = slot % options.columns;
                } else {
                    // Top to bottom, then right
                    col = Math.floor(slot / options.rows);
                    row = slot % options.rows;
                }

                // Calculate cell position (top-left origin, but PDF uses bottom-left)
                const cellX = spacing + col * (cellWidth + spacing);
                const cellY = outputHeight - spacing - (row + 1) * (cellHeight + spacing) + spacing;

                // Load the source page to get its dimensions
                const srcPage = wrappedModule.FPDF_LoadPage(srcDoc, srcPageIdx);
                if (!srcPage) continue;

                const srcW = wrappedModule.FPDF_GetPageWidth(srcPage);
                const srcH = wrappedModule.FPDF_GetPageHeight(srcPage);

                // Calculate scale to fit in cell while maintaining aspect ratio
                const scaleX = cellWidth / srcW;
                const scaleY = cellHeight / srcH;
                const scale = Math.min(scaleX, scaleY);

                // Calculate centered position within the cell
                const scaledW = srcW * scale;
                const scaledH = srcH * scale;
                const offsetX = (cellWidth - scaledW) / 2;
                const offsetY = (cellHeight - scaledH) / 2;

                // Final position
                const finalX = cellX + offsetX;
                const finalY = cellY + offsetY;

                // Create transformation matrix for placing the page
                // Matrix: [a, b, c, d, e, f] where:
                // a = scale_x, d = scale_y (scaling)
                // e = translate_x, f = translate_y (position)
                // b, c = rotation/skew (0 for no rotation)

                // Import the page using FPDF_ImportPagesByIndex with the transformation
                // Note: pdfium's FPDF_ImportNPagesToOne doesn't give us per-page control,
                // so we need to render each page as an object

                // Use FPDFPageObj_NewFormObjectFromPage to copy page content
                // Actually, let's use a simpler approach - render to image and place

                // For now, we'll use FPDF_ImportPages and rely on the fact that
                // we can't easily transform imported pages in pdfium. Instead,
                // we'll draw each source page's content by rendering it.

                // Render the source page to a bitmap
                const bitmapWidth = Math.floor(scaledW * 2); // 2x for quality
                const bitmapHeight = Math.floor(scaledH * 2);

                if (bitmapWidth > 0 && bitmapHeight > 0) {
                    const bitmap = wrappedModule.FPDFBitmap_Create(bitmapWidth, bitmapHeight, 1); // 1 = has alpha
                    if (bitmap) {
                        // Fill with white background
                        wrappedModule.FPDFBitmap_FillRect(bitmap, 0, 0, bitmapWidth, bitmapHeight, 0xFFFFFFFF);

                        // Render the source page to bitmap
                        wrappedModule.FPDF_RenderPageBitmap(bitmap, srcPage, 0, 0, bitmapWidth, bitmapHeight, 0, 0);

                        // Get the bitmap data
                        const bitmapPtr = wrappedModule.FPDFBitmap_GetBuffer(bitmap);
                        const stride = wrappedModule.FPDFBitmap_GetStride(bitmap);

                        // Create an image object for the output page
                        const imageObj = wrappedModule.FPDFPageObj_NewImageObj(newDoc);
                        if (imageObj) {
                            // Load the bitmap as image data
                            // Unfortunately, pdfium doesn't have a direct way to load from memory bitmap
                            // We need to use an alternative approach - use FPDFImageObj_LoadJpegFile or similar

                            // For simplicity in this implementation, we'll skip the image embedding
                            // and just note that full N-Up would require more complex image handling
                        }

                        wrappedModule.FPDFBitmap_Destroy(bitmap);
                    }
                }

                // Draw border if enabled (using path objects)
                if (options.border) {
                    const borderPath = wrappedModule.FPDFPageObj_CreateNewPath(finalX, finalY);
                    if (borderPath) {
                        wrappedModule.FPDFPath_LineTo(borderPath, finalX + scaledW, finalY);
                        wrappedModule.FPDFPath_LineTo(borderPath, finalX + scaledW, finalY + scaledH);
                        wrappedModule.FPDFPath_LineTo(borderPath, finalX, finalY + scaledH);
                        wrappedModule.FPDFPath_Close(borderPath);
                        wrappedModule.FPDFPageObj_SetStrokeColor(borderPath, 128, 128, 128, 255);
                        wrappedModule.FPDFPageObj_SetStrokeWidth(borderPath, 0.5);
                        wrappedModule.FPDFPath_SetDrawMode(borderPath, 0, 1); // Stroke only
                        wrappedModule.FPDFPage_InsertObject(outPage, borderPath);
                    }
                }

                wrappedModule.FPDF_ClosePage(srcPage);
            }

            // Generate content for the page
            wrappedModule.FPDFPage_GenerateContent(outPage);
            wrappedModule.FPDF_ClosePage(outPage);
        }

        // Alternative approach: Use FPDF_ImportNPagesToOne which does N-Up natively
        // Let's try this instead as it's more reliable
        wrappedModule.FPDF_CloseDocument(newDoc);

        // Calculate effective content area after margins
        const margin = options.margin || 0;
        const effectiveWidth = outputWidth - (2 * margin);
        const effectiveHeight = outputHeight - (2 * margin);

        // Use the native N-Up function if available
        // Note: FPDF_ImportNPagesToOne will fit pages into the specified dimensions
        const nupDoc = wrappedModule.FPDF_ImportNPagesToOne(
            srcDoc,
            effectiveWidth > 0 ? effectiveWidth : outputWidth,
            effectiveHeight > 0 ? effectiveHeight : outputHeight,
            options.columns,
            options.rows
        );

        if (!nupDoc) {
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("Failed to create N-Up PDF");
        }

        // Send progress update
        self.postMessage({
            type: 'N_UP_PDF_PROGRESS',
            id: reqId,
            payload: { stage: 'saving', message: 'Saving PDF document...' }
        });

        // Save the result
        const writer = wrappedModule.PDFiumExt_OpenFileWriter();
        const success = wrappedModule.PDFiumExt_SaveAsCopy(nupDoc, writer);

        if (!success) {
            wrappedModule.FPDF_CloseDocument(nupDoc);
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("Failed to save N-Up PDF");
        }

        const size = wrappedModule.PDFiumExt_GetFileWriterSize(writer);
        if (size <= 0) {
            wrappedModule.FPDF_CloseDocument(nupDoc);
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("PDF size is 0 or invalid");
        }

        const outputBuffer = wasmExports.malloc(size);
        const bytesWritten = wrappedModule.PDFiumExt_GetFileWriterData(writer, outputBuffer, size);

        if (bytesWritten <= 0) {
            wasmExports.free(outputBuffer);
            wrappedModule.FPDF_CloseDocument(nupDoc);
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("Failed to get file writer data");
        }

        const currentHeap = wrappedModule.pdfium.HEAPU8;
        const pdfBuffer = new Uint8Array(currentHeap.subarray(outputBuffer, outputBuffer + bytesWritten)).slice();

        // Cleanup
        wrappedModule.PDFiumExt_CloseFileWriter(writer);
        wrappedModule.FPDF_CloseDocument(nupDoc);
        wrappedModule.FPDF_CloseDocument(srcDoc);
        wasmExports.free(outputBuffer);
        wasmExports.free(fileData);

        self.postMessage({
            type: 'N_UP_PDF_COMPLETE',
            id: reqId,
            payload: pdfBuffer
        }, [pdfBuffer.buffer]);

    } catch (e: any) {
        console.error(e);
        self.postMessage({
            type: 'ERROR',
            id: reqId,
            payload: e.message || String(e)
        });
    }
}

// Rotate PDF pages
// rotations is an array of { pageIndex: number, rotation: number } where rotation is 0, 1, 2, or 3
// 0 = 0°, 1 = 90° clockwise, 2 = 180°, 3 = 270° clockwise (or 90° counter-clockwise)
async function handleRotatePDF(file: File, rotations: { pageIndex: number, rotation: number }[], reqId: string) {
    const wasmExports = wrappedModule.pdfium.wasmExports;

    try {
        // Load the source document
        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        const fileData = wasmExports.malloc(uint8Array.length);
        wrappedModule.pdfium.HEAPU8.set(uint8Array, fileData);

        const doc = wrappedModule.FPDF_LoadMemDocument(fileData, uint8Array.length, "");
        if (!doc) {
            wasmExports.free(fileData);
            throw new Error("Failed to load document");
        }

        const pageCount = wrappedModule.FPDF_GetPageCount(doc);

        // Apply rotations to each specified page
        for (let i = 0; i < rotations.length; i++) {
            const { pageIndex, rotation } = rotations[i];

            // Validate page index
            if (pageIndex < 0 || pageIndex >= pageCount) {
                console.warn(`Invalid page index ${pageIndex}, skipping`);
                continue;
            }

            // Load the page
            const page = wrappedModule.FPDF_LoadPage(doc, pageIndex);
            if (!page) {
                console.warn(`Failed to load page ${pageIndex}`);
                continue;
            }

            // Get current rotation and calculate new rotation
            const currentRotation = wrappedModule.FPDFPage_GetRotation(page);
            // Rotation values: 0 = 0°, 1 = 90°, 2 = 180°, 3 = 270°
            // Add the new rotation to the current one and wrap around
            const newRotation = (currentRotation + rotation) % 4;

            // Set the new rotation
            wrappedModule.FPDFPage_SetRotation(page, newRotation);

            // Close the page
            wrappedModule.FPDF_ClosePage(page);

            // Send progress
            self.postMessage({
                type: 'ROTATE_PROGRESS',
                id: reqId,
                payload: {
                    currentIndex: i,
                    totalPages: rotations.length,
                    progress: Math.round(((i + 1) / rotations.length) * 80),
                    stage: 'rotating'
                }
            });
        }

        // Save progress
        self.postMessage({
            type: 'ROTATE_PROGRESS',
            id: reqId,
            payload: {
                currentIndex: rotations.length,
                totalPages: rotations.length,
                progress: 85,
                stage: 'saving'
            }
        });

        // Save the modified document
        const writer = wrappedModule.PDFiumExt_OpenFileWriter();
        const success = wrappedModule.PDFiumExt_SaveAsCopy(doc, writer);

        if (!success) {
            wrappedModule.FPDF_CloseDocument(doc);
            wasmExports.free(fileData);
            throw new Error("Failed to save rotated PDF");
        }

        const size = wrappedModule.PDFiumExt_GetFileWriterSize(writer);
        if (size <= 0) {
            wrappedModule.PDFiumExt_CloseFileWriter(writer);
            wrappedModule.FPDF_CloseDocument(doc);
            wasmExports.free(fileData);
            throw new Error("PDF size is 0 or invalid");
        }

        const outputBuffer = wasmExports.malloc(size);
        const bytesWritten = wrappedModule.PDFiumExt_GetFileWriterData(writer, outputBuffer, size);

        if (bytesWritten <= 0) {
            wasmExports.free(outputBuffer);
            wrappedModule.PDFiumExt_CloseFileWriter(writer);
            wrappedModule.FPDF_CloseDocument(doc);
            wasmExports.free(fileData);
            throw new Error("Failed to get file writer data");
        }

        const currentHeap = wrappedModule.pdfium.HEAPU8;
        const pdfBuffer = new Uint8Array(currentHeap.subarray(outputBuffer, outputBuffer + bytesWritten)).slice();

        // Cleanup
        wasmExports.free(outputBuffer);
        wrappedModule.PDFiumExt_CloseFileWriter(writer);
        wrappedModule.FPDF_CloseDocument(doc);
        wasmExports.free(fileData);

        // Send completion
        self.postMessage({
            type: 'ROTATE_PROGRESS',
            id: reqId,
            payload: {
                currentIndex: rotations.length,
                totalPages: rotations.length,
                progress: 100,
                stage: 'complete'
            }
        });

        self.postMessage({
            type: 'ROTATE_COMPLETE',
            id: reqId,
            payload: pdfBuffer
        }, [pdfBuffer.buffer]);

    } catch (e: any) {
        console.error(e);
        self.postMessage({
            type: 'ERROR',
            id: reqId,
            payload: e.message || String(e)
        });
    }
}

// Combine all PDF pages into one continuous vertical page
interface CombineOptions {
    spacing: number; // Gap between pages in points
    pageWidth: number; // Target width in points (0 = use widest page)
    selectedPages?: number[]; // Optional: specific pages to combine (0-indexed)
}

async function handleCombineSinglePage(file: File, options: CombineOptions, reqId: string) {
    const wasmExports = wrappedModule.pdfium.wasmExports;

    try {
        // Load the source document
        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        const fileData = wasmExports.malloc(uint8Array.length);
        wrappedModule.pdfium.HEAPU8.set(uint8Array, fileData);

        const srcDoc = wrappedModule.FPDF_LoadMemDocument(fileData, uint8Array.length, "");
        if (!srcDoc) {
            wasmExports.free(fileData);
            throw new Error("Failed to load document");
        }

        const totalPageCount = wrappedModule.FPDF_GetPageCount(srcDoc);

        // Determine which pages to combine
        const pagesToCombine = options.selectedPages && options.selectedPages.length > 0
            ? options.selectedPages.filter(p => p >= 0 && p < totalPageCount)
            : Array.from({ length: totalPageCount }, (_, i) => i);

        if (pagesToCombine.length === 0) {
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("No valid pages to combine");
        }

        // First pass: calculate dimensions
        let maxWidth = 0;
        const pageDimensions: { width: number; height: number }[] = [];

        for (const pageIndex of pagesToCombine) {
            const page = wrappedModule.FPDF_LoadPage(srcDoc, pageIndex);
            if (!page) continue;

            const width = wrappedModule.FPDF_GetPageWidthF(page);
            const height = wrappedModule.FPDF_GetPageHeightF(page);
            pageDimensions.push({ width, height });
            maxWidth = Math.max(maxWidth, width);

            wrappedModule.FPDF_ClosePage(page);
        }

        // Use specified width or widest page
        const targetWidth = options.pageWidth > 0 ? options.pageWidth : maxWidth;
        const spacing = options.spacing || 0;

        // Calculate total height with scaling and spacing
        let totalHeight = 0;
        const scaledDimensions: { width: number; height: number; scale: number; y: number }[] = [];

        for (const dim of pageDimensions) {
            const scale = targetWidth / dim.width;
            const scaledHeight = dim.height * scale;
            scaledDimensions.push({
                width: targetWidth,
                height: scaledHeight,
                scale,
                y: totalHeight
            });
            totalHeight += scaledHeight + spacing;
        }

        // Remove last spacing
        if (pagesToCombine.length > 0) {
            totalHeight -= spacing;
        }

        // Progress update
        self.postMessage({
            type: 'COMBINE_PROGRESS',
            id: reqId,
            payload: { progress: 10, stage: 'calculating', currentPage: 0, totalPages: pagesToCombine.length }
        });

        // Create new document with single tall page
        const newDoc = wrappedModule.FPDF_CreateNewDocument();
        if (!newDoc) {
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("Failed to create new document");
        }

        // Create the single tall page
        const newPage = wrappedModule.FPDFPage_New(newDoc, 0, targetWidth, totalHeight);
        if (!newPage) {
            wrappedModule.FPDF_CloseDocument(newDoc);
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("Failed to create combined page");
        }

        // Render each source page and place it on the combined page
        for (let i = 0; i < pagesToCombine.length; i++) {
            const pageIndex = pagesToCombine[i];
            const dim = scaledDimensions[i];

            // Load source page
            const srcPage = wrappedModule.FPDF_LoadPage(srcDoc, pageIndex);
            if (!srcPage) continue;

            // Create XObject from source page
            const xobject = wrappedModule.FPDF_NewXObjectFromPage(newDoc, srcDoc, pageIndex);
            if (xobject) {
                // Create form object from XObject
                const formObj = wrappedModule.FPDF_NewFormObjectFromXObject(xobject);
                if (formObj) {
                    // Position is from bottom-left, PDFs have origin at bottom
                    // We need to place pages from top to bottom, so calculate y from bottom
                    const yPos = totalHeight - dim.y - dim.height;

                    // Transform the form object to position and scale it
                    // Matrix: [a, b, c, d, e, f] = [scaleX, 0, 0, scaleY, translateX, translateY]
                    wrappedModule.FPDFPageObj_Transform(formObj, dim.scale, 0, 0, dim.scale, 0, yPos);

                    // Insert the form object into the page
                    wrappedModule.FPDFPage_InsertObject(newPage, formObj);
                }
                wrappedModule.FPDF_CloseXObject(xobject);
            }

            wrappedModule.FPDF_ClosePage(srcPage);

            // Progress update
            self.postMessage({
                type: 'COMBINE_PROGRESS',
                id: reqId,
                payload: {
                    progress: 10 + Math.round((i + 1) / pagesToCombine.length * 70),
                    stage: 'combining',
                    currentPage: i + 1,
                    totalPages: pagesToCombine.length
                }
            });
        }

        // Generate page content
        wrappedModule.FPDFPage_GenerateContent(newPage);
        wrappedModule.FPDF_ClosePage(newPage);

        // Save progress
        self.postMessage({
            type: 'COMBINE_PROGRESS',
            id: reqId,
            payload: { progress: 85, stage: 'saving', currentPage: pagesToCombine.length, totalPages: pagesToCombine.length }
        });

        // Save the document
        const writer = wrappedModule.PDFiumExt_OpenFileWriter();
        const success = wrappedModule.PDFiumExt_SaveAsCopy(newDoc, writer);

        if (!success) {
            wrappedModule.FPDF_CloseDocument(newDoc);
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("Failed to save combined PDF");
        }

        const size = wrappedModule.PDFiumExt_GetFileWriterSize(writer);
        if (size <= 0) {
            wrappedModule.PDFiumExt_CloseFileWriter(writer);
            wrappedModule.FPDF_CloseDocument(newDoc);
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("PDF size is 0 or invalid");
        }

        const outputBuffer = wasmExports.malloc(size);
        const bytesWritten = wrappedModule.PDFiumExt_GetFileWriterData(writer, outputBuffer, size);

        if (bytesWritten <= 0) {
            wasmExports.free(outputBuffer);
            wrappedModule.PDFiumExt_CloseFileWriter(writer);
            wrappedModule.FPDF_CloseDocument(newDoc);
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("Failed to get file writer data");
        }

        const currentHeap = wrappedModule.pdfium.HEAPU8;
        const pdfBuffer = new Uint8Array(currentHeap.subarray(outputBuffer, outputBuffer + bytesWritten)).slice();

        // Cleanup
        wasmExports.free(outputBuffer);
        wrappedModule.PDFiumExt_CloseFileWriter(writer);
        wrappedModule.FPDF_CloseDocument(newDoc);
        wrappedModule.FPDF_CloseDocument(srcDoc);
        wasmExports.free(fileData);

        // Complete
        self.postMessage({
            type: 'COMBINE_PROGRESS',
            id: reqId,
            payload: { progress: 100, stage: 'complete', currentPage: pagesToCombine.length, totalPages: pagesToCombine.length }
        });

        self.postMessage({
            type: 'COMBINE_COMPLETE',
            id: reqId,
            payload: pdfBuffer
        }, [pdfBuffer.buffer]);

    } catch (e: any) {
        console.error(e);
        self.postMessage({
            type: 'ERROR',
            id: reqId,
            payload: e.message || String(e)
        });
    }
}

// Detect blank pages in a PDF
// Returns an array of page indexes that are considered blank based on the threshold
async function handleDetectBlankPages(file: File, threshold: number, reqId: string) {
    const wasmExports = wrappedModule.pdfium.wasmExports;

    try {
        // Load the document
        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        const fileData = wasmExports.malloc(uint8Array.length);
        wrappedModule.pdfium.HEAPU8.set(uint8Array, fileData);

        const doc = wrappedModule.FPDF_LoadMemDocument(fileData, uint8Array.length, "");
        if (!doc) {
            wasmExports.free(fileData);
            throw new Error("Failed to load document");
        }

        const pageCount = wrappedModule.FPDF_GetPageCount(doc);
        const blankPages: number[] = [];
        const pageAnalysis: { pageIndex: number; isBlank: boolean; whitePercentage: number }[] = [];

        // Analyze each page
        for (let i = 0; i < pageCount; i++) {
            const page = wrappedModule.FPDF_LoadPage(doc, i);
            if (!page) {
                pageAnalysis.push({ pageIndex: i, isBlank: false, whitePercentage: 0 });
                continue;
            }

            // Get page dimensions
            const width = wrappedModule.FPDF_GetPageWidthF(page);
            const height = wrappedModule.FPDF_GetPageHeightF(page);

            // Render at a small size for fast analysis (100px width max)
            const scale = Math.min(100 / width, 100 / height);
            const renderWidth = Math.max(1, Math.floor(width * scale));
            const renderHeight = Math.max(1, Math.floor(height * scale));

            // Create bitmap
            const bitmap = wrappedModule.FPDFBitmap_Create(renderWidth, renderHeight, 0);
            if (!bitmap) {
                wrappedModule.FPDF_ClosePage(page);
                pageAnalysis.push({ pageIndex: i, isBlank: false, whitePercentage: 0 });
                continue;
            }

            // Fill with white background
            wrappedModule.FPDFBitmap_FillRect(bitmap, 0, 0, renderWidth, renderHeight, 0xFFFFFFFF);

            // Render page to bitmap
            wrappedModule.FPDF_RenderPageBitmap(
                bitmap,
                page,
                0, 0,
                renderWidth, renderHeight,
                0, // rotate
                0  // flags
            );

            // Get bitmap data
            const bitmapBuffer = wrappedModule.FPDFBitmap_GetBuffer(bitmap);
            const stride = wrappedModule.FPDFBitmap_GetStride(bitmap);
            const currentHeap = wrappedModule.pdfium.HEAPU8;

            // Analyze pixels for whiteness
            let whitePixels = 0;
            let totalPixels = renderWidth * renderHeight;

            for (let y = 0; y < renderHeight; y++) {
                for (let x = 0; x < renderWidth; x++) {
                    const pixelOffset = bitmapBuffer + y * stride + x * 4;
                    const b = currentHeap[pixelOffset];
                    const g = currentHeap[pixelOffset + 1];
                    const r = currentHeap[pixelOffset + 2];

                    // Check if pixel is white or near-white (threshold: 250+)
                    if (r >= 250 && g >= 250 && b >= 250) {
                        whitePixels++;
                    }
                }
            }

            const whitePercentage = (whitePixels / totalPixels) * 100;
            const isBlank = whitePercentage >= threshold;

            if (isBlank) {
                blankPages.push(i);
            }

            pageAnalysis.push({ pageIndex: i, isBlank, whitePercentage });

            // Cleanup
            wrappedModule.FPDFBitmap_Destroy(bitmap);
            wrappedModule.FPDF_ClosePage(page);

            // Progress update
            self.postMessage({
                type: 'DETECT_BLANK_PROGRESS',
                id: reqId,
                payload: {
                    progress: Math.round((i + 1) / pageCount * 100),
                    currentPage: i + 1,
                    totalPages: pageCount,
                    blankPagesFound: blankPages.length
                }
            });
        }

        // Cleanup
        wrappedModule.FPDF_CloseDocument(doc);
        wasmExports.free(fileData);

        // Return results
        self.postMessage({
            type: 'DETECT_BLANK_COMPLETE',
            id: reqId,
            payload: {
                blankPages,
                pageAnalysis,
                totalPages: pageCount
            }
        });

    } catch (e: any) {
        console.error(e);
        self.postMessage({
            type: 'ERROR',
            id: reqId,
            payload: e.message || String(e)
        });
    }
}

// Remove specified pages from a PDF
async function handleRemoveBlankPages(file: File, pagesToRemove: number[], reqId: string) {
    const wasmExports = wrappedModule.pdfium.wasmExports;

    try {
        // Load the source document
        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        const fileData = wasmExports.malloc(uint8Array.length);
        wrappedModule.pdfium.HEAPU8.set(uint8Array, fileData);

        const srcDoc = wrappedModule.FPDF_LoadMemDocument(fileData, uint8Array.length, "");
        if (!srcDoc) {
            wasmExports.free(fileData);
            throw new Error("Failed to load document");
        }

        const totalPageCount = wrappedModule.FPDF_GetPageCount(srcDoc);
        const pagesToRemoveSet = new Set(pagesToRemove);

        // Calculate pages to keep
        const pagesToKeep: number[] = [];
        for (let i = 0; i < totalPageCount; i++) {
            if (!pagesToRemoveSet.has(i)) {
                pagesToKeep.push(i);
            }
        }

        if (pagesToKeep.length === 0) {
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("Cannot remove all pages from the document");
        }

        // Progress update
        self.postMessage({
            type: 'REMOVE_BLANK_PROGRESS',
            id: reqId,
            payload: { progress: 20, stage: 'creating' }
        });

        // Create new document
        const newDoc = wrappedModule.FPDF_CreateNewDocument();
        if (!newDoc) {
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("Failed to create new document");
        }

        // Import pages to keep
        for (let i = 0; i < pagesToKeep.length; i++) {
            const srcPageIndex = pagesToKeep[i];

            // Import page
            const success = wrappedModule.FPDF_ImportPages(newDoc, srcDoc, String(srcPageIndex + 1), i);
            if (!success) {
                console.warn(`Failed to import page ${srcPageIndex + 1}`);
            }

            // Progress update
            self.postMessage({
                type: 'REMOVE_BLANK_PROGRESS',
                id: reqId,
                payload: {
                    progress: 20 + Math.round((i + 1) / pagesToKeep.length * 60),
                    stage: 'importing',
                    currentPage: i + 1,
                    totalPages: pagesToKeep.length
                }
            });
        }

        // Save progress
        self.postMessage({
            type: 'REMOVE_BLANK_PROGRESS',
            id: reqId,
            payload: { progress: 85, stage: 'saving' }
        });

        // Save the document
        const writer = wrappedModule.PDFiumExt_OpenFileWriter();
        const success = wrappedModule.PDFiumExt_SaveAsCopy(newDoc, writer);

        if (!success) {
            wrappedModule.FPDF_CloseDocument(newDoc);
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("Failed to save PDF");
        }

        const size = wrappedModule.PDFiumExt_GetFileWriterSize(writer);
        if (size <= 0) {
            wrappedModule.PDFiumExt_CloseFileWriter(writer);
            wrappedModule.FPDF_CloseDocument(newDoc);
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("PDF size is 0 or invalid");
        }

        const outputBuffer = wasmExports.malloc(size);
        const bytesWritten = wrappedModule.PDFiumExt_GetFileWriterData(writer, outputBuffer, size);

        if (bytesWritten <= 0) {
            wasmExports.free(outputBuffer);
            wrappedModule.PDFiumExt_CloseFileWriter(writer);
            wrappedModule.FPDF_CloseDocument(newDoc);
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("Failed to get file writer data");
        }

        const currentHeap = wrappedModule.pdfium.HEAPU8;
        const pdfBuffer = new Uint8Array(currentHeap.subarray(outputBuffer, outputBuffer + bytesWritten)).slice();

        // Cleanup
        wasmExports.free(outputBuffer);
        wrappedModule.PDFiumExt_CloseFileWriter(writer);
        wrappedModule.FPDF_CloseDocument(newDoc);
        wrappedModule.FPDF_CloseDocument(srcDoc);
        wasmExports.free(fileData);

        // Complete
        self.postMessage({
            type: 'REMOVE_BLANK_PROGRESS',
            id: reqId,
            payload: { progress: 100, stage: 'complete' }
        });

        self.postMessage({
            type: 'REMOVE_BLANK_COMPLETE',
            id: reqId,
            payload: {
                pdfBuffer,
                removedCount: pagesToRemove.length,
                remainingCount: pagesToKeep.length
            }
        }, [pdfBuffer.buffer]);

    } catch (e: any) {
        console.error(e);
        self.postMessage({
            type: 'ERROR',
            id: reqId,
            payload: e.message || String(e)
        });
    }
}

// Compression options for both modes
interface CompressOptions {
    mode: 'lossless' | 'lossy'; // lossless = structure only, lossy = render as images
    imageQuality: number; // 10-100 for JPEG/WebP quality (only for lossy mode)
    dpi: number; // Target DPI: 72, 100, 150, 200, 300 (only for lossy mode)
    imageFormat: 'jpeg' | 'webp'; // Output format (only for lossy mode)
    grayscale: boolean; // Convert to grayscale (only for lossy mode)
}

// Render page to JPEG data URL using PDFium + OffscreenCanvas
async function renderPageToJpeg(
    doc: any,
    pageIndex: number,
    dpi: number,
    quality: number,
    grayscale: boolean
): Promise<{ dataUrl: string; pdfWidth: number; pdfHeight: number; pixelWidth: number; pixelHeight: number }> {
    const page = wrappedModule.FPDF_LoadPage(doc, pageIndex);
    if (!page) throw new Error(`Failed to load page ${pageIndex}`);

    // Get page dimensions in PDF points (1 point = 1/72 inch)
    const pdfWidth = wrappedModule.FPDF_GetPageWidthF(page);
    const pdfHeight = wrappedModule.FPDF_GetPageHeightF(page);

    // Calculate pixel dimensions based on DPI
    const scale = dpi / 72;
    const pixelWidth = Math.floor(pdfWidth * scale);
    const pixelHeight = Math.floor(pdfHeight * scale);

    // Create bitmap
    const bitmap = wrappedModule.FPDFBitmap_Create(pixelWidth, pixelHeight, 0);
    if (!bitmap) {
        wrappedModule.FPDF_ClosePage(page);
        throw new Error(`Failed to create bitmap for page ${pageIndex}`);
    }

    // Fill with white background
    wrappedModule.FPDFBitmap_FillRect(bitmap, 0, 0, pixelWidth, pixelHeight, 0xFFFFFFFF);

    // Render page to bitmap
    wrappedModule.FPDF_RenderPageBitmap(bitmap, page, 0, 0, pixelWidth, pixelHeight, 0, 0);

    // Get bitmap data and convert BGRA to RGBA
    const bitmapBuffer = wrappedModule.FPDFBitmap_GetBuffer(bitmap);
    const stride = wrappedModule.FPDFBitmap_GetStride(bitmap);
    const heapU8 = wrappedModule.pdfium.HEAPU8;

    const rgba = new Uint8ClampedArray(pixelWidth * pixelHeight * 4);
    for (let y = 0; y < pixelHeight; y++) {
        for (let x = 0; x < pixelWidth; x++) {
            const srcIdx = bitmapBuffer + y * stride + x * 4;
            const dstIdx = (y * pixelWidth + x) * 4;

            let r = heapU8[srcIdx + 2];
            let g = heapU8[srcIdx + 1];
            let b = heapU8[srcIdx + 0];

            if (grayscale) {
                const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                r = g = b = gray;
            }

            rgba[dstIdx + 0] = r;
            rgba[dstIdx + 1] = g;
            rgba[dstIdx + 2] = b;
            rgba[dstIdx + 3] = 255;
        }
    }

    // Cleanup PDFium resources
    wrappedModule.FPDFBitmap_Destroy(bitmap);
    wrappedModule.FPDF_ClosePage(page);

    // Use OffscreenCanvas to encode as JPEG
    const canvas = new OffscreenCanvas(pixelWidth, pixelHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    const imageData = new ImageData(rgba, pixelWidth, pixelHeight);
    ctx.putImageData(imageData, 0, 0);

    // Convert to JPEG blob then to data URL
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: quality / 100 });
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Convert to base64 data URL
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const dataUrl = 'data:image/jpeg;base64,' + btoa(binary);

    return { dataUrl, pdfWidth, pdfHeight, pixelWidth, pixelHeight };
}

// Main compression handler
async function handleCompressPDF(file: File, options: CompressOptions, reqId: string) {
    const wasmExports = wrappedModule.pdfium.wasmExports;

    try {
        // Load source document
        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
        const originalSize = uint8Array.length;

        const fileData = wasmExports.malloc(uint8Array.length);
        wrappedModule.pdfium.HEAPU8.set(uint8Array, fileData);

        const doc = wrappedModule.FPDF_LoadMemDocument(fileData, uint8Array.length, "");
        if (!doc) {
            wasmExports.free(fileData);
            throw new Error("Failed to load document");
        }

        const pageCount = wrappedModule.FPDF_GetPageCount(doc);

        // Progress: starting
        self.postMessage({
            type: 'COMPRESS_PROGRESS',
            id: reqId,
            payload: { progress: 5, stage: 'analyzing', currentPage: 0, totalPages: pageCount }
        });

        let pdfBuffer: Uint8Array;

        if (options.mode === 'lossy') {
            // === LOSSY MODE: Render pages as JPEG and create new PDF with jsPDF ===
            // WARNING: This converts text to images (loses selectability/searchability)

            // Dynamically import jsPDF
            const { jsPDF } = await import('jspdf');

            // Collect all page images first
            const pageImages: { dataUrl: string; pdfWidth: number; pdfHeight: number }[] = [];

            for (let i = 0; i < pageCount; i++) {
                const result = await renderPageToJpeg(
                    doc, i, options.dpi, options.imageQuality, options.grayscale
                );
                pageImages.push(result);

                self.postMessage({
                    type: 'COMPRESS_PROGRESS',
                    id: reqId,
                    payload: {
                        progress: 5 + Math.round((i + 1) / pageCount * 70),
                        stage: 'processing',
                        currentPage: i + 1,
                        totalPages: pageCount
                    }
                });
            }

            // Close source document
            wrappedModule.FPDF_CloseDocument(doc);
            wasmExports.free(fileData);

            self.postMessage({
                type: 'COMPRESS_PROGRESS',
                id: reqId,
                payload: { progress: 80, stage: 'saving', currentPage: pageCount, totalPages: pageCount }
            });

            // Create new PDF with jsPDF
            // Use first page dimensions, will add other pages with their dimensions
            const firstPage = pageImages[0];
            const isLandscape = firstPage.pdfWidth > firstPage.pdfHeight;

            // jsPDF uses mm, PDF uses points. 1 point = 0.352778 mm
            const ptToMm = 0.352778;

            const pdf = new jsPDF({
                orientation: isLandscape ? 'landscape' : 'portrait',
                unit: 'mm',
                format: [firstPage.pdfWidth * ptToMm, firstPage.pdfHeight * ptToMm]
            });

            // Add each page
            for (let i = 0; i < pageImages.length; i++) {
                const { dataUrl, pdfWidth, pdfHeight } = pageImages[i];
                const widthMm = pdfWidth * ptToMm;
                const heightMm = pdfHeight * ptToMm;

                if (i > 0) {
                    // Add new page with correct dimensions
                    pdf.addPage([widthMm, heightMm], widthMm > heightMm ? 'landscape' : 'portrait');
                }

                // Add image to fill the page
                pdf.addImage(dataUrl, 'JPEG', 0, 0, widthMm, heightMm, undefined, 'FAST');
            }

            // Get PDF as array buffer
            const pdfArrayBuffer = pdf.output('arraybuffer');
            pdfBuffer = new Uint8Array(pdfArrayBuffer);

        } else {
            // === LOSSLESS MODE: Structure optimization only ===
            // Preserves all content, text remains selectable

            self.postMessage({
                type: 'COMPRESS_PROGRESS',
                id: reqId,
                payload: { progress: 50, stage: 'processing', currentPage: pageCount, totalPages: pageCount }
            });

            self.postMessage({
                type: 'COMPRESS_PROGRESS',
                id: reqId,
                payload: { progress: 70, stage: 'saving', currentPage: pageCount, totalPages: pageCount }
            });

            const writer = wrappedModule.PDFiumExt_OpenFileWriter();
            const success = wrappedModule.PDFiumExt_SaveAsCopy(doc, writer);

            if (!success) {
                wrappedModule.FPDF_CloseDocument(doc);
                wasmExports.free(fileData);
                throw new Error("Failed to save PDF");
            }

            const size = wrappedModule.PDFiumExt_GetFileWriterSize(writer);
            if (size <= 0) {
                wrappedModule.PDFiumExt_CloseFileWriter(writer);
                wrappedModule.FPDF_CloseDocument(doc);
                wasmExports.free(fileData);
                throw new Error("PDF size is 0");
            }

            const outputBuf = wasmExports.malloc(size);
            const written = wrappedModule.PDFiumExt_GetFileWriterData(writer, outputBuf, size);

            if (written <= 0) {
                wasmExports.free(outputBuf);
                wrappedModule.PDFiumExt_CloseFileWriter(writer);
                wrappedModule.FPDF_CloseDocument(doc);
                wasmExports.free(fileData);
                throw new Error("Failed to get PDF data");
            }

            pdfBuffer = new Uint8Array(wrappedModule.pdfium.HEAPU8.subarray(outputBuf, outputBuf + written)).slice();

            wasmExports.free(outputBuf);
            wrappedModule.PDFiumExt_CloseFileWriter(writer);
            wrappedModule.FPDF_CloseDocument(doc);
            wasmExports.free(fileData);
        }

        // Calculate stats
        const compressedSize = pdfBuffer.length;
        const savedBytes = Math.max(0, originalSize - compressedSize);
        const savedPercentage = savedBytes > 0 ? (savedBytes / originalSize) * 100 : 0;

        // Complete
        self.postMessage({
            type: 'COMPRESS_PROGRESS',
            id: reqId,
            payload: { progress: 100, stage: 'complete', currentPage: pageCount, totalPages: pageCount }
        });

        self.postMessage({
            type: 'COMPRESS_COMPLETE',
            id: reqId,
            payload: {
                pdfBuffer,
                originalSize,
                compressedSize,
                savedBytes,
                savedPercentage,
                gotLarger: compressedSize > originalSize
            }
        }, [pdfBuffer.buffer]);

    } catch (e: any) {
        console.error(e);
        self.postMessage({
            type: 'ERROR',
            id: reqId,
            payload: e.message || String(e)
        });
    }
}

// Posterize PDF - split each page into a grid of tiles for poster printing
async function handlePosterizePDF(
    file: File,
    pageIndexes: number[],
    gridCols: number,
    gridRows: number,
    overlapPts: number,
    reqId: string
) {
    const wasmExports = wrappedModule.pdfium.wasmExports;

    try {
        // Load the source document
        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        const fileData = wasmExports.malloc(uint8Array.length);
        wrappedModule.pdfium.HEAPU8.set(uint8Array, fileData);

        const srcDoc = wrappedModule.FPDF_LoadMemDocument(fileData, uint8Array.length, "");
        if (!srcDoc) {
            wasmExports.free(fileData);
            throw new Error("Failed to load source document");
        }

        // Create new document for output
        const outDoc = wrappedModule.FPDF_CreateNewDocument();
        if (!outDoc) {
            wrappedModule.FPDF_CloseDocument(srcDoc);
            wasmExports.free(fileData);
            throw new Error("Failed to create new document");
        }

        const totalTiles = pageIndexes.length * gridCols * gridRows;
        let currentTile = 0;

        // Process each selected page
        for (let pi = 0; pi < pageIndexes.length; pi++) {
            const pageIndex = pageIndexes[pi];

            // Get source page dimensions
            const srcPage = wrappedModule.FPDF_LoadPage(srcDoc, pageIndex);
            if (!srcPage) {
                console.warn(`Failed to load page ${pageIndex}`);
                currentTile += gridCols * gridRows;
                continue;
            }

            const srcWidth = wrappedModule.FPDF_GetPageWidth(srcPage);
            const srcHeight = wrappedModule.FPDF_GetPageHeight(srcPage);
            wrappedModule.FPDF_ClosePage(srcPage);

            // Calculate tile size on source page (with overlap consideration)
            const baseTileWidth = srcWidth / gridCols;
            const baseTileHeight = srcHeight / gridRows;

            // For each tile in the grid (left to right, top to bottom)
            for (let row = 0; row < gridRows; row++) {
                for (let col = 0; col < gridCols; col++) {
                    // Send progress update
                    self.postMessage({
                        type: 'POSTERIZE_PROGRESS',
                        id: reqId,
                        payload: {
                            currentTile,
                            totalTiles,
                            progress: Math.round((currentTile / totalTiles) * 90),
                            stage: 'creating'
                        }
                    });

                    // Import the page for this tile
                    const rangeStr = (pageIndex + 1).toString();
                    const destIndex = wrappedModule.FPDF_GetPageCount(outDoc);
                    wrappedModule.FPDF_ImportPages(outDoc, srcDoc, rangeStr, destIndex);

                    // Load the newly imported page to set its crop box
                    const newPage = wrappedModule.FPDF_LoadPage(outDoc, destIndex);
                    if (!newPage) {
                        console.warn(`Failed to load imported page for tile ${row},${col}`);
                        currentTile++;
                        continue;
                    }

                    // Calculate crop box coordinates for this tile
                    // PDF coordinates: origin at bottom-left, Y increases upward
                    // Row 0 is TOP of the visual page, so we need to reverse Y

                    // Add overlap to non-edge tiles
                    const overlapLeft = col > 0 ? overlapPts : 0;
                    const overlapRight = col < gridCols - 1 ? overlapPts : 0;
                    const overlapBottom = row < gridRows - 1 ? overlapPts : 0;
                    const overlapTop = row > 0 ? overlapPts : 0;

                    // Calculate the crop region
                    const cropLeft = col * baseTileWidth - overlapLeft;
                    const cropRight = (col + 1) * baseTileWidth + overlapRight;
                    // Flip Y: row 0 is top, so row 0 gets the highest Y values
                    const cropBottom = srcHeight - (row + 1) * baseTileHeight - overlapBottom;
                    const cropTop = srcHeight - row * baseTileHeight + overlapTop;

                    // Clamp values to page bounds
                    const finalLeft = Math.max(0, cropLeft);
                    const finalBottom = Math.max(0, cropBottom);
                    const finalRight = Math.min(srcWidth, cropRight);
                    const finalTop = Math.min(srcHeight, cropTop);

                    // Set the crop box to show only this tile
                    wrappedModule.FPDFPage_SetCropBox(newPage, finalLeft, finalBottom, finalRight, finalTop);

                    // Also set media box to match (some viewers use MediaBox as the page size)
                    wrappedModule.FPDFPage_SetMediaBox(newPage, finalLeft, finalBottom, finalRight, finalTop);

                    wrappedModule.FPDF_ClosePage(newPage);
                    currentTile++;
                }
            }
        }

        // Clean up source
        wrappedModule.FPDF_CloseDocument(srcDoc);
        wasmExports.free(fileData);

        // Save the final document
        self.postMessage({
            type: 'POSTERIZE_PROGRESS',
            id: reqId,
            payload: {
                currentTile: totalTiles,
                totalTiles,
                progress: 95,
                stage: 'saving'
            }
        });

        const writer = wrappedModule.PDFiumExt_OpenFileWriter();
        const success = wrappedModule.PDFiumExt_SaveAsCopy(outDoc, writer);

        if (!success) {
            wrappedModule.FPDF_CloseDocument(outDoc);
            throw new Error("Failed to save posterized PDF");
        }

        const size = wrappedModule.PDFiumExt_GetFileWriterSize(writer);
        if (size <= 0) {
            wrappedModule.PDFiumExt_CloseFileWriter(writer);
            wrappedModule.FPDF_CloseDocument(outDoc);
            throw new Error("PDF size is 0 or invalid");
        }

        const outputBuffer = wasmExports.malloc(size);
        const bytesWritten = wrappedModule.PDFiumExt_GetFileWriterData(writer, outputBuffer, size);

        if (bytesWritten <= 0) {
            wasmExports.free(outputBuffer);
            wrappedModule.PDFiumExt_CloseFileWriter(writer);
            wrappedModule.FPDF_CloseDocument(outDoc);
            throw new Error("Failed to get file writer data");
        }

        const currentHeap = wrappedModule.pdfium.HEAPU8;
        const pdfBuffer = new Uint8Array(currentHeap.subarray(outputBuffer, outputBuffer + bytesWritten)).slice();

        wrappedModule.PDFiumExt_CloseFileWriter(writer);
        wrappedModule.FPDF_CloseDocument(outDoc);
        wasmExports.free(outputBuffer);

        self.postMessage({
            type: 'POSTERIZE_COMPLETE',
            id: reqId,
            payload: pdfBuffer
        }, [pdfBuffer.buffer]);

    } catch (e: any) {
        console.error(e);
        self.postMessage({
            type: 'ERROR',
            id: reqId,
            payload: e.message || String(e)
        });
    }
}

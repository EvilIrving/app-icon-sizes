export type Language = 'en' | 'zh';

export const translations = {
  en: {
    // App title and meta
    appTitle: 'Icon Maker',
    appSubtitle: 'Generate App Icons for All Platforms',

    // Source section
    source: 'SOURCE',
    dropImage: 'Drop image here',
    supportedFormats: 'Supports PNG, SVG, etc. Drag & drop or click to select',
    clickToChange: 'Click to change',

    // Mode selector
    modeIcons: 'App Icons',
    modeImageSets: 'Image Sets',
    modeCustom: 'Custom',

    // Platforms section
    platformsLabel: 'PLATFORMS',
    androidFilename: 'ANDROID FILENAME',

    // Image Sets section
    filename: 'FILENAME',
    imageSetsHint: 'iOS: Assets.xcassets/<name>.imageset (1x, @2x, @3x). Android: drawable-*dpi (1x, 1.5x, 2x, 3x)',

    // Custom Sizes section
    sizesLabel: 'SIZES',
    clearAll: 'Clear all',
    outputFilename: 'OUTPUT FILENAME',

    // Export section
    export: 'Export',
    exporting: 'Exporting…',
    exportComplete: 'Export complete',
    exportFailed: 'Export failed. Please check folder permissions and try again.',
    platform: 'platform',
    platforms: 'platforms',
    size: 'size',
    sizes: 'sizes',
    image: 'image',
    images: 'images',

    // Empty states
    noImageSelected: 'No image selected',
    uploadImageHint: 'Upload a source image to preview generated icons',
    noPlatformsSelected: 'No platforms selected',
    selectPlatformsHint: 'Select platforms from the sidebar to preview',
    noSizesDefined: 'No sizes defined',
    addSizesHint: 'Add sizes from the sidebar to preview',
    selectPlatformHint: 'Select iOS and/or Android and upload an image',

    // Group headers
    imageSets: 'Image Sets',
    customSizes: 'Custom Sizes',

    // Notification
    exportSuccess: 'Export complete',
    exportSuccessBody: 'Export completed, folder opened',

    // Size list
    noSizesAdded: 'No sizes added',

    // Store images toggle
    includeStoreImages: 'Include Store Images',

    // Card actions
    download: 'Download',
    remove: 'Remove',
  },
  zh: {
    // App title and meta
    appTitle: 'Icon Maker',
    appSubtitle: '为所有平台生成应用图标',

    // Source section
    source: '源图像',
    dropImage: '拖拽图片到此处',
    supportedFormats: '支持 PNG、SVG 等，拖入或点击选择',
    clickToChange: '点击更换',

    // Mode selector
    modeIcons: '应用图标',
    modeImageSets: '图片集',
    modeCustom: '自定义',

    // Platforms section
    platformsLabel: '平台',
    androidFilename: 'Android 文件名',

    // Image Sets section
    filename: '文件名',
    imageSetsHint: 'iOS: Assets.xcassets/<name>.imageset (1x, @2x, @3x)。Android: drawable-*dpi (1x, 1.5x, 2x, 3x)',

    // Custom Sizes section
    sizesLabel: '尺寸',
    clearAll: '清空全部',
    outputFilename: '输出文件名',

    // Export section
    export: '导出',
    exporting: '导出中…',
    exportComplete: '导出完成',
    exportFailed: '导出失败，请检查下载/桌面/文档目录权限后重试。',
    platform: '个平台',
    platforms: '个平台',
    size: '个尺寸',
    sizes: '个尺寸',
    image: '张图片',
    images: '张图片',

    // Empty states
    noImageSelected: '未选择图片',
    uploadImageHint: '上传源图片以预览生成的图标',
    noPlatformsSelected: '未选择平台',
    selectPlatformsHint: '从侧边栏选择平台以预览',
    noSizesDefined: '未定义尺寸',
    addSizesHint: '从侧边栏添加尺寸以预览',
    selectPlatformHint: '选择 iOS 和/或 Android 并上传图片',

    // Group headers
    imageSets: '图片集',
    customSizes: '自定义尺寸',

    // Notification
    exportSuccess: '导出完成',
    exportSuccessBody: '导出完成，已打开所在文件夹',

    // Size list
    noSizesAdded: '未添加尺寸',

    // Store images toggle
    includeStoreImages: '包含商店图片',

    // Card actions
    download: '下载',
    remove: '移除',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

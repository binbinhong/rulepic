'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { StyleProps, SizeProps } from '@/types'

interface PreviewProps {
  text: string
  style: StyleProps
  size: SizeProps
}

export default function Preview({ text, style, size }: PreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [exportScale, setExportScale] = useState(1) // 1=标准尺寸, 2=高清尺寸

  // 移除最大高度限制，允许生成长图
  const MAX_CONTENT_LENGTH = 50000 // 只限制文字长度，不限制图片高度

  useEffect(() => {
    const content = contentRef.current
    if (!content || !text) return

    // 计算实际内容高度，不再进行字体缩放
    const verticalPadding = style.fontSize * 0.5
    const actualHeight = content.scrollHeight + (verticalPadding * 2)
    setContentHeight(actualHeight)
  }, [text, style.fontSize, style.fontFamily, style.textAlign])

  const handleExport = useCallback(async () => {
    const element = document.getElementById('preview-content')
    if (!element) {
      alert('未找到要导出的内容')
      return
    }

    setIsExporting(true)
    let tempContainer: HTMLElement | null = null
    
    try {
      // 动态导入 html2canvas
      const html2canvas = (await import('html2canvas')).default

      // 创建临时容器
      tempContainer = document.createElement('div')
      tempContainer.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 750px;
        height: auto;
      `
      document.body.appendChild(tempContainer)

      // 克隆要导出的元素
      const clone = element.cloneNode(true) as HTMLElement
      
      // 重置克隆元素的样式，移除所有变换和缩放
      clone.style.cssText = `
        transform: none !important;
        scale: none !important;
        width: 750px !important;
        height: auto !important;
        min-height: ${contentHeight}px !important;
        background: none;
        backgroundColor: transparent;
        box-shadow: none;
        border-radius: 0;
      `
      
      // 清理背景元素
      const elementsToClean = clone.querySelectorAll('.absolute.inset-0, [style*="position: relative"], div')
      elementsToClean.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.background = 'none'
          el.style.backgroundColor = 'transparent'
        }
      })

      // 确保内容区域样式正确
      const contentDiv = clone.querySelector('.preview-content')
      if (contentDiv instanceof HTMLElement) {
        contentDiv.style.fontSize = `${style.fontSize}px` // 使用原始字体大小
        contentDiv.style.fontFamily = style.fontFamily
        contentDiv.style.color = style.color
        contentDiv.style.textAlign = style.textAlign
        contentDiv.style.lineHeight = '1.6'
        contentDiv.style.letterSpacing = '0.02em'
        contentDiv.style.wordSpacing = '0.05em'
        contentDiv.style.wordBreak = 'break-word'
        contentDiv.style.whiteSpace = 'pre-wrap'
        
        // 重要：清除所有元素的内联字体大小，确保使用统一的字体设置
        const allElements = contentDiv.querySelectorAll('*')
        allElements.forEach(el => {
          if (el instanceof HTMLElement) {
            // 清除可能影响字体大小的内联样式
            el.style.removeProperty('font-size')
            // 确保使用父级字体设置
            if (!el.matches('h1, h2, h3, h4, h5, h6')) {
              el.style.fontSize = 'inherit'
            }
          }
        })
        
        // 重新设置标题的字体大小（基于用户设置的字号）
        const h2Elements = contentDiv.querySelectorAll('h2')
        h2Elements.forEach(h2 => {
          if (h2 instanceof HTMLElement) {
            h2.style.fontSize = `${style.fontSize * 1.5}px`
            h2.style.fontWeight = '600'
            h2.style.marginBottom = '0.5em'
          }
        })
        
        const h3Elements = contentDiv.querySelectorAll('h3')  
        h3Elements.forEach(h3 => {
          if (h3 instanceof HTMLElement) {
            h3.style.fontSize = `${style.fontSize * 1.25}px`
            h3.style.fontWeight = '600'
            h3.style.marginBottom = '0.5em'
          }
        })
        
        // 确保段落和其他文本元素使用用户设置的字号
        const textElements = contentDiv.querySelectorAll('p, span, div, strong, em')
        textElements.forEach(el => {
          if (el instanceof HTMLElement && !el.matches('h1, h2, h3, h4, h5, h6')) {
            el.style.fontSize = `${style.fontSize}px`
            el.style.setProperty('font-size', `${style.fontSize}px`, 'important')
          }
        })
      }

      // 确保空段落在导出时也有正确的高度
      const emptyParagraphs = clone.querySelectorAll('p:empty, .editor-paragraph:empty')
      emptyParagraphs.forEach(p => {
        if (p instanceof HTMLElement) {
          p.style.minHeight = '1.2em'
          p.style.marginBottom = '0.6em'
          p.innerHTML = '&nbsp;'
        }
      })

      tempContainer.appendChild(clone)

      // 等待DOM更新
      await new Promise(resolve => setTimeout(resolve, 100))

      // 重新计算实际高度
      const actualHeight = clone.scrollHeight
      
      // 优化html2canvas配置 - 使用用户选择的缩放比例
      const canvas = await html2canvas(clone, {
        backgroundColor: style.backgroundColor === 'transparent' ? null : style.backgroundColor,
        scale: exportScale, // 使用用户选择的缩放比例
        useCORS: true,
        logging: false,
        width: 750,
        height: actualHeight, // 使用实际计算的高度
        removeContainer: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // 确保克隆文档中的样式正确
          const clonedElement = clonedDoc.getElementById('preview-content')
          if (clonedElement) {
            clonedElement.style.width = '750px'
            clonedElement.style.height = 'auto'
          }
        }
      })

      // 生成下载链接
      const link = document.createElement('a')
      const scaleText = exportScale === 1 ? '标准' : '高清'
      link.download = `文字图片_${scaleText}_${Date.now()}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()

    } catch (error) {
      console.error('导出图片失败:', error)
      alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      if (tempContainer && document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer)
      }
      setIsExporting(false)
    }
  }, [contentHeight, style, exportScale])

  const verticalPadding = `${style.fontSize * 0.5}px`
  const horizontalPadding = '12px'
  
  // 预览区域缩放（仅用于显示，不影响导出）
  const previewScale = Math.min(500 / 750, 1)

  return (
    <div>
      <div className="mb-4 space-y-3">
        {/* 图片质量选择 */}
        <div>
          <label className="block text-sm font-medium mb-2">导出质量</label>
          <div className="flex gap-2">
            <button
              onClick={() => setExportScale(1)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                exportScale === 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              标准 (750px)
            </button>
            <button
              onClick={() => setExportScale(2)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                exportScale === 2
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              高清 (1500px)
            </button>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting || !text || text.length > MAX_CONTENT_LENGTH}
          className={`
            w-full py-2 px-4 rounded-lg transition-colors
            ${isExporting 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
            }
            text-white
          `}
          aria-label="导出图片"
        >
          {isExporting ? '导出中...' : `导出图片 (${exportScale === 1 ? '750px' : '1500px'})`}
        </button>
        {text.length > MAX_CONTENT_LENGTH && (
          <p className="text-red-500 text-sm mt-1">
            文字内容过长，请减少文字数量
          </p>
        )}
        <p className="text-sm text-gray-500">
          预览尺寸: 750×{contentHeight}px (字体: {style.fontSize}px)<br/>
          导出尺寸: {exportScale === 1 ? '750' : '1500'}×{exportScale === 1 ? contentHeight : contentHeight * 2}px<br/>
          <span className="text-xs text-green-600">✓ 字号设置已修复，预览和导出保持一致</span>
        </p>
      </div>

      <div className="flex justify-center bg-gray-50 rounded-lg p-8">
        <div
          style={{
            transform: `scale(${previewScale})`,
            transformOrigin: 'top center',
            width: 'fit-content',
          }}
        >
          <div
            id="preview-content"
            className="rounded-lg shadow-lg"
            style={{
              width: '750px',
              height: 'auto',
              minHeight: `${contentHeight}px`,
            }}
          >
            {style.backgroundColor === 'transparent' && (
              <div 
                className="absolute inset-0" 
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                  `,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  backgroundColor: 'white',
                }}
              />
            )}
            
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                backgroundColor: style.backgroundColor,
                padding: `${verticalPadding} ${horizontalPadding}`,
                minHeight: '100%',
                width: '100%',
                height: 'auto',
              }}
            >
              <div
                ref={contentRef}
                className="preview-content 
                           [&_h2]:mb-2 [&_h2]:font-semibold
                           [&_h3]:mb-2 [&_h3]:font-semibold  
                           [&_p]:mb-[0.6em] [&_p:last-child]:mb-0 [&_p]:min-h-[1.2em]
                           [&_.editor-paragraph]:mb-[0.6em] [&_.editor-paragraph]:min-h-[1.2em]
                           [&_*]:!text-[unset]"
                style={{
                  color: style.color,
                  fontSize: `${style.fontSize}px`, // 使用原始字体大小，不再缩放
                  fontFamily: style.fontFamily,
                  textAlign: style.textAlign,
                  width: '100%',
                  height: 'auto',
                  lineHeight: '1.6',
                  letterSpacing: '0.02em',
                  wordSpacing: '0.05em',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: text || '预览区域' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
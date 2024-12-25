'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { StyleProps, SizeProps } from '@/types'

interface PreviewProps {
  text: string
  style: StyleProps
  size: SizeProps
}

export default function Preview({ text, style, size }: PreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [scaledFontSize, setScaledFontSize] = useState(style.fontSize)
  const [contentHeight, setContentHeight] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  const MAX_HEIGHT = 5000
  const MAX_CONTENT_LENGTH = 10000

  useEffect(() => {
    const content = contentRef.current
    if (!content || !text) return

    const verticalPadding = style.fontSize * 0.5
    const actualHeight = content.scrollHeight + (verticalPadding * 2)
    setContentHeight(actualHeight)
    
    const containerWidth = 750 - 24
    const contentWidth = content.scrollWidth
    const ratio = Math.min(containerWidth / contentWidth, 1)
    const newFontSize = Math.min(style.fontSize * ratio, style.fontSize)
    setScaledFontSize(newFontSize)
  }, [text, style.fontSize, style.fontFamily])

  const handleExport = useCallback(async () => {
    const element = document.getElementById('preview-content')
    if (!element) {
      alert('未找到要导出的内容')
      return
    }
    
    if (contentHeight > MAX_HEIGHT) {
      alert('内容太长，请减少文字数量')
      return
    }

    setIsExporting(true)
    let tempContainer: HTMLElement | null = null
    
    try {
      tempContainer = document.createElement('div')
      tempContainer.style.cssText = 'position:absolute;left:-9999px;top:-9999px;'
      document.body.appendChild(tempContainer)

      const clone = element.cloneNode(true) as HTMLElement
      clone.style.cssText = `
        transform: none;
        width: 750px;
        height: ${contentHeight}px;
        background: none;
        backgroundColor: transparent;
      `
      
      const elementsToClean = clone.querySelectorAll('.absolute.inset-0, [style*="position: relative"], div')
      elementsToClean.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.background = 'none'
          el.style.backgroundColor = 'transparent'
        }
      })

      tempContainer.appendChild(clone)

      const canvas = await html2canvas(clone, {
        backgroundColor: null,
        scale: window.devicePixelRatio * 2,
        useCORS: true,
        logging: false,
        width: 750,
        height: contentHeight,
        removeContainer: true,
        imageTimeout: 0,
      })

      const link = document.createElement('a')
      link.download = `文字图片_${Date.now()}.png`
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
  }, [contentHeight])

  const verticalPadding = `${style.fontSize * 0.5}px`
  const horizontalPadding = '12px'
  const scale = Math.min(500 / 750, 1)

  return (
    <div>
      <div className="mb-4">
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
          {isExporting ? '导出中...' : '导出图片'}
        </button>
        {text.length > MAX_CONTENT_LENGTH && (
          <p className="text-red-500 text-sm mt-1">
            文字内容过长，请减少文字数量
          </p>
        )}
      </div>

      <div className="flex justify-center bg-gray-50 rounded-lg p-8">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            width: 'fit-content',
          }}
        >
          <div
            id="preview-content"
            className="rounded-lg shadow-lg"
            style={{
              width: '750px',
              height: `${contentHeight}px`,
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
              }}
            >
              <div
                ref={contentRef}
                style={{
                  color: style.color,
                  fontSize: `${scaledFontSize}px`,
                  fontFamily: style.fontFamily,
                  textAlign: style.textAlign,
                  width: '100%',
                  lineHeight: '1.6',
                  letterSpacing: '0.02em',
                  wordSpacing: '0.05em',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
                className="[&_h2]:text-[1.5em] [&_h2]:font-semibold [&_h2]:mb-2 
                           [&_h3]:text-[1.25em] [&_h3]:font-semibold [&_h3]:mb-2
                           [&_p]:mb-[0.6em] [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: text || '预览区域' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
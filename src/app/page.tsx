'use client'

import { useState } from 'react'
import TextEditor from '@/components/editor/TextEditor'
import Preview from '@/components/editor/Preview'
import StyleControls from '@/components/style-control/StyleControls'
import SizeControls from '@/components/style-control/SizeControls'

// 定义样式类型
interface Style {
  fontSize: number
  fontFamily: string
  color: string
  backgroundColor: string
  textAlign: 'left' | 'center' | 'right'
}

export default function Home() {
  const DEFAULT_TEXT = '<p class="text-gray-400">在此输入要转换的文字...</p>'
  const [text, setText] = useState(DEFAULT_TEXT)
  const [style, setStyle] = useState<Style>({
    fontSize: 16,
    fontFamily: '"SimSun"',
    color: '#000000',
    backgroundColor: 'transparent',
    textAlign: 'left',
  })
  const [size, setSize] = useState({
    width: 750,
    height: 1334,
  })

  // 处理样式更新
  const handleStyleChange = (newStyle: Partial<Style>) => {
    setStyle(prev => ({ ...prev, ...newStyle }))
  }

  return (
    <main className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">文字转图片工具</h1>
          <p className="text-gray-500 mt-2">
            输入文字，设置样式，一键导出图片
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左侧编辑区 */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">编辑文本</h2>
              <TextEditor 
                value={text} 
                onChange={setText} 
                style={{ 
                  fontSize: style.fontSize,
                  fontFamily: style.fontFamily 
                }}
                onStyleChange={handleStyleChange}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">尺寸设置</h2>
              <SizeControls size={size} onSizeChange={setSize} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">样式设置</h2>
              <StyleControls style={style} onStyleChange={handleStyleChange} />
            </div>
          </div>

          {/* 右侧预览区 */}
          <div className="sticky top-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">预览和导出</h2>
              <Preview text={text} style={style} size={size} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 
'use client'

import { StyleProps } from '@/types'

interface StyleControlsProps {
  style: StyleProps
  onStyleChange: (newStyle: Partial<StyleProps>) => void
}

type TextAlign = 'left' | 'center' | 'right'

interface AlignOption {
  value: TextAlign
  label: string
  icon: string
}

const fontFamilies = [
  { value: '"SimSun"', label: '宋体' },
  { value: '"Microsoft YaHei"', label: '微软雅黑' },
  { value: '"KaiTi"', label: '楷体' },
  { value: 'sans-serif', label: '无衬线' },
  { value: 'serif', label: '衬线' },
  { value: 'monospace', label: '等宽' },
]

const presetColors = [
  { label: '透明', value: 'transparent' },
  { label: '白色', value: '#FFFFFF' },
  { label: '浅灰', value: '#F5F5F5' },
  { label: '米色', value: '#FAF9DE' },
  { label: '浅蓝', value: '#F0F8FF' },
  { label: '浅粉', value: '#FFF0F5' },
]

const alignOptions: AlignOption[] = [
  { value: 'left', label: '左对齐', icon: '⫷' },
  { value: 'center', label: '居中', icon: '☰' },
  { value: 'right', label: '右对齐', icon: '⫸' },
]

export default function StyleControls({ style, onStyleChange }: StyleControlsProps) {
  const updateStyle = (newStyle: Partial<StyleProps>) => {
    onStyleChange({ ...style, ...newStyle })
  }

  return (
    <div className="space-y-4">
      {/* 字体设置 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          字体
        </label>
        <select
          value={style.fontFamily}
          onChange={(e) => updateStyle({ fontFamily: e.target.value })}
          className="w-full p-2 border rounded-lg"
        >
          {fontFamilies.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* 字号和对齐方式 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">字号</label>
          <input
            type="number"
            value={style.fontSize}
            onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
            min={12}
            max={72}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">对齐方式</label>
          <div className="flex rounded-lg border overflow-hidden">
            {alignOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateStyle({ textAlign: option.value })}
                className={`flex-1 py-2 text-center transition-colors
                  ${style.textAlign === option.value
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50'
                  }`}
                title={option.label}
              >
                {option.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 颜色设置 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            文字颜色
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={style.color}
              onChange={(e) => updateStyle({ color: e.target.value })}
              className="w-12 h-12 p-1 rounded cursor-pointer"
            />
            <input
              type="text"
              value={style.color}
              onChange={(e) => updateStyle({ color: e.target.value })}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#000000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            背景颜色
          </label>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateStyle({ backgroundColor: color.value })}
                  className={`w-8 h-8 rounded border-2 relative overflow-hidden
                    ${style.backgroundColor === color.value 
                      ? 'border-blue-500' 
                      : 'border-gray-200'
                    }`}
                  title={color.label}
                >
                  {color.value === 'transparent' ? (
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`${
                            (i + Math.floor(i / 2)) % 2 === 0
                              ? 'bg-gray-100'
                              : 'bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: color.value }}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="color"
                value={style.backgroundColor === 'transparent' ? '#ffffff' : style.backgroundColor}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                className="w-12 h-12 p-1 rounded cursor-pointer"
                disabled={style.backgroundColor === 'transparent'}
              />
              <input
                type="text"
                value={style.backgroundColor === 'transparent' ? '透明' : style.backgroundColor}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="transparent"
                disabled={style.backgroundColor === 'transparent'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
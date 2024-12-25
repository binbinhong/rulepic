'use client'

import { SizeProps } from '@/types'

interface SizeControlsProps {
  size: SizeProps
  onSizeChange: (size: SizeProps) => void
}

type PresetHeight = {
  label: string
  height: number | 'auto'
}

const presetHeights: PresetHeight[] = [
  { label: '标准', height: 1334 },
  { label: '长图', height: 2001 },
  { label: '自动', height: 'auto' },
]

export default function SizeControls({ size, onSizeChange }: SizeControlsProps) {
  const handleSizeChange = (preset: PresetHeight) => {
    if (preset.height === 'auto') {
      // 自动高度时保持当前高度
      return
    }
    onSizeChange({
      width: 750,
      height: preset.height,
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {presetHeights.map((preset) => (
          <button
            key={preset.height.toString()}
            onClick={() => handleSizeChange(preset)}
            className={`p-2 border rounded-lg text-sm transition-colors
              ${size.height === preset.height
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'hover:bg-gray-50'
              }`}
          >
            {preset.label}
            {preset.height !== 'auto' && (
              <span className="block text-xs text-gray-500">
                750 x {preset.height}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
} 
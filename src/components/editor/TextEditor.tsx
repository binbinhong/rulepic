'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Extension } from '@tiptap/core'
import { useCallback } from 'react'
import { StyleProps } from '@/types'

interface TextEditorProps {
  value: string
  onChange: (value: string) => void
  style: {
    fontSize: number
    fontFamily: string
  }
  onStyleChange: (style: Partial<StyleProps>) => void
}

const DEFAULT_TEXT = '<p class="text-gray-400">在此输入要转换的文字...</p>'

const FontSizeOptions = [
  { label: '小', size: '12px' },
  { label: '正常', size: '16px' },
  { label: '大', size: '20px' },
  { label: '特大', size: '24px' },
]

// 添加硬换行扩展
const HardBreak = Extension.create({
  name: 'hardBreak',
  
  addKeyboardShortcuts() {
    return {
      'Shift-Enter': () => {
        return this.editor.commands.setHardBreak()
      },
    }
  },
})

const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .run()
      },
    } as any
  },
})

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="border-b p-2 space-x-2 flex flex-wrap gap-y-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('bold')
            ? 'bg-blue-100 text-blue-700'
            : 'hover:bg-gray-100'
        }`}
        title="加粗"
      >
        B
      </button>
      
      <div className="border-l mx-2" />
      {FontSizeOptions.map((option) => (
        <button
          key={option.size}
          onClick={() => editor.chain().focus().setFontSize(option.size).run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('fontSize', option.size)
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100'
          }`}
          title={`设置字体大小为${option.label}`}
        >
          {option.label}
        </button>
      ))}
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('italic')
            ? 'bg-blue-100 text-blue-700'
            : 'hover:bg-gray-100'
        }`}
        title="斜体"
      >
        I
      </button>

      <button
        onClick={() => editor.chain().focus().setColor('#FF0000').run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('textStyle', { color: '#FF0000' })
            ? 'bg-red-100 text-red-700'
            : 'hover:bg-gray-100'
        }`}
        title="标红"
      >
        R
      </button>

      <button
        onClick={() => editor.chain().focus().setColor('#000000').run()}
        className={`px-2 py-1 rounded hover:bg-gray-100`}
        title="恢复默认颜色"
      >
        默认色
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-blue-100 text-blue-700'
            : 'hover:bg-gray-100'
        }`}
        title="大标题"
      >
        H2
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-blue-100 text-blue-700'
            : 'hover:bg-gray-100'
        }`}
        title="小标题"
      >
        H3
      </button>

      <button
        onClick={() => editor.chain().focus().setHardBreak().run()}
        className="px-2 py-1 rounded hover:bg-gray-100"
        title="插入换行"
      >
        换行
      </button>
    </div>
  )
}

export default function TextEditor({ value, onChange, style, onStyleChange }: TextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: {
          HTMLAttributes: {
            class: 'break-line',
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: 'editor-paragraph',
          },
        },
      }),
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      FontSize.configure({
        types: ['textStyle'],
      }),
      HardBreak,
    ],
    content: value,
    immediatelyRender: false, // 修复SSR警告
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      onChange(content === '<p></p>' ? DEFAULT_TEXT : content)
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[200px] [&_p]:leading-[1.6] [&_p]:tracking-[0.02em] [&_br]:block [&_br]:my-1 [&_p]:min-h-[1.2em] [&_p]:mb-[0.6em]',
      },
    },
    // 保留空段落和空白字符
    parseOptions: {
      preserveWhitespace: 'full',
    },
  })

  const handleFocus = useCallback(() => {
    if (value === DEFAULT_TEXT && editor) {
      editor.commands.setContent('')
    }
  }, [value, editor])

  return (
    <div className="border rounded-lg overflow-hidden">
      <MenuBar editor={editor} />
      <div className="flex flex-col gap-4 p-4">
        <EditorContent 
          editor={editor} 
          onFocus={handleFocus}
        />
        <div>
          <label className="block text-sm font-medium mb-2">字号</label>
          <input
            type="number"
            value={style.fontSize}
            onChange={(e) => onStyleChange({ fontSize: Number(e.target.value) })}
            min={8}
            max={72}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="text-sm text-gray-500 p-2 border-t">
        提示：按 Enter 创建新段落，按 Shift+Enter 创建换行，连续按Enter可创建空行
      </div>
    </div>
  )
} 
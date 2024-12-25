import './globals.css'

export const metadata = {
  title: '文字转图片工具',
  description: '简单好用的文字转图片工具，支持自定义样式、大小、字体等',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}

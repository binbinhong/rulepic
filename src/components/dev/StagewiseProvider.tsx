'use client'

import { StagewiseToolbar } from '@stagewise/toolbar-next'

const stagewiseConfig = {
  plugins: []
}

export function StagewiseProvider() {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return <StagewiseToolbar config={stagewiseConfig} />
} 
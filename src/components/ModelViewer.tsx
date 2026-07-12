'use client'

import { useEffect, useRef } from 'react'

export function ModelViewer({ src, alt }: { src: string; alt?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cleanup: (() => void) | undefined

    async function loadViewer() {
      const { ModelViewerElement } = await import('@google/model-viewer')
      if (!customElements.get('model-viewer')) {
        customElements.define('model-viewer', ModelViewerElement)
      }

      if (containerRef.current) {
        const viewer = document.createElement('model-viewer')
        viewer.setAttribute('src', src)
        viewer.setAttribute('alt', alt || '3D Model')
        viewer.setAttribute('camera-controls', '')
        viewer.setAttribute('auto-rotate', '')
        viewer.setAttribute('shadow-intensity', '1')
        viewer.style.width = '100%'
        viewer.style.height = '400px'
        viewer.style.backgroundColor = 'var(--color-muted)'
        viewer.style.borderRadius = 'var(--radius)'
        containerRef.current.appendChild(viewer)

        cleanup = () => {
          viewer.remove()
        }
      }
    }

    loadViewer()

    return () => {
      cleanup?.()
    }
  }, [src, alt])

  return (
    <div className="mb-8">
      <div ref={containerRef} className="w-full rounded-lg overflow-hidden" style={{ minHeight: '400px' }} />
      <p className="text-xs text-muted-foreground/60 mt-1">3D model — drag to rotate</p>
    </div>
  )
}

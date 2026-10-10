import React from 'react'

type SerializedNode = {
  type: string
  children?: SerializedNode[]
  content?: SerializedNode[]
  text?: string
  href?: string
  attrs?: Record<string, unknown>
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
  tag?: number
  listType?: 'bullet' | 'ordered'
  [key: string]: unknown
}

function sanitizeUrl(url: string | undefined): string | undefined {
  if (!url) return url
  const lower = url.toLowerCase()
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return undefined
  }
  return url
}

export function renderRichText(nodes: unknown): React.ReactNode {
  if (!nodes) return null

  const list: SerializedNode[] = Array.isArray(nodes)
    ? nodes
    : typeof nodes === 'object' && nodes !== null && Array.isArray((nodes as any).content)
      ? (nodes as any).content
      : []

  if (list.length === 0) return null

  return list.map((node, i) => renderNode(node, i))
}

function renderTextWithMarks(node: SerializedNode, key: number): React.ReactNode {
  let content: React.ReactNode = node.text || ''
  if (!node.marks || !Array.isArray(node.marks) || node.marks.length === 0) {
    return <React.Fragment key={key}>{content}</React.Fragment>
  }

  node.marks.forEach((mark, mIdx) => {
    switch (mark.type) {
      case 'bold':
        content = <strong key={mIdx}>{content}</strong>
        break
      case 'italic':
        content = <em key={mIdx}>{content}</em>
        break
      case 'underline':
        content = <u key={mIdx}>{content}</u>
        break
      case 'strike':
        content = <s key={mIdx}>{content}</s>
        break
      case 'code':
        content = <code key={mIdx} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{content}</code>
        break
      case 'link': {
        const href = sanitizeUrl(mark.attrs?.href as string | undefined)
        if (href) {
          content = (
            <a key={mIdx} href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-chart-2 hover:underline">
              {content}
            </a>
          )
        }
        break
      }
      default:
        break
    }
  })

  return <React.Fragment key={key}>{content}</React.Fragment>
}

function renderNode(node: SerializedNode, key: number): React.ReactNode {
  const children = node.content || node.children
  const renderedChildren = children?.map((child, j) => renderNode(child, j))

  switch (node.type) {
    case 'paragraph':
      return <p key={key} className="mb-4">{renderedChildren}</p>
    case 'heading': {
      const level = (node.attrs?.level as number) || node.tag || 2
      const tag = (level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : level === 4 ? 'h4' : 'h5') as keyof React.JSX.IntrinsicElements
      const className = level === 1 ? 'text-3xl font-bold mb-4' : level === 2 ? 'text-2xl font-bold mb-3' : 'text-xl font-bold mb-2'
      return React.createElement(tag, { key, className }, renderedChildren)
    }
    case 'text':
      return renderTextWithMarks(node, key)
    case 'bulletList':
      return <ul key={key} className="list-disc list-inside mb-4">{renderedChildren}</ul>
    case 'orderedList':
      return <ol key={key} className="list-decimal list-inside mb-4">{renderedChildren}</ol>
    case 'list':
      return node.listType === 'bullet'
        ? <ul key={key} className="list-disc list-inside mb-4">{renderedChildren}</ul>
        : <ol key={key} className="list-decimal list-inside mb-4">{renderedChildren}</ol>
    case 'listItem':
    case 'listitem':
      return <li key={key} className="mb-1">{renderedChildren}</li>
    case 'blockquote':
    case 'quote':
      return <blockquote key={key} className="border-l-4 border-gray-300 pl-4 italic my-4">{renderedChildren}</blockquote>
    case 'horizontalRule':
      return <hr key={key} className="my-6 border-border" />
    case 'image': {
      const src = sanitizeUrl((node.attrs?.src as string) || (node.src as string) || (node.url as string))
      if (!src) return null
      const alt = (node.attrs?.alt as string) || (node.alt as string) || ''
      const title = (node.attrs?.title as string) || (node.title as string) || undefined
      return (
        <figure key={key} className="my-6">
          <img
            src={src}
            alt={alt}
            title={title}
            className="w-full h-auto rounded-lg border border-border object-cover max-h-[650px]"
            loading="lazy"
          />
          {title && (
            <figcaption className="text-center text-xs text-muted-foreground mt-2">{title}</figcaption>
          )}
        </figure>
      )
    }
    case 'link': {
      const href = sanitizeUrl(node.href || (node.attrs?.href as string | undefined))
      if (!href) return <React.Fragment key={key}>{renderedChildren}</React.Fragment>
      return <a key={key} href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-chart-2 hover:underline">{renderedChildren}</a>
    }
    default:
      if (renderedChildren && renderedChildren.length > 0) {
        return <React.Fragment key={key}>{renderedChildren}</React.Fragment>
      }
      return <React.Fragment key={key}>{node.text || ''}</React.Fragment>
  }
}

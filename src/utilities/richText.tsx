import React from 'react'

type SerializedNode = {
  type: string
  children?: SerializedNode[]
  text?: string
  href?: string
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

export function renderRichText(nodes: SerializedNode[] | undefined): React.ReactNode {
  if (!nodes) return null
  return nodes.map((node, i) => renderNode(node, i))
}

function renderNode(node: SerializedNode, key: number): React.ReactNode {
  switch (node.type) {
    case 'paragraph':
      return <p key={key} className="mb-4">{node.children?.map((child, j) => renderNode(child, j))}</p>
    case 'heading': {
      const tag = `h${node.tag || 2}` as keyof React.JSX.IntrinsicElements
      const className = node.tag === 1 ? 'text-3xl font-bold mb-4' : node.tag === 2 ? 'text-2xl font-bold mb-3' : 'text-xl font-bold mb-2'
      return React.createElement(tag, { key, className }, node.children?.map((child, j) => renderNode(child, j)))
    }
    case 'text':
      return <React.Fragment key={key}>{node.text}</React.Fragment>
    case 'list':
      return node.listType === 'bullet'
        ? <ul key={key} className="list-disc list-inside mb-4">{node.children?.map((child, j) => renderNode(child, j))}</ul>
        : <ol key={key} className="list-decimal list-inside mb-4">{node.children?.map((child, j) => renderNode(child, j))}</ol>
    case 'listitem':
      return <li key={key} className="mb-1">{node.children?.map((child, j) => renderNode(child, j))}</li>
    case 'quote':
      return <blockquote key={key} className="border-l-4 border-gray-300 pl-4 italic my-4">{node.children?.map((child, j) => renderNode(child, j))}</blockquote>
    case 'link': {
      const href = sanitizeUrl(node.href)
      if (!href) return <React.Fragment key={key}>{node.children?.map((child, j) => renderNode(child, j))}</React.Fragment>
      return <a key={key} href={href} target="_blank" rel="noopener noreferrer nofollow">{node.children?.map((child, j) => renderNode(child, j))}</a>
    }
    default:
      return <React.Fragment key={key}>{node.text}</React.Fragment>
  }
}

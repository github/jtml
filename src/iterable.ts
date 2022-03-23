import {TemplateResult} from './template-result.js'
import {NodeTemplatePart} from '@github/template-parts'
import type {TemplatePart} from '@github/template-parts'

function isIterable(value: unknown): value is Iterable<unknown> {
  return typeof value === 'object' && Symbol.iterator in ((value as unknown) as Record<symbol, unknown>)
}

export function processIterable(part: TemplatePart, value: unknown): boolean {
  if (!isIterable(value)) return false
  if (part instanceof NodeTemplatePart) {
    const nodes = []
    for (const item of value) {
      if (item instanceof TemplateResult) {
        const fragment = document.createDocumentFragment()
        item.renderInto(fragment)
        nodes.push(...fragment.childNodes)
      } else if (item instanceof DocumentFragment) {
        nodes.push(...item.childNodes)
      } else {
        nodes.push(String(item))
      }
    }
    if (nodes.length) part.replace(...nodes)
    return true
  } else {
    part.value = Array.from(value).join(' ')
    return true
  }
}

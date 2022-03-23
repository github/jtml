import {NodeTemplatePart} from '@github/template-parts'
import type {TemplatePart} from '@github/template-parts'

export function processDocumentFragment(part: TemplatePart, value: unknown): boolean {
  if (value instanceof DocumentFragment && part instanceof NodeTemplatePart) {
    if (value.childNodes.length) part.replace(...value.childNodes)
    return true
  }
  return false
}

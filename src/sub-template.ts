import {NodeTemplatePart} from '@github/template-parts'
import type {TemplatePart} from '@github/template-parts'

import {TemplateResult} from './template-result.js'

export function processSubTemplate(part: TemplatePart, value: unknown): boolean {
  if (value instanceof TemplateResult && part instanceof NodeTemplatePart) {
    value.renderInto(part)
    return true
  }
  return false
}

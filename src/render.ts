import type {NodeTemplatePart} from '@github/template-parts'

import {TemplateResult} from './template-result.js'

export function render(result: TemplateResult, element: Node | NodeTemplatePart): void {
  result.renderInto(element)
}

import {processor} from './processor.js'
import {TemplateResult} from './template-result.js'

export function html(strings: TemplateStringsArray, ...values: unknown[]): TemplateResult {
  return new TemplateResult(strings, values, processor)
}

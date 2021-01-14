import {
  TemplateInstance,
  NodeTemplatePart,
  createProcessor,
  processPropertyIdentity,
  processBooleanAttribute
} from '@github/template-parts'
import {processDirective} from './directive'
import {processEvent} from './events'
import type {TemplatePart, TemplateTypeInit} from '@github/template-parts'

function processSubTemplate(part: TemplatePart, value: unknown): boolean {
  if (value instanceof TemplateResult && part instanceof NodeTemplatePart) {
    render(value, part)
    return true
  }
  return false
}

function processDocumentFragment(part: TemplatePart, value: unknown): boolean {
  if (value instanceof DocumentFragment && part instanceof NodeTemplatePart) {
    part.replace((value as unknown) as ChildNode)
    return true
  }
  return false
}

export function processPart(part: TemplatePart, value: unknown): void {
  processDirective(part, value) ||
    processBooleanAttribute(part, value) ||
    processEvent(part, value) ||
    processSubTemplate(part, value) ||
    processDocumentFragment(part, value) ||
    processPropertyIdentity(part, value)
}

const templates = new WeakMap<TemplateStringsArray, HTMLTemplateElement>()
export class TemplateResult {
  constructor(
    public readonly strings: TemplateStringsArray,
    public readonly values: unknown[],
    public readonly processor: TemplateTypeInit
  ) {}

  get template(): HTMLTemplateElement {
    if (templates.has(this.strings)) {
      return templates.get(this.strings)!
    } else {
      const template = document.createElement('template')
      const end = this.strings.length - 1
      template.innerHTML = this.strings.reduce((str, cur, i) => str + cur + (i < end ? `{{ ${i} }}` : ''), '')
      templates.set(this.strings, template)
      return template
    }
  }
}

const defaultProcessor = createProcessor(processPart)
export function html(strings: TemplateStringsArray, ...values: unknown[]): TemplateResult {
  return new TemplateResult(strings, values, defaultProcessor)
}

const renderedTemplates = new WeakMap<Node | NodeTemplatePart, HTMLTemplateElement>()
const renderedTemplateInstances = new WeakMap<Node | NodeTemplatePart, TemplateInstance>()
export function render(result: TemplateResult, element: Node | NodeTemplatePart): void {
  if (renderedTemplates.get(element) !== result.template) {
    renderedTemplates.set(element, result.template)
    const instance = new TemplateInstance(result.template, result.values, result.processor)
    renderedTemplateInstances.set(element, instance)
    if (element instanceof NodeTemplatePart) {
      element.replace(...instance.children)
    } else {
      element.appendChild(instance)
    }
  }
  renderedTemplateInstances.get(element)!.update((result.values as unknown) as Record<string, unknown>)
}

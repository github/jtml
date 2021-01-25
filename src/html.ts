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
    value.renderInto(part)
    return true
  }
  return false
}

function processDocumentFragment(part: TemplatePart, value: unknown): boolean {
  if (value instanceof DocumentFragment && part instanceof NodeTemplatePart) {
    if (value.childNodes.length) part.replace(...value.childNodes)
    return true
  }
  return false
}

function isIterable(value: unknown): value is Iterable<unknown> {
  return typeof value === 'object' && Symbol.iterator in ((value as unknown) as Record<symbol, unknown>)
}

function processIterable(part: TemplatePart, value: unknown): boolean {
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

export function processPart(part: TemplatePart, value: unknown): void {
  processDirective(part, value) ||
    processBooleanAttribute(part, value) ||
    processEvent(part, value) ||
    processSubTemplate(part, value) ||
    processDocumentFragment(part, value) ||
    processIterable(part, value) ||
    processPropertyIdentity(part, value)
}

const templates = new WeakMap<TemplateStringsArray, HTMLTemplateElement>()
const renderedTemplates = new WeakMap<Node | NodeTemplatePart, HTMLTemplateElement>()
const renderedTemplateInstances = new WeakMap<Node | NodeTemplatePart, TemplateInstance>()
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

  renderInto(element: Node | NodeTemplatePart): void {
    const template = this.template
    if (renderedTemplates.get(element) !== template) {
      renderedTemplates.set(element, template)
      const instance = new TemplateInstance(template, this.values, this.processor)
      renderedTemplateInstances.set(element, instance)
      if (element instanceof NodeTemplatePart) {
        element.replace(...instance.children)
      } else {
        element.appendChild(instance)
      }
      return
    }
    renderedTemplateInstances.get(element)!.update((this.values as unknown) as Record<string, unknown>)
  }
}

const defaultProcessor = createProcessor(processPart)
export function html(strings: TemplateStringsArray, ...values: unknown[]): TemplateResult {
  return new TemplateResult(strings, values, defaultProcessor)
}

export function render(result: TemplateResult, element: Node | NodeTemplatePart): void {
  result.renderInto(element)
}

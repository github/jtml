import {TemplateInstance, AttributeTemplatePart, NodeTemplatePart} from '@github/template-parts'
import {isDirective} from './directive'
import type {TemplatePart, TemplateTypeInit} from '@github/template-parts'

const defaultProcessor = {
  createCallback(instance: TemplateInstance, parts: Iterable<TemplatePart>, params: unknown): void {
    return this.processCallback(instance, parts, params)
  },

  processCallback(_: TemplateInstance, parts: Iterable<TemplatePart>, params: unknown): void {
    if (typeof params !== 'object' || !params) return
    for (const part of parts) processPart(part, params)
  }
}

const eventListeners = new WeakMap<Element, Map<string, EventHandler>>()
class EventHandler {
  handleEvent!: EventListener
  constructor(private element: Element, private type: string) {
    this.element.addEventListener(this.type, this)
    eventListeners.get(this.element)!.set(this.type, this)
  }
  set(listener: EventListener) {
    if (typeof listener == 'function') {
      this.handleEvent = listener.bind(this.element)
    } else if (typeof listener === 'object' && typeof (listener as EventHandler).handleEvent === 'function') {
      this.handleEvent = (listener as EventHandler).handleEvent.bind(listener)
    } else {
      this.element.removeEventListener(this.type, this)
      eventListeners.get(this.element)!.delete(this.type)
    }
  }
  static for(part: AttributeTemplatePart): EventHandler {
    if (!eventListeners.has(part.element)) eventListeners.set(part.element, new Map())
    const type = part.attributeName.slice(2)
    const elementListeners = eventListeners.get(part.element)!
    if (elementListeners.has(type)) return elementListeners.get(type)!
    return new EventHandler(part.element, type)
  }
}

export function processPart(part: TemplatePart, params: unknown): void {
  if (typeof params !== 'object' || !params) return
  if (!(part.expression in params)) return
  const value = (params as Record<string, unknown>)[part.expression] ?? ''
  if (isDirective(value)) {
    value(part)
  } else if (
    typeof value === 'boolean' &&
    part instanceof AttributeTemplatePart &&
    typeof part.element[part.attributeName as keyof Element] === 'boolean'
  ) {
    part.booleanValue = value
  } else if (part instanceof AttributeTemplatePart && part.attributeName.startsWith('on')) {
    EventHandler.for(part).set((value as unknown) as EventListener)
    part.element.removeAttributeNS(part.attributeNamespace, part.attributeName)
  } else if (value instanceof TemplateResult && part instanceof NodeTemplatePart) {
    render(value, part)
  } else if (value instanceof DocumentFragment && part instanceof NodeTemplatePart) {
    part.replace((value as unknown) as ChildNode)
  } else {
    part.value = String(value)
  }
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

import {TemplateInstance, NodeTemplatePart} from '@github/template-parts'
import type {TemplateTypeInit} from '@github/template-parts'

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

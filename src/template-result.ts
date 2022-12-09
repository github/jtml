import {TemplateInstance, NodeTemplatePart} from '@github/template-parts'
import type {TemplateTypeInit} from '@github/template-parts'

const templates = new WeakMap<TemplateStringsArray, HTMLTemplateElement>()
const renderedTemplates = new WeakMap<Node | NodeTemplatePart, HTMLTemplateElement>()
const renderedTemplateInstances = new WeakMap<Node | NodeTemplatePart, TemplateInstance>()

interface CSPTrustedHTMLToStringable {
  toString: () => string
}

interface CSPTrustedTypesPolicy {
  createHTML: (s: string) => CSPTrustedHTMLToStringable
}

export class TemplateResult {
  constructor(
    public readonly strings: TemplateStringsArray,
    public readonly values: unknown[],
    public processor: TemplateTypeInit
  ) {}

  static cspTrustedTypesPolicy: CSPTrustedTypesPolicy | null = null

  static setCSPTrustedTypesPolicy(policy: CSPTrustedTypesPolicy | null) {
    TemplateResult.cspTrustedTypesPolicy = policy
  }

  get template(): HTMLTemplateElement {
    if (templates.has(this.strings)) {
      return templates.get(this.strings)!
    } else {
      const template = document.createElement('template')
      const end = this.strings.length - 1
      const html = this.strings.reduce((str, cur, i) => str + cur + (i < end ? `{{ ${i} }}` : ''), '')
      const trustedHtml = (TemplateResult.cspTrustedTypesPolicy?.createHTML(html) as string | undefined) ?? html
      template.innerHTML = trustedHtml
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
    renderedTemplateInstances.get(element)!.update(this.values as unknown as Record<string, unknown>)
  }
}

import {directive} from './directive.js'
import {NodeTemplatePart} from '@github/template-parts'
import type {TemplatePart} from '@github/template-parts'

export const unsafeHTML = directive((value: string) => (part: TemplatePart) => {
  if (!(part instanceof NodeTemplatePart)) return
  const template = document.createElement('template')
  template.innerHTML = value
  const fragment = document.importNode(template.content, true)
  part.replace(...fragment.childNodes)
})

import {directive} from './directive.js'
import {NodeTemplatePart} from '@github/template-parts'
import type {TemplatePart} from '@github/template-parts'
import {TrustedTypesPolicy} from './trusted-types.js'

export const unsafeHTML = directive((value: string) => (part: TemplatePart) => {
  if (!(part instanceof NodeTemplatePart)) return
  const template = document.createElement('template')
  const trustedValue = TrustedTypesPolicy.cspTrustedTypesPolicy
    ? (TrustedTypesPolicy.cspTrustedTypesPolicy.createHTML(value) as string)
    : value
  template.innerHTML = trustedValue
  const fragment = document.importNode(template.content, true)
  part.replace(...fragment.childNodes)
})

import type {TemplatePart} from '@github/template-parts'

type DirectiveFactory<T extends unknown[]> = (...values: T) => DirectiveCallback
type DirectiveCallback = (part: TemplatePart) => void

const directives = new WeakSet<DirectiveCallback>()

export function isDirective(directiveCallback: unknown): directiveCallback is DirectiveCallback {
  return directives.has(directiveCallback as DirectiveCallback)
}

export function directive<A extends unknown[]>(directiveFactory: DirectiveFactory<A>): DirectiveFactory<A> {
  return (...values: A): DirectiveCallback => {
    const callback = directiveFactory(...values)
    directives.add(callback)
    return callback
  }
}

import {AttributeTemplatePart} from '@github/template-parts'
import type {TemplatePart} from '@github/template-parts'

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

export function processEvent(part: TemplatePart, value: unknown): boolean {
  if (part instanceof AttributeTemplatePart && part.attributeName.startsWith('on')) {
    EventHandler.for(part).set((value as unknown) as EventListener)
    part.element.removeAttributeNS(part.attributeNamespace, part.attributeName)
    return true
  }
  return false
}

import {createProcessor, processPropertyIdentity, processBooleanAttribute} from '@github/template-parts'
import type {TemplatePart} from '@github/template-parts'

import {processDirective} from './directive.js'
import {processEvent} from './events.js'
import {processIterable} from './iterable.js'
import {processDocumentFragment} from './document-fragment.js'
import {processSubTemplate} from './sub-template.js'

export function processPart(part: TemplatePart, value: unknown): void {
  processDirective(part, value) ||
    processBooleanAttribute(part, value) ||
    processEvent(part, value) ||
    processSubTemplate(part, value) ||
    processDocumentFragment(part, value) ||
    processIterable(part, value) ||
    processPropertyIdentity(part, value)
}

export const processor = createProcessor(processPart)

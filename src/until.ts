import {processPart} from './html'
import {directive} from './directive'
import type {TemplatePart} from '@github/template-parts'

const untils: WeakMap<TemplatePart, {i: number}> = new WeakMap()
export const until = directive((...promises: unknown[]) => (part: TemplatePart) => {
  if (!untils.has(part)) untils.set(part, {i: promises.length})
  const state = untils.get(part)!
  for (let i = 0; i < promises.length; i += 1) {
    if (promises[i] instanceof Promise) {
      // eslint-disable-next-line github/no-then
      Promise.resolve(promises[i]).then(value => {
        if (i < state.i) {
          state.i = i
          processPart(part, value)
        }
      })
    } else if (i <= state.i) {
      state.i = i
      processPart(part, promises[i])
    }
  }
})

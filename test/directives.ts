import {expect} from 'chai'
import {html, render, directive} from '../lib/index.js'

describe('directives', () => {
  let surface: HTMLElement
  beforeEach(() => {
    surface = document.createElement('section')
  })

  it('handles directives differently', () => {
    const setAsFoo = directive(() => part => {
      part.value = 'foo'
    })
    const main = () => html`<div class="${setAsFoo()}"></div>`
    render(main(), surface)
    expect(surface.innerHTML).to.equal('<div class="foo"></div>')
  })
})

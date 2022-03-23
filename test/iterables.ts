import {expect} from 'chai'
import {html, render, TemplateResult} from '../lib/index.js'

describe('iterables', () => {
  let surface: HTMLElement
  beforeEach(() => {
    surface = document.createElement('section')
  })

  it('supports arrays of strings in nodes', () => {
    const main = (list: string[]) => html`<div>${list}</div>`
    render(main(['one', 'two', 'three']), surface)
    expect(surface.innerHTML).to.equal('<div>onetwothree</div>')
    render(main(['four', 'five', 'six']), surface)
    expect(surface.innerHTML).to.equal('<div>fourfivesix</div>')
  })

  it('supports iterables of Sub Templates with text nodes', () => {
    const main = (list: Iterable<TemplateResult>) => html`<div>${list}</div>`
    let fragments = ['one', 'two', 'three'].map(text => html`${text}`)
    render(main(fragments), surface)
    expect(surface.innerHTML).to.equal('<div>onetwothree</div>')
    fragments = ['four', 'five', 'six'].map(text => html`${text}`)
    render(main(fragments), surface)
    expect(surface.innerHTML).to.equal('<div>fourfivesix</div>')
  })

  it('supports iterables of fragments with text nodes', () => {
    const main = (list: Iterable<DocumentFragment>) => html`<div>${list}</div>`
    let fragments = ['one', 'two', 'three'].map(text => {
      const fragment = document.createDocumentFragment()
      fragment.append(new Text(text))
      return fragment
    })
    render(main(fragments), surface)
    expect(surface.innerHTML).to.equal('<div>onetwothree</div>')
    fragments = ['four', 'five', 'six'].map(text => {
      const fragment = document.createDocumentFragment()
      fragment.append(new Text(text))
      return fragment
    })
    render(main(fragments), surface)
    expect(surface.innerHTML).to.equal('<div>fourfivesix</div>')
  })

  it('supports other strings iterables in nodes', () => {
    const main = (list: Iterable<string>) => html`<div>${list}</div>`
    render(main(new Set(['one', 'two', 'three'])), surface)
    expect(surface.innerHTML).to.equal('<div>onetwothree</div>')
    render(
      main(
        new Map([
          [4, 'four'],
          [5, 'five'],
          [6, 'six']
        ]).values()
      ),
      surface
    )
    expect(surface.innerHTML).to.equal('<div>fourfivesix</div>')
  })

  it('supports iterables of strings in attributes', () => {
    const main = (list: Iterable<string>) => html`<div class="${list}"></div>`
    render(main(['one', 'two', 'three']), surface)
    expect(surface.innerHTML).to.equal('<div class="one two three"></div>')
    render(main(new Set(['four', 'five', 'six'])), surface)
    expect(surface.innerHTML).to.equal('<div class="four five six"></div>')
  })

  it('supports nested iterables of document fragments', () => {
    // prettier-ignore
    const main = (list: DocumentFragment[]) => html`<ul>${list}</ul>`
    render(
      main(
        ['One', 'Two'].map(text => {
          const f = document.createDocumentFragment()
          const li = document.createElement('li')
          li.textContent = text
          f.append(li)
          return f
        })
      ),
      surface
    )
    expect(surface.innerHTML).to.equal('<ul><li>One</li><li>Two</li></ul>')
  })

  it('supports nested iterables of templates', () => {
    const child = (item: Record<string, unknown>) => html`<li>${item.name}</li>`
    // prettier-ignore
    const main = (list: Array<Record<string, unknown>>) => html`<ul>${list.map(child)}</ul>`
    render(main([{name: 'One'}, {name: 'Two'}, {name: 'Three'}]), surface)
    expect(surface.innerHTML).to.equal('<ul><li>One</li><li>Two</li><li>Three</li></ul>')
    render(main([{name: 'Two'}, {name: 'Three'}, {name: 'Four'}]), surface)
    expect(surface.innerHTML).to.equal('<ul><li>Two</li><li>Three</li><li>Four</li></ul>')
  })
})

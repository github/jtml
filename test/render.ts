import {expect} from 'chai'
import {html, render, TemplateResult} from '../lib/index.js'
import type {TemplateResult} from '../lib/index.js'

describe('render', () => {
  let surface: HTMLElement
  beforeEach(() => {
    surface = document.createElement('section')
  })

  afterEach(() => {
    TemplateResult.setCSPTrustedTypesPolicy(null)
  })

  it('memoizes by TemplateResult#template, updating old templates with new values', () => {
    const main = (x: string | null = null) => html`<div class="${x}"></div>`
    render(main('foo'), surface)
    expect(surface.innerHTML).to.equal('<div class="foo"></div>')
    render(main('bar'), surface)
    expect(surface.innerHTML).to.equal('<div class="bar"></div>')
  })

  describe('nesting', () => {
    it('supports nested html calls', () => {
      const main = (child: TemplateResult) => html`<div>${child}</div>`
      const child = (message: string) => html`<span>${message}</span>`
      render(main(child('Hello')), surface)
      expect(surface.innerHTML).to.equal('<div><span>Hello</span></div>')
    })

    it('updates nodes from repeat calls', () => {
      const main = (child: TemplateResult) => html`<div>${child}</div>`
      const child = (message: string) => html`<span>${message}</span>`
      render(main(child('Hello')), surface)
      expect(surface.innerHTML).to.equal('<div><span>Hello</span></div>')
      render(main(child('Goodbye')), surface)
      expect(surface.innerHTML).to.equal('<div><span>Goodbye</span></div>')
    })

    it('can nest document fragments and text nodes', () => {
      const main = (frag: DocumentFragment) => html`<span>${frag}</span>`
      const fragment = document.createDocumentFragment()
      fragment.append(new Text('Hello World'))
      render(main(fragment), surface)
      expect(surface.innerHTML).to.equal('<span>Hello World</span>')
      fragment.append(document.createTextNode('Hello Universe!'))
      render(main(fragment), surface)
      expect(surface.innerHTML).to.equal('<span>Hello Universe!</span>')
    })

    it('renders DocumentFragments nested in sub templates nested in arrays', () => {
      const sub = () => {
        const frag = document.createDocumentFragment()
        frag.appendChild(document.createElement('div'))
        return html`<span>${frag}</span>`
      }
      const main = () => html`<div>${[sub(), sub()]}</div>`
      render(main(), surface)
      expect(surface.innerHTML).to.contain('<div><span><div></div></span><span><div></div></span></div>')
    })
  })

  describe('trusted types', () => {
    it('respects a Trusted Types Policy if it is set', () => {
      let policyCalled = false
      const rewrittenFragment = '<div id="bar"></div>'
      TemplateResult.setCSPTrustedTypesPolicy({
        createHTML: (_html: string) => {
          policyCalled = true
          return rewrittenFragment
        }
      })
      const main = (x: string | null = null) => html`<div class="${x}"></div>`
      render(main('foo'), surface)
      expect(surface.innerHTML).to.equal(rewrittenFragment)
      expect(policyCalled).to.be.true
    })
  })
})

import {html, render, unsafeHTML} from '../lib/index.js'

describe('unsafeHTML', () => {
  it('renders basic text', async () => {
    const surface = document.createElement('section')
    render(html`<div>${unsafeHTML('Hello World')}</div>`, surface)
    expect(surface.innerHTML).to.equal('<div>Hello World</div>')
  })
  it('disallows use inside of an attribute', () => {
    const surface = document.createElement('section')
    render(html`<div style="${unsafeHTML('Hello World')}"></div>`, surface)
    expect(surface.innerHTML).to.equal('<div style=""></div>')
  })
  it('renders the given value as HTML', async () => {
    const surface = document.createElement('section')
    render(html`<div>${unsafeHTML('<span>Hello World</span>')}</div>`, surface)
    expect(surface.innerHTML).to.equal('<div><span>Hello World</span></div>')
  })
  it('renders multiple children', async () => {
    const surface = document.createElement('section')
    render(html`<div>${unsafeHTML('<span>Hello</span><span>World</span>')}</div>`, surface)
    expect(surface.innerHTML).to.equal('<div><span>Hello</span><span>World</span></div>')
  })
  it('updates correctly', async () => {
    const surface = document.createElement('section')
    const fn = name => html`<div>${unsafeHTML(`<span>Hello</span><span>${name}</span>`)}</div>`
    render(fn('World'), surface)
    expect(surface.innerHTML).to.equal('<div><span>Hello</span><span>World</span></div>')
    render(fn('Universe'), surface)
    render(fn('<a href="">Universe</a>'), surface)
    expect(surface.innerHTML).to.equal('<div><span>Hello</span><span><a href="">Universe</a></span></div>')
  })
})

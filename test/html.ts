import {html, render, directive} from '..'

describe('html', () => {
  it('creates new TemplateResults with each call', () => {
    const main = (x = 'foo') => html`<div class="${x}"></div>`
    const other = (x = 'foo') => html`<div class="${x}"></div>`
    expect(main()).to.not.equal(main())
    expect(main()).to.not.equal(other())
    expect(other()).to.not.equal(other())
  })
})

describe('render', () => {
  let surface
  beforeEach(() => {
    surface = document.createElement('section')
  })

  it('memoizes by TemplateResult#template, updating old templates with new values', () => {
    const main = (x = null) => html`<div class="${x}"></div>`
    render(main('foo'), surface)
    expect(surface.innerHTML).to.equal('<div class="foo"></div>')
    render(main('bar'), surface)
    expect(surface.innerHTML).to.equal('<div class="bar"></div>')
  })

  describe('nesting', () => {
    it('supports nested html calls', () => {
      const main = child => html`<div>${child}</div>`
      const child = message => html`<span>${message}</span>`
      render(main(child('Hello')), surface)
      expect(surface.innerHTML).to.equal('<div><span>Hello</span></div>')
    })

    it('updates nodes from repeat calls', () => {
      const main = child => html`<div>${child}</div>`
      const child = message => html`<span>${message}</span>`
      render(main(child('Hello')), surface)
      expect(surface.innerHTML).to.equal('<div><span>Hello</span></div>')
      render(main(child('Goodbye')), surface)
      expect(surface.innerHTML).to.equal('<div><span>Goodbye</span></div>')
    })
  })

  describe('directives', () => {
    it('handles directives differently', () => {
      const setAsFoo = directive(() => part => {
        part.value = 'foo'
      })
      const main = () => html`<div class="${setAsFoo()}"></div>`
      render(main(), surface)
      expect(surface.innerHTML).to.equal('<div class="foo"></div>')
    })
  })

  describe('event listeners', () => {
    it('handles event listeners properly', () => {
      let i = 0
      const main = () => html`<div onclick="${() => (i += 1)}"></div>`
      render(main(), surface)
      expect(surface.innerHTML).to.equal('<div></div>')
      expect(i).to.equal(0)
      surface.children[0].click()
      expect(i).to.equal(1)
      surface.children[0].dispatchEvent(new CustomEvent('click'))
      expect(i).to.equal(2)
    })

    it('does not rebind event listeners multiple times', () => {
      let i = 0
      const main = () => html`<div onclick="${() => (i += 1)}"></div>`
      render(main(), surface)
      render(main(), surface)
      render(main(), surface)
      expect(surface.innerHTML).to.equal('<div></div>')
      expect(i).to.equal(0)
      surface.children[0].click()
      expect(i).to.equal(1)
      surface.children[0].dispatchEvent(new CustomEvent('click'))
      expect(i).to.equal(2)
    })

    it('allows events to be driven by params', () => {
      let i = 0
      const main = amt => html`<div onclick="${() => (i += amt)}"></div>`
      render(main(1), surface)
      expect(surface.innerHTML).to.equal('<div></div>')
      expect(i).to.equal(0)
      surface.children[0].click()
      expect(i).to.equal(1)
      render(main(4), surface)
      surface.children[0].dispatchEvent(new CustomEvent('click'))
      expect(i).to.equal(5)
    })

    it('will unbind event listeners by passing null', () => {
      let i = 0
      const main = listener => html`<div onclick="${listener}"></div>`
      render(
        main(() => (i += 1)),
        surface
      )
      expect(surface.innerHTML).to.equal('<div></div>')
      expect(i).to.equal(0)
      surface.children[0].click()
      expect(i).to.equal(1)
      render(main(null), surface)
      surface.children[0].click()
      surface.children[0].click()
      surface.children[0].click()
      expect(i).to.equal(1)
    })

    it('binds event handler objects', () => {
      const handler = {
        i: 0,
        handleEvent() {
          this.i += 1
        }
      }
      const main = () => html`<div onclick="${handler}"></div>`
      render(main(), surface)
      expect(surface.innerHTML).to.equal('<div></div>')
      expect(handler.i).to.equal(0)
      surface.children[0].click()
      expect(handler.i).to.equal(1)
      surface.children[0].dispatchEvent(new CustomEvent('click'))
      expect(handler.i).to.equal(2)
    })
  })
})

import {html, render, directive} from '../lib/index.js'

describe('render', () => {
  let surface
  beforeEach(() => {
    surface = document.createElement('section')
  })

  it('calls `createCallback` on first render', () => {
    const main = (x = null) => html`<div class="${x}"></div>`
    let called = false
    const instance = main()
    instance.processor = {
      processCallback() {
        throw new Error('Expected processCallback to not be called')
      },
      createCallback() {
        called = true
      }
    }
    instance.renderInto(surface)
    expect(called).to.equal(true)
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

    it('can nest document fragments and text nodes', () => {
      const main = frag => html`<span>${frag}</span>`
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

  describe('iterables', () => {
    it('supports arrays of strings in nodes', () => {
      const main = list => html`<div>${list}</div>`
      render(main(['one', 'two', 'three']), surface)
      expect(surface.innerHTML).to.equal('<div>onetwothree</div>')
      render(main(['four', 'five', 'six']), surface)
      expect(surface.innerHTML).to.equal('<div>fourfivesix</div>')
    })

    it('supports iterables of Sub Templates with text nodes', () => {
      const main = list => html`<div>${list}</div>`
      let fragments = ['one', 'two', 'three'].map(text => html`${text}`)
      render(main(fragments), surface)
      expect(surface.innerHTML).to.equal('<div>onetwothree</div>')
      fragments = ['four', 'five', 'six'].map(text => html`${text}`)
      render(main(fragments), surface)
      expect(surface.innerHTML).to.equal('<div>fourfivesix</div>')
    })

    it('supports iterables of fragments with text nodes', () => {
      const main = list => html`<div>${list}</div>`
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
      const main = list => html`<div>${list}</div>`
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
      const main = list => html`<div class="${list}"></div>`
      render(main(['one', 'two', 'three']), surface)
      expect(surface.innerHTML).to.equal('<div class="one two three"></div>')
      render(main(new Set(['four', 'five', 'six'])), surface)
      expect(surface.innerHTML).to.equal('<div class="four five six"></div>')
    })

    it('supports nested iterables of document fragments', () => {
      // prettier-ignore
      const main = list => html`<ul>${list}</ul>`
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
      const child = item => html`<li>${item.name}</li>`
      // prettier-ignore
      const main = list => html`<ul>${list.map(child)}</ul>`
      render(main([{name: 'One'}, {name: 'Two'}, {name: 'Three'}]), surface)
      expect(surface.innerHTML).to.equal('<ul><li>One</li><li>Two</li><li>Three</li></ul>')
      render(main([{name: 'Two'}, {name: 'Three'}, {name: 'Four'}]), surface)
      expect(surface.innerHTML).to.equal('<ul><li>Two</li><li>Three</li><li>Four</li></ul>')
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

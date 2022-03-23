import {expect} from 'chai'
import {html, render} from '../lib/index.js'

describe('events', () => {
  let surface: HTMLElement
  beforeEach(() => {
    surface = document.createElement('section')
  })

  describe('event listeners', () => {
    it('handles event listeners properly', () => {
      let i = 0
      const main = () => html`<div onclick="${() => (i += 1)}"></div>`
      render(main(), surface)
      expect(surface.innerHTML).to.equal('<div></div>')
      expect(i).to.equal(0)
      surface.querySelector('div')?.click()
      expect(i).to.equal(1)
      surface.querySelector('div')?.dispatchEvent(new CustomEvent('click'))
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
      surface.querySelector('div')?.click()
      expect(i).to.equal(1)
      surface.querySelector('div')?.dispatchEvent(new CustomEvent('click'))
      expect(i).to.equal(2)
    })

    it('allows events to be driven by params', () => {
      let i = 0
      const main = (amt: number) => html`<div onclick="${() => (i += amt)}"></div>`
      render(main(1), surface)
      expect(surface.innerHTML).to.equal('<div></div>')
      expect(i).to.equal(0)
      surface.querySelector('div')?.click()
      expect(i).to.equal(1)
      render(main(4), surface)
      surface.querySelector('div')?.dispatchEvent(new CustomEvent('click'))
      expect(i).to.equal(5)
    })

    it('will unbind event listeners by passing null', () => {
      let i = 0
      const main = (listener: Function | null) => html`<div onclick="${listener}"></div>`
      render(
        main(() => (i += 1)),
        surface
      )
      expect(surface.innerHTML).to.equal('<div></div>')
      expect(i).to.equal(0)
      surface.querySelector('div')?.click()
      expect(i).to.equal(1)
      render(main(null), surface)
      surface.querySelector('div')?.click()
      surface.querySelector('div')?.click()
      surface.querySelector('div')?.click()
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
      surface.querySelector('div')?.click()
      expect(handler.i).to.equal(1)
      surface.querySelector('div')?.dispatchEvent(new CustomEvent('click'))
      expect(handler.i).to.equal(2)
    })
  })
})

import {html} from '../lib/index.js'

describe('html', () => {
  it('creates new TemplateResults with each call', () => {
    const main = (x = 'foo') => html`<div class="${x}"></div>`
    const other = (x = 'foo') => html`<div class="${x}"></div>`
    expect(main()).to.not.equal(main())
    expect(main()).to.not.equal(other())
    expect(other()).to.not.equal(other())
  })
})

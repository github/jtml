import {html, render, until} from '..'

describe('until', () => {
  it('renders a Promise when it resolves', async () => {
    let resolve
    const promise = new Promise(res => (resolve = res))
    const surface = document.createElement('section')
    render(html`<div>${until(promise)}</div>`, surface)
    expect(surface.innerHTML).to.equal('<div></div>')
    resolve('foo')
    await promise
    expect(surface.innerHTML).to.equal('<div>foo</div>')
  })

  it('renders non-promise values until promises have resolved', async () => {
    let resolve
    const promise = new Promise(res => (resolve = res))
    const surface = document.createElement('section')
    render(html`<div>${until(promise, 'loading...')}</div>`, surface)
    expect(surface.innerHTML).to.equal('<div>loading...</div>')
    resolve('foo')
    await promise
    expect(surface.innerHTML).to.equal('<div>foo</div>')
  })

  it('renders values only once', async () => {
    let resolve
    const promise = new Promise(res => (resolve = res))
    const surface = document.createElement('section')
    const exec = () => render(html`<div>${until(promise, 'loading...')}</div>`, surface)
    exec()
    expect(surface.innerHTML).to.equal('<div>loading...</div>')
    resolve('foo')
    await promise
    exec()
    expect(surface.innerHTML).to.equal('<div>foo</div>')
    exec()
    expect(surface.innerHTML).to.equal('<div>foo</div>')
  })

  it('can re-render content as it changes', async () => {
    let resolve
    const promise = new Promise(res => (resolve = res))
    const surface = document.createElement('section')
    const exec = a => render(html`<div>${until(promise, a)}</div>`, surface)
    exec('loading...')
    expect(surface.innerHTML).to.equal('<div>loading...</div>')
    exec('still loading...')
    expect(surface.innerHTML).to.equal('<div>still loading...</div>')
    exec('taking forever...')
    expect(surface.innerHTML).to.equal('<div>taking forever...</div>')
    resolve('foo')
    await promise
    expect(surface.innerHTML).to.equal('<div>foo</div>')
  })

  it('will not render promises behind already resolved ones', async () => {
    let resolveFoo, resolveBar
    const promiseFoo = new Promise(res => (resolveFoo = res))
    const promiseBar = new Promise(res => (resolveBar = res))
    const surface = document.createElement('section')
    const exec = () => render(html`<div>${until(promiseFoo, promiseBar)}</div>`, surface)
    exec()
    expect(surface.innerHTML).to.equal('<div></div>')
    resolveFoo('foo')
    await promiseFoo
    expect(surface.innerHTML).to.equal('<div>foo</div>')
    resolveBar('bar')
    await promiseBar
    expect(surface.innerHTML).to.equal('<div>foo</div>')
  })

  it('supports boolean attributes', async () => {
    let resolve
    const promise = new Promise(res => (resolve = res))
    const surface = document.createElement('section')
    const exec = a => render(html`<div hidden="${until(promise, a)}"></div>`, surface)
    exec(false)
    expect(surface.innerHTML).to.equal('<div></div>')
    exec(true)
    expect(surface.innerHTML).to.equal('<div hidden=""></div>')
    exec(false)
    expect(surface.innerHTML).to.equal('<div></div>')
    resolve(true)
    await promise
    expect(surface.innerHTML).to.equal('<div hidden=""></div>')
    resolve(false)
    expect(surface.innerHTML).to.equal('<div hidden=""></div>')
  })
})

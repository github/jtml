import {expect} from 'chai'
import {setCSPTrustedTypesPolicy} from '../lib/index.js'
import {getCSPTrustedTypesPolicy} from '../lib/trusted-types.js'

describe('trusted types', () => {
  after(() => {
    setCSPTrustedTypesPolicy(null)
  })

  it('can set a CSP Trusted Types policy', () => {
    const dummyPolicy = {
      createHTML: (htmlText: string) => {
        return htmlText
      }
    }
    expect(getCSPTrustedTypesPolicy()).to.equal(null)
    setCSPTrustedTypesPolicy(dummyPolicy)
    expect(getCSPTrustedTypesPolicy()).to.equal(dummyPolicy)
  })
})

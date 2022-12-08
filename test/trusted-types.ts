import {expect} from 'chai'
import {TrustedTypesPolicy} from '../lib/index.js'

describe('trusted types', () => {
  it('can set a CSP Trusted Types policy', () => {
    const dummyPolicy = {
      createHTML: (htmlText: string) => {
        return htmlText
      }
    }
    TrustedTypesPolicy.setTrustedTypesPolicy(dummyPolicy)
    expect(TrustedTypesPolicy.cspTrustedTypesPolicy).to.equal(dummyPolicy)
  })
})

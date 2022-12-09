import {expect} from 'chai'
import {TemplateResult} from '../lib/index.js'

describe('trusted types', () => {
  after(() => {
    TemplateResult.setCSPTrustedTypesPolicy(null)
  })

  it('can set a CSP Trusted Types policy', () => {
    const dummyPolicy = {
      createHTML: (htmlText: string) => {
        return htmlText
      }
    }
    expect(TemplateResult.cspTrustedTypesPolicy).to.equal(null)
    TemplateResult.setCSPTrustedTypesPolicy(dummyPolicy)
    expect(TemplateResult.cspTrustedTypesPolicy).to.equal(dummyPolicy)
  })
})

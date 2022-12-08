interface CSPTrustedHTMLToStringable {
  toString: () => string
}

interface CSPTrustedTypesPolicy {
  createHTML: (s: string) => CSPTrustedHTMLToStringable
}

export class TrustedTypesPolicy {
  static cspTrustedTypesPolicy: CSPTrustedTypesPolicy | null = null

  static setTrustedTypesPolicy(policy: CSPTrustedTypesPolicy | null): void {
    TrustedTypesPolicy.cspTrustedTypesPolicy = policy
  }
}

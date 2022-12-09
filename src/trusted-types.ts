interface CSPTrustedHTMLToStringable {
  toString: () => string
}

interface CSPTrustedTypesPolicy {
  createHTML: (s: string) => CSPTrustedHTMLToStringable
}

let cspTrustedTypesPolicy: CSPTrustedTypesPolicy | null = null

export function getCSPTrustedTypesPolicy() {
  return cspTrustedTypesPolicy
}

export function setCSPTrustedTypesPolicy(policy: CSPTrustedTypesPolicy | null) {
  cspTrustedTypesPolicy = policy
}

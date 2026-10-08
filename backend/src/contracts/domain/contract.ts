export enum ContractType {
  // Everything is chargeable.
  BASIC = 'BASIC',
  // Most things are chargeable.
  ADVANCED = 'ADVANCED',
  // Almost nothing is chargeable: the contract covers it.
  COMPREHENSIVE = 'COMPREHENSIVE',
  // Varies by contract.
  CLIENT_SPECIFIC = 'CLIENT_SPECIFIC',
}

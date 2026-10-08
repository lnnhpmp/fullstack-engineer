import type { Deps } from '../../shared/boilerplate/deps'
import { findContractsForDevice } from '../queries/find-contracts-for-device'

export function contractResolvers(deps: Deps) {
  return {
    Query: {
      device: (_: unknown, args: { id: string }) => findContractsForDevice({ deviceId: args.id }, deps),
    },
  }
}

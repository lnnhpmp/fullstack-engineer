import type { Deps } from '../../shared/boilerplate/deps'
import { findParts } from '../queries/find-parts'

export function partResolvers(deps: Deps) {
  return {
    Query: {
      parts: (_: unknown, args: { search?: string; limit?: number }) => findParts(args, deps),
    },
  }
}

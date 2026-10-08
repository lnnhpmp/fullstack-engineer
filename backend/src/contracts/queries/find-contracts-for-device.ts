import type { Deps } from '../../shared/boilerplate/deps'
import { ContractDeviceOrmEntity } from '../infrastructure/database/contract-device.orm-entity'
import { DeviceOrmEntity } from '../infrastructure/database/device.orm-entity'

export async function findContractsForDevice(input: { deviceId: string }, deps: Pick<Deps, 'db'>) {
  const device = await deps.db.getRepository(DeviceOrmEntity).findOne({
    where: { id: input.deviceId },
    relations: { building: { customer: true } },
  })
  if (!device) return null

  const contracts = await deps.db.getRepository(ContractDeviceOrmEntity).find({
    where: { deviceId: input.deviceId },
    relations: { contract: true },
    order: { endDate: 'DESC' },
  })
  return { ...device, contracts }
}

import type { Deps } from '../shared/boilerplate/deps'
import { ContractDeviceOrmEntity } from '../contracts/infrastructure/database/contract-device.orm-entity'

export interface SFContractDeviceAssociation {
  Id: string
  Contract__c: string
  Device__c: string
  Amount__c: number
  StartDate__c: string
  EndDate__c: string
  IsTerminated__c?: boolean
  WeMaintain_ID__c?: string | null
}

export async function upsertContractDevice(
  sfContractDevice: SFContractDeviceAssociation,
  deps: Pick<Deps, 'db' | 'salesforce'>,
): Promise<void> {
  const contractId = await deps.salesforce.getWeMaintainId('Contract', 'Wemaintain_ID__c', sfContractDevice.Contract__c)
  const deviceId = await deps.salesforce.getWeMaintainId('Device__c', 'WeMaintain_ID__c', sfContractDevice.Device__c)

  if (!contractId) throw new Error('Could not find wemaintain id of contract for SFContractDevice')
  if (!deviceId) throw new Error('Could not find wemaintain id of device for SFContractDevice')

  const contractDeviceData = {
    contractId,
    deviceId,
    amount: sfContractDevice.Amount__c,
    startDate: new Date(sfContractDevice.StartDate__c),
    endDate: new Date(sfContractDevice.EndDate__c),
    isTerminated: sfContractDevice.IsTerminated__c ?? false,
    deletedAt: null,
  }

  if (!sfContractDevice.WeMaintain_ID__c) {
    // Insert
    await deps.db.transaction(async (em) => {
      const contractDevice = await em.save(em.create(ContractDeviceOrmEntity, contractDeviceData))
      await deps.salesforce.update('ContractDeviceAssociation__c', sfContractDevice.Id, {
        WeMaintain_ID__c: contractDevice.id,
      })
    })
  } else {
    // Update
    const repository = deps.db.getRepository(ContractDeviceOrmEntity)
    const existingContractDevice = await repository.findOneBy({ id: sfContractDevice.WeMaintain_ID__c })

    if (!existingContractDevice) {
      throw new Error('Could not find contract device')
    }

    await repository.save(Object.assign(existingContractDevice, contractDeviceData))
  }
}

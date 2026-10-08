import 'reflect-metadata'
import { Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { connect } from './data-source'
import { createDeps } from './deps'
import { createGraphqlServer } from './graphql'
import { SalesforceEventsController } from './salesforce-events'

@Module({ controllers: [SalesforceEventsController] })
class AppModule {}

async function bootstrap() {
  const deps = createDeps(await connect())
  const app = await NestFactory.create({ module: AppModule, providers: [{ provide: 'DEPS', useValue: deps }] }, { cors: true })
  app.use('/graphql', createGraphqlServer(deps))
  await app.listen(Number(process.env.PORT ?? 4000))
  console.log(`GraphQL on http://localhost:${process.env.PORT ?? 4000}/graphql`)
}

void bootstrap()

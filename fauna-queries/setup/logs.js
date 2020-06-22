import { DeleteIfExists, IfNotExists } from '../helpers/fql'

const faunadb = require('faunadb')
const q = faunadb.query
const { CreateCollection, CreateIndex, Collection, Index } = q

/* Collection */

// We will only keep the last 10 days of access logs.
const CreateLogsCollection = CreateCollection({ name: 'logs', ttl_days: 10 })

const CreateIndexLogsByAction = CreateIndex({
  name: 'logs_by_action',
  source: Collection('logs'),
  terms: [
    {
      field: ['data', 'action']
    }
  ]
})

const CreateIndexLogsByActionAndIdentity = CreateIndex({
  name: 'logs_by_action_and_identity',
  source: Collection('logs'),
  terms: [
    {
      field: ['data', 'action']
    },
    {
      field: ['data', 'identity']
    }
  ]
})

async function createLogsCollection(client) {
  const logsRes = await client.query(IfNotExists(Collection('logs'), CreateLogsCollection))
  await client.query(IfNotExists(Index('logs_by_action'), CreateIndexLogsByAction))
  await client.query(IfNotExists(Index('logs_by_action_and_identity'), CreateIndexLogsByActionAndIdentity))
  return logsRes
}

async function deleteLogsCollection(client) {
  await client.query(DeleteIfExists(Collection('logs')))
  await client.query(DeleteIfExists(Index('logs_by_action')))
  await client.query(DeleteIfExists(Index('logs_by_action_and_identity')))
}

export { createLogsCollection, deleteLogsCollection }
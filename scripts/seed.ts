import { getPayload } from 'payload'
import config from '../payload.config'
import { seedCategories } from '../src/seed'

async function run() {
  const payload = await getPayload({ config })
  await seedCategories(payload)
  console.log('Seed complete!')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})

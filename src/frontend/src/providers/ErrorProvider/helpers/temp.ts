import { api } from 'utils/api/api'
import { z } from 'zod'

const shema = z.object({
  title: z.string(),
  id: z.number(),
})

type shemaType = z.infer<typeof shema>

async function test() {
  const {
    data: { title, id },
  } = await api('nlah blah blah', {}, shema)
}

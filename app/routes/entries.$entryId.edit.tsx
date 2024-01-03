import { PrismaClient } from "@prisma/client"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader({ params }: LoaderFunctionArgs) {
  if (typeof params.entryId !== 'string') {
    throw new Response('Not found', { status: 404 })
  }
  let db = new PrismaClient()

  let entry = await db.entry.findUnique({ where: { id: +params.entryId } })

  if (!entry) {
    throw new Response('Not found', { status: 404 })
  }
  
  return {
    ...entry,
    date: entry.date.toISOString().substring(0, 10),
  }

}

export default function EditPage() {
  const entry = useLoaderData<typeof loader>()
  return (
    <div className="mt-4">
      <p>Editing entry {entry.id}!</p>
    </div>
  )
}
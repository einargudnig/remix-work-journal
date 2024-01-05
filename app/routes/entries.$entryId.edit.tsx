import { PrismaClient } from "@prisma/client"
import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import type { FormEvent } from "react";
import { EntryForm } from "~/components/entry-form"
import { getSession } from "~/session";

export async function action({ request, params }: ActionFunctionArgs) {
  let session = await getSession(request.headers.get("cookie"));
  if (!session.data.isAdmin) {
    throw new Response("Not authenticated", { status: 401 });
  }
  
  if (typeof params.entryId !== "string") {
    throw new Response("Not found", { status: 404 });
  }

  let db = new PrismaClient();

  let formData = await request.formData();
  let { _action, date, type, text } = Object.fromEntries(formData);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (_action === "delete") {
    await db.entry.delete({
      where: {
        id: +params.entryId,
      }
    })

    return redirect("/")

  } else {
    if (
      typeof date !== "string" ||
      typeof type !== "string" ||
      typeof text !== "string"
    ) {
      throw new Error("Bad request");
    }

    await db.entry.update({
      where: {
        id: +params.entryId,
      },
      data: {
        date: new Date(date),
        type: type,
        text: text,
      },
    });
    return redirect("/");
  }

}

export async function loader({ params, request }: LoaderFunctionArgs) {
   if (typeof params.entryId !== "string") {
    throw new Response("Not found", { status: 404 });
  }

  let db = new PrismaClient();
  let entry = await db.entry.findUnique({ where: { id: +params.entryId } });

  if (!entry) {
    throw new Response("Not found", { status: 404 });
  }

  let session = await getSession(request.headers.get("cookie"));
  if (!session.data.isAdmin) {
    throw new Response("Not authenticated", { status: 401 });
  }
  
  return {
    ...entry,
    date: entry.date.toISOString().substring(0, 10),
  }

}

export default function EditPage() {
  const entry = useLoaderData<typeof loader>()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    
    if (!confirm('Are you sure you want to delete this entry?')) {
      event.preventDefault()
    }

  }

  return (
    <div className="mx-auto max-w-7xl p-6">

      <p>Editing entry {entry.id}!</p>
      <EntryForm entry={entry} />
      <div>
        <Form method="post" onSubmit={handleSubmit}>
          <button name="_action" value="delete" className="p-1 border rounded-md">Delete this entry</button>
        </Form>
      </div>
    </div>
  )
}
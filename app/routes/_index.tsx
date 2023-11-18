import type { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { useEffect, useRef } from "react";


export async function action({ request }: ActionFunctionArgs) {
  let db = new PrismaClient()
  
  const formData = await request.formData()
  let { date, type, text } = Object.fromEntries(formData)

  // to make the pending ui a bit better
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (typeof date !== 'string' || typeof type !== 'string' || typeof text !== 'string') {
    throw new Error('Invalid form data')
  }

  return db.entry.create({
    data: {
      date: new Date(date),
      type: type,
      text: text,
    }
  })
}

export default function Index() {
  const fetcher = useFetcher()
  const textareRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { 
    if (fetcher.state === 'idle' && textareRef.current) {
      textareRef.current.value = ''
      textareRef.current.focus()
    }
  }, [fetcher.state])

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-4xl text-white">Work journal</h1>
      <p className="mt-3 text-xl text-gray-400">
        Doings and learnings. Updated weekly.
      </p>

      <div className="my-8 border p-3">
        <p className="italic">Create an entry</p>
        <fetcher.Form method="post" className="mt-2">
          <fieldset className="disabled:opacity-60" disabled={fetcher.state === 'submitting'}>
          <div>
            <div>
              <input
                type="date"
                name="date"
                required
                  className="text-gray-900"
                  defaultValue={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div className="mt-4 space-x-4">
              <label className="inline-block">
                <input defaultChecked required className="mr-1" type="radio" name="type" value="work" />
                Work
              </label>
              <label className="inline-block">
                <input className="mr-1" type="radio" name="type" value="learning" />
                Learnings
              </label>
              <label className="inline-block">
                <input className="mr-1" type="radio" name="type" value="interesting-thing" />
                Interesting thing
              </label>
            </div>

            <div className="mt-4">
                <textarea
                ref={textareRef}
                name="text"
                required
                className="w-full text-gray-900"
                placeholder="Write your entry..." />
            </div>

              <div className="mt-2 text-right">
                <button type="submit" className="bg-blue-500 px-4 py-1 font-medium text-white">
                  {fetcher.state === "submitting" ? "Saving..." : "Save"}
                </button>            
              </div>
            </div>
            </fieldset>
        </fetcher.Form>
      </div>

      <div className="mt-8">
        <ul>
          <li>
            <p>
              Week of Feb 2<sup>nd</sup>, 2023
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <p>Work:</p>
                <ul className="ml-6 list-disc">
                  <li>First thing</li>
                </ul>
              </div>
              <div>
                <p>Learnings:</p>
                <ul className="ml-6 list-disc">
                  <li>First learning</li>
                  <li>Second learning</li>
                </ul>
              </div>
              <div>
                <p>Interesting things:</p>
                <ul className="ml-6 list-disc">
                  <li>Something cool!</li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
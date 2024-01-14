import { PrismaClient } from "@prisma/client";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { format, parseISO, startOfWeek } from "date-fns";
import { EntryForm } from "~/components/entry-form";
import { getSession } from "~/session";
import { TriangleRightIcon, FrameIcon } from "@radix-ui/react-icons";
import { Badge } from "~/components/ui/badge";

export async function action({ request }: ActionFunctionArgs) {
  let session = await getSession(request.headers.get("cookie"));
  if (!session.data.isAdmin) {
    throw new Response("Not authenticated", {
      status: 401,
      statusText: "Not authenticated",
    });
  }

  let db = new PrismaClient();

  let formData = await request.formData();
  console.log(formData);
  let { date, type, text, link } = Object.fromEntries(formData);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (
    typeof date !== "string" ||
    typeof type !== "string" ||
    typeof text !== "string" ||
    typeof link !== "string"
  ) {
    throw new Error("Bad request");
  }

  // return 123
  return db.entry.create({
    data: {
      date: new Date(date),
      type: type,
      text: text,
      link: link,
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  let session = await getSession(request.headers.get("cookie"));

  let db = new PrismaClient();
  let entries = await db.entry.findMany();

  return {
    session: session.data,
    entries: entries.map((entry) => ({
      ...entry,
      date: entry.date.toISOString().substring(0, 10),
    })),
  };
}

export default function Index() {
  let { session, entries } = useLoaderData<typeof loader>();

  let entriesByWeek = entries.reduce<Record<string, typeof entries>>(
    (memo, entry) => {
      let sunday = startOfWeek(parseISO(entry.date));
      let sundayString = format(sunday, "yyyy-MM-dd");

      memo[sundayString] ||= [];
      memo[sundayString].push(entry);

      return memo;
    },
    {}
  );

  let weeks = Object.keys(entriesByWeek)
    .sort((a, b) => a.localeCompare(b))
    .map((dateString) => ({
      dateString,
      work: entriesByWeek[dateString].filter((entry) => entry.type === "work"),
      learnings: entriesByWeek[dateString].filter(
        (entry) => entry.type === "learning"
      ),
      interestingThings: entriesByWeek[dateString].filter(
        (entry) => entry.type === "interesting-thing"
      ),
    }));

  return (
    <div>
      {session.isAdmin && (
        <div className="my-8 p-3">

          <EntryForm />
        </div>
      )}

      <div className="mt-12 space-y-12">
        {weeks.reverse().map((week, weekIdx) => (
          <div key={week.dateString} className="relative">
            <div className="-ml-0.5 flex itemx-center">
              <FrameIcon className="h-5 w-5 mr-2 text-muted-foreground" />
              <h2 className="font-bold">
                Week of {format(parseISO(week.dateString), "MMMM do")}
              </h2>
            </div>
            {weekIdx !== weeks.length - 1 ? (
                <span className="absolute left-2 top-7 -ml-px h-full w-0.5 bg-muted-foreground" aria-hidden="true" />
              ) : null}
            <div className="ml-10 mt-3 space-y-4">
              {week.work.length > 0 && (
                <div>
                  <h3 className="font-semibold">Work</h3>
                  <ul className="ml-1 list-disc">
                    {week.work.map((entry) => (
                      <EntryListItem key={entry.id} entry={entry} canEdit={session.isAdmin} />
                    ))}
                  </ul>
                </div>
              )}
              {week.learnings.length > 0 && (
                <div>
                  <h3 className="font-semibold">Learning</h3>
                  <ul className="ml-1 list-disc">
                    {week.learnings.map((entry) => (
                      <EntryListItem key={entry.id} entry={entry} canEdit={session.isAdmin} />
                    ))}
                  </ul>
                </div>
              )}
              {week.interestingThings.length > 0 && (
                <div>
                  <h3 className="font-semibold">Interesting things</h3>
                  <ul className="ml-1 list-disc">
                    {week.interestingThings.map((entry) => (
                      <EntryListItem key={entry.id} entry={entry} canEdit={session.isAdmin} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntryListItem({
  entry,
  canEdit
}: {
    entry: Awaited<ReturnType<typeof loader>>["entries"][number];
    canEdit: boolean;
  }) {
  
  return (
    <li className="flex items-center">
      <TriangleRightIcon className="h-5 w-5" />
      <span className="group">
        {entry.text}
        {entry.link ? (
          <Badge variant="secondary" className="ml-3"><a href={entry.link} className="hover:underline" target="_blank" rel="noreferrer">{entry.link}</a></Badge>
        ) : null}
        

        {canEdit && (
          <Link
          to={`/entries/${entry.id}/edit`}
          className="ml-2 text-blue-500 opacity-0 group-hover:opacity-100"
        >
          Edit
        </Link>
        )}    
      </span>
    </li>
  );
}
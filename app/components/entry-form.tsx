import { useFetcher } from "@remix-run/react";
import { format } from "date-fns";
import { useEffect, useRef } from "react";
import { Button } from "./ui/button";

export function EntryForm({
  entry,
}: {
  entry?: { text: string; date: string; type: string };
}) {
  let fetcher = useFetcher();
  let textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (
      fetcher.type !== "init" &&
      fetcher.state === "idle" &&
      textareaRef.current
    ) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [fetcher.state, fetcher.type]);

  return (
    <div className="my-8 border p-3">
    <fetcher.Form method="post" className="mt-2">
      <fieldset
        className="disabled:opacity-70"
        disabled={fetcher.state !== "idle"}
      >
        <div>
          <div>
            <input
              type="date"
              name="date"
              required
              className="text-gray-900"
              defaultValue={entry?.date ?? format(new Date(), "yyyy-MM-dd")}
            />
          </div>
          <div className="mt-4 space-x-4">
            {[
                { label: "Work", value: "work" },
                { label: "Learning", value: "learning" },
                { label: "Interesting thing", value: "interesting thing" },
              ].map((option) => (
                <label key={option.value} className="inline-block">
                  <input
                    type="radio"
                    className="mr-1"
                    name="type"
                    value={option.value}
                    defaultChecked={option.value === (entry?.type ?? "work")}
                  />
                  {option.label}
                </label>
              ))}
          </div>
        </div>
        <div className="mt-4">
          <textarea
            ref={textareaRef}
            placeholder="Type your entry..."
            name="text"
            className="w-full text-gray-700"
            required
            defaultValue={entry?.text}
          />
        </div>
        <div className="mt-2 text-right">
          {/* <button
            type="submit"
            className="bg-blue-500 px-4 py-1 font-semibold text-white"
          >
            {fetcher.state !== "idle" ? "Saving..." : "Save"}
            </button> */}
            <Button type="submit">{fetcher.state !== "idle" ? "Saving..." : "Save"}</Button>
        </div>
      </fieldset>
      </fetcher.Form>
      </div>
  );
}
import { useEffect, useRef } from "react";
import { useFetcher } from "@remix-run/react";
import { format } from "date-fns";
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Input } from "./ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "./ui/card";


import { Button } from "./ui/button";

export function EntryForm({
  entry,
}: {
  entry?: { text: string; date: string; type: string, link?: string };
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
    <Card>
      <CardHeader>
        <CardTitle>Add a new entry</CardTitle>
        <CardDescription>
          Add a new entry to your journal.
        </CardDescription> 
      </CardHeader>
    <fetcher.Form method="post" className="p-2">
      <fieldset
        className="disabled:opacity-70"
        disabled={fetcher.state !== "idle"}
        >
        <CardContent>
        <div>
          <div>
            <input
              type="date"
              name="date"
              required
              className="p-1 rounded-md"
              defaultValue={entry?.date ?? format(new Date(), "yyyy-MM-dd")}
            /> 
          </div>
          <div className="mt-4 space-x-4">
              <RadioGroup defaultValue={entry?.type ?? "work"} name="type">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="work" id="work"  />
                <Label htmlFor="work">Work</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="learning" id="learning" />
                <Label htmlFor="learning">Learning</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interesting-thing" id="interesting-thing" />
                <Label htmlFor="interesting-thing">Interesting Thing</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
          <div className="mt-4">
            <Textarea
              ref={textareaRef}
              placeholder="Type your entry..."
              name="text"
              required
              defaultValue={entry?.text}
            />
          </div>
          <div className="my-4">
            <Label className="mb-1" htmlFor="work">Add link to your entry</Label>
            <Input name="link" placeholder="Add link.." defaultValue={entry?.text}/>
            </div>
        </CardContent>
            <CardFooter>
        <div className="mt-2 text-right">
            <Button type="submit">{fetcher.state !== "idle" ? "Saving..." : "Save"}</Button>
              </div>
            </CardFooter>
      </fieldset>
        </fetcher.Form>
      </Card>
  );
}
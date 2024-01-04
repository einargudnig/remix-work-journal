import { Link } from "@remix-run/react";

export function EditListItem(entryId: { entryId: number }) {
  console.log(entryId)
  return (
    <Link to={`/entries/${entryId.entryId}/edit`} className="ml-2 text-blue-500 opacity-0 group-hover:opacity-100">Edit</Link>   
  )
}
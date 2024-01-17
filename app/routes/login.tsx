import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { commitSession, getSession } from "~/session";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export async function action({ request }: ActionFunctionArgs) {
  let formData = await request.formData();
  let { email, password } = Object.fromEntries(formData);

  if (email === "einargudnig@gmail.com" && password === 'p@ssw0rd!23456789dr0wss@p') {
    let session = await getSession();
    session.set("isAdmin", true);

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } else {
   let error;

    if (!email) {
      error = "Email is required.";
    } else if (!password) {
      error = "Password is required.";
    } else {
      error = "Invalid login.";
    }

    return json({ error }, 401);
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  let session = await getSession(request.headers.get("cookie"));

  return session.data;
}

export default function LoginPage() {
  let data = useLoaderData<typeof loader>();
  let actionData = useActionData<typeof action>();

  return (
    <div className="mt-8">
      {data.isAdmin ? (
        <p>You're signed in!</p>
      ) : (
        <Form method="post">
          <Input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="mb-4"
          />
          <Input
            type="password"
            name="password"
            placeholder="Paswword"
            required
            className="mb-4"
          />
    
          <Button>Log in</Button>           
         {actionData?.error && (
            <p className="mt-4 font-medium text-red-500">{actionData.error}</p>
          )}
        </Form>
      )}
    </div>
  );
}
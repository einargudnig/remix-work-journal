import stylesheet from "~/tailwind.css";
import { redirect} from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { destroySession, getSession } from "./session";
import { ThemeProvider } from "./components/theme-provider";
import { DarkModeToggle } from "./components/theme-toggle";
import { Button } from "./components/ui/button";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: "fonts/web/inter.css" },
];

export async function action({ request }: ActionFunctionArgs) {
  let session = await getSession(request.headers.get("cookie"));
  
  destroySession(session);
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  })
}

export async function loader({ request }: LoaderFunctionArgs) {
  let session = await getSession(request.headers.get("cookie"));

  return { session: session.data };
}

export default function App() {
  let { session } = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="p-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl text-white">Work journal</h1>
              <p className="mt-3 text-xl text-gray-400">
                 Doings and learnings. Updated weekly.
              </p>
            </div>
            <div className="flex justify-center items-center space-x-3">
              {session.isAdmin ? (
                <Form method="post">
                  <Button>Logout</Button>
                </Form>
              ) : (
                <Link to="/login">Login</Link>
              )}
              <DarkModeToggle />
            </div>
          </div>
        <Outlet />
        </div>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="en" className="w-full">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body className="flex h-full flex-col items-center justify-center">
        <p className="text-3xl">Whoops!</p>

        {isRouteErrorResponse(error) ? (
          <p>
            {error.status} – {error.statusText}
          </p>
        ) : error instanceof Error ? (
          <p>{error.message}</p>
        ) : (
          <p>Something happened</p>
        )}

        <Scripts />
      </body>
    </html>
  );
}

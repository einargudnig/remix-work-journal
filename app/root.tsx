import stylesheet from "~/tailwind.css";
import { redirect } from "@remix-run/node";
import { BGGrid } from "./components/ui/bg-grid";
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
  // { rel: "stylesheet", href: "fonts/web/inter.css" },
  { rel: "stylesheet", href: "fonts/web/geist.css" },
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
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <body className="antialiased mb-10 lg:mx-auto">
        <BGGrid>
          <main className="container relative mx-auto mt-8 overflow-auto print:p-12">
            <div className="mx-auto w-full max-w-2xl space-y-8 print:space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl">work journal</h1>
                    <p className="mt-3 text-xl">
                      Doings, learnings & interesting things.
                    </p>
                  </div>
                  <div className="flex justify-center items-center space-x-2">
                    {session.isAdmin ? (
                      <Form method="post">
                        <Button>Logout</Button>
                      </Form>
                  ) : (
                      <Button>
                        <Link to="/login">Login</Link>
                      </Button>
                    )}
                    <DarkModeToggle />
                  </div>
                </div>
                <Outlet />
              </div>
          </main>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
          </BGGrid>
          </body>
        </ThemeProvider>
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

import {
  Form,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from '@remix-run/react';
import '@radix-ui/themes/styles.css';
import { Flex, TabNav, Theme } from '@radix-ui/themes';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { getEnv } from './env.server';
import { createClient } from './utils/supabase/server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = await createClient(request);
  const session = (await supabase.auth.getSession()).data.session;
  const isAuthenticated = !!session;
  return json({ ENV: getEnv(), isAuthenticated });
};

const TopNavigation = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <TabNav.Root color="gray" mb="4">
      <Flex direction="row" flexGrow="1" justify="between">
        <Flex direction="row">
          <TabNav.Link href="/" active={path === '/'}>
            Home
          </TabNav.Link>
          {isAuthenticated ? (
            <TabNav.Link href="/albums" active={path === '/albums'}>
              Albums
            </TabNav.Link>
          ) : undefined}
        </Flex>
        {isAuthenticated ? (
          <Form action="/logout" method="post">
            <TabNav.Link asChild>
              <button type="submit">Logout</button>
            </TabNav.Link>
          </Form>
        ) : undefined}
      </Flex>
    </TabNav.Root>
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Theme accentColor="orange" panelBackground="solid">
          <TopNavigation isAuthenticated={data.isAuthenticated} />
          {children}
        </Theme>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

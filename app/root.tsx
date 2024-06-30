import {
  Form,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import {
  Box,
  ChakraProvider,
  Heading,
  Tabs,
  TabList,
  Tab,
  extendTheme,
  withDefaultColorScheme,
  Flex,
  Button,
} from '@chakra-ui/react';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { getEnv } from './env.server';
import { createClient } from './utils/supabase/server';

const theme = extendTheme(withDefaultColorScheme({ colorScheme: 'orange' }));

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = await createClient(request);
  const session = (await supabase.auth.getSession()).data.session;
  const isAuthenticated = !!session;
  return json({ ENV: getEnv(), isAuthenticated });
};

const TopNavigation = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  return (
    <Tabs variant="line" mb={4}>
      <TabList justifyContent="space-between">
        <Flex>
          <Tab>
            <Link to="/">Home</Link>
          </Tab>
          {isAuthenticated ? (
            <Tab>
              <Link to="/albums">Albums</Link>
            </Tab>
          ) : undefined}
        </Flex>
        {isAuthenticated ? (
          <Form action="/logout" method="post">
            <Tab as="div">
              <Button type="submit" size="sm" variant="outline" colorScheme="red">
                Logout
              </Button>
            </Tab>
          </Form>
        ) : undefined}
      </TabList>
    </Tabs>
  );
};

function Document({ children, title = 'Toucan' }: { children: React.ReactNode; title?: string }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <Document>
      <ChakraProvider theme={theme}>
        <TopNavigation isAuthenticated={data.isAuthenticated} />
        <Outlet />
      </ChakraProvider>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
        }}
      />
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="Error!">
      <ChakraProvider>
        <Box>
          <Heading as="h1" bg="blue.500">
            [ErrorBoundary]: There was an error: {error.message}
          </Heading>
        </Box>
      </ChakraProvider>
    </Document>
  );
}

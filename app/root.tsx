import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
  useRouteError,
} from '@remix-run/react';
import {
  ChakraProvider,
  Tabs,
  TabList,
  Tab,
  extendTheme,
  withDefaultColorScheme,
  Flex,
  Button,
  AlertTitle,
  Alert,
  AlertIcon,
  Container,
  Center,
} from '@chakra-ui/react';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { getEnv } from './env.server';
import { createServerClient } from './utils/supabase/server';

const theme = extendTheme(withDefaultColorScheme({ colorScheme: 'orange' }));

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = await createServerClient(request);
  const session = (await supabase.auth.getSession()).data.session;
  const isAuthenticated = !!session;
  return json({ ENV: getEnv(), isAuthenticated });
};

const TopNavigation = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  return (
    <Tabs
      variant="unstyled"
      mb={4}
      p="2"
      size="sm"
      bg="orange.50"
      borderBottom="1px solid"
      borderColor="orange.100"
    >
      <TabList justifyContent="space-between">
        <Flex>
          <NavLink to="/">
            {({ isActive }) => (
              <Tab
                as="div"
                fontWeight={500}
                sx={isActive ? { color: 'white', bg: 'orange.500' } : undefined}
              >
                Home
              </Tab>
            )}
          </NavLink>
          {isAuthenticated ? (
            <NavLink to="/photos">
              {({ isActive }) => (
                <Tab
                  as="div"
                  fontWeight={500}
                  sx={isActive ? { color: 'white', bg: 'orange.400' } : undefined}
                >
                  Photos
                </Tab>
              )}
            </NavLink>
          ) : undefined}
          {isAuthenticated ? (
            <NavLink to="/albums">
              {({ isActive }) => (
                <Tab
                  as="div"
                  fontWeight={500}
                  sx={isActive ? { color: 'white', bg: 'orange.400' } : undefined}
                >
                  Albums
                </Tab>
              )}
            </NavLink>
          ) : undefined}
        </Flex>
        {isAuthenticated ? (
          <Button
            as={Link}
            to="/logout"
            reloadDocument
            size="xs"
            variant="outline"
            colorScheme="red"
            alignSelf="center"
            m={1}
          >
            Logout
          </Button>
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

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <Document title="Error!">
      <ChakraProvider theme={theme}>
        <Container mt="8">
          <Alert status="error">
            <AlertIcon />
            {isRouteErrorResponse(error) ? (
              <>
                <AlertTitle>
                  {error.data?.message ? error.data.message : 'Unknown error'}
                </AlertTitle>
              </>
            ) : (
              <AlertTitle>Unknown error</AlertTitle>
            )}
          </Alert>
          <Center mt="4">
            <Button onClick={() => navigate(-1)}>Go back</Button>
          </Center>
        </Container>
      </ChakraProvider>
    </Document>
  );
}

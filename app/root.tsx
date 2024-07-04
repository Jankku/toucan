import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
  useRouteError,
} from '@remix-run/react';
import {
  ChakraProvider,
  extendTheme,
  withDefaultColorScheme,
  Button,
  AlertTitle,
  Alert,
  AlertIcon,
  Container,
  Center,
  Box,
  Text,
} from '@chakra-ui/react';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { getEnv } from './env.server';
import { createServerClient } from './utils/supabase/server';
import { Appbar } from './components/Appbar';

const theme = extendTheme(withDefaultColorScheme({ colorScheme: 'orange' }));

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = await createServerClient(request);
  const session = (await supabase.auth.getSession()).data.session;
  const isAuthenticated = !!session;
  return json({ ENV: getEnv(), isAuthenticated });
};

function Document({ children, title }: { children: React.ReactNode; title?: string }) {
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
        <ChakraProvider
          theme={theme}
          toastOptions={{ defaultOptions: { position: 'top', duration: 5000, isClosable: true } }}
        >
          {children}
          <ScrollRestoration />
          <Scripts />
        </ChakraProvider>
      </body>
    </html>
  );
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <Document>
      <Appbar isAuthenticated={data.isAuthenticated} />
      <Box as="main" minH="100vh">
        <Outlet />
      </Box>
      <Box as="footer" px={4} py={6} bg="gray.800" color="white">
        <Text>&copy; 2024 Jan-Erik</Text>
      </Box>
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

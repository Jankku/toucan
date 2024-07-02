import type { LinksFunction, MetaFunction } from '@remix-run/node';
import { Flex, Container, Heading, Button, Card, CardBody, Stack, Image } from '@chakra-ui/react';
import { Link } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [{ title: 'Home | Toucan' }, { name: 'description', content: 'Welcome to Toucan' }];
};

export const links: LinksFunction = () => [
  {
    rel: 'prefetch',
    as: 'image',
    href: '/toucan.jpg',
  },
];

export default function Index() {
  return (
    <Container maxW="container.sm">
      <Flex direction="column" gap={8}>
        <Heading as="h1" size="2xl">
          Toucan
        </Heading>
        <Card direction="row" variant="outline" bg="orange.50" borderColor="orange.100">
          <CardBody>
            <Stack gap={6}>
              <Heading as="h2" size="md">
                Get started
              </Heading>
              <Button as={Link} to="/register">
                Register
              </Button>
              <Button as={Link} to="/login">
                Login
              </Button>
            </Stack>
          </CardBody>
          <Image
            src="/toucan.jpg"
            width="250"
            height="250"
            borderRightRadius="md"
            alt="AI generated toucan in a forest"
          />
        </Card>
      </Flex>
    </Container>
  );
}

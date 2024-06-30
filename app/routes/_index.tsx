import type { LinksFunction, MetaFunction } from '@remix-run/node';
import { Flex, Container, Heading, Button, Card, CardBody, Stack } from '@chakra-ui/react';
import { Link } from '@remix-run/react';
import { Image } from '~/components/common/Image';

export const meta: MetaFunction = () => {
  return [{ title: 'Toucan' }, { name: 'description', content: 'Welcome to Toucan' }];
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
    <Container>
      <Flex direction="column" gap={8}>
        <Heading as="h1" size="2xl">
          Toucan
        </Heading>
        <Card direction="row" variant="outline">
          <CardBody>
            <Stack gap={4}>
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
          <Image src="/toucan.jpg" height="250" width="250" alt="AI generated Toucan" />
        </Card>
      </Flex>
    </Container>
  );
}

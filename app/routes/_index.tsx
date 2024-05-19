import type { LinksFunction, MetaFunction } from '@remix-run/node';
import { Flex, Container, Heading, Button, Card, Inset } from '@radix-ui/themes';
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
    <Container size="2" p="4">
      <Flex direction="column" gap="6">
        <Heading size="9">Toucan</Heading>
        <Card style={{ paddingBottom: 0 }}>
          <Flex justify="between">
            <Flex direction="column" gap="4" pr="2" align="start">
              <Heading as="h2" size="7">
                Get started
              </Heading>
              <Flex direction="row" gap="2">
                <Button asChild size="3" variant="surface">
                  <Link to="/register">Register</Link>
                </Button>
                <Button asChild size="3" variant="surface">
                  <Link to="/login">Login</Link>
                </Button>
              </Flex>
            </Flex>
            <Inset pl="current">
              <Image src="/toucan.jpg" height="250" width="250" alt="AI generated Toucan" />
            </Inset>
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}

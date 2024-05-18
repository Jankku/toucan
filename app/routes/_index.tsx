import type { MetaFunction } from '@remix-run/node';
import { Flex, Container, Heading } from '@radix-ui/themes';

export const meta: MetaFunction = () => {
  return [{ title: 'Toucan' }, { name: 'description', content: 'Welcome to Toucan' }];
};

export default function Index() {
  return (
    <Container size="2">
      <Flex direction="column" gap="2">
        <Heading>Toucan</Heading>
      </Flex>
    </Container>
  );
}

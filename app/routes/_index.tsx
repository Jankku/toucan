import type { MetaFunction } from '@remix-run/node';
import { Flex, Button, Container, Heading, TextField } from '@radix-ui/themes';

export const meta: MetaFunction = () => {
  return [{ title: 'Toucan' }, { name: 'description', content: 'Welcome' }];
};

export default function Index() {
  return (
    <Container size="2">
      <Flex direction="column" gap="2">
        <Heading>Hello</Heading>
        <TextField.Root placeholder="Placeholder"></TextField.Root>
        <Button>Submit</Button>
      </Flex>
    </Container>
  );
}

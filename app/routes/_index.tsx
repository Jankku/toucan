import type { LinksFunction, MetaFunction } from '@remix-run/node';
import { Flex, Container, Heading, Button, Card, CardBody, Stack, Image } from '@chakra-ui/react';
import { Link } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Toucan | Your Colorful Image Gallery' },
    {
      name: 'description',
      content:
        'Upload and share your stunning images with Toucan. Enjoy a vibrant, user-friendly gallery where your photos take flight.',
    },
    { name: 'og:title', content: 'Toucan | Your Colorful Image Gallery' },
    {
      name: 'og:description',
      content:
        'Upload and share your stunning images with Toucan. Enjoy a vibrant, user-friendly gallery where your photos take flight.',
    },
    {
      name: 'og:site_name',
      content: 'Toucan',
    },
    {
      name: 'og:url',
      content: 'https://toucan.jankku.fi',
    },
    {
      name: 'og:image',
      content: `https://toucan.jankku.fi/toucan_og.jpg`,
    },
  ];
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

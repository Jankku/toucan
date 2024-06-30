import {
  Button,
  Alert,
  Card,
  Container,
  Flex,
  Heading,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react';
import { ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { createClient } from '~/utils/supabase/server';
import { TextInput } from '~/components/common/TextInput';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));

  const { supabase, headers } = await createClient(request);

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.log('error', error);

    return json({ error: error.message });
  }

  return redirect('/albums', {
    headers: headers,
  });
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const hasActionError = actionData?.error !== undefined;

  return (
    <Container>
      <Heading as="h1" my="4">
        Login
      </Heading>
      <Form method="post">
        <Card variant="surface">
          <Flex gap={4} direction="column">
            <TextInput id="email" name="email" label="Email" type="email" />
            <TextInput id="password" name="password" label="Password" type="password" />
            <Button type="submit">Login</Button>
            {hasActionError && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>{actionData?.error}</AlertTitle>
              </Alert>
            )}
          </Flex>
        </Card>
      </Form>
    </Container>
  );
}

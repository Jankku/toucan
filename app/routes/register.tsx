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
import { createClient } from '~/utils/supabase/client';
import { Form, useActionData } from '@remix-run/react';
import { TextInput } from '~/components/common/TextInput';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));

  const supabase = createClient();

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return json({ error: error.message });
  }

  return redirect('/login');
};

export default function Register() {
  const actionData = useActionData<typeof action>();
  const hasActionError = actionData?.error !== undefined;

  return (
    <Container>
      <Heading as="h1" my="4">
        Register
      </Heading>
      <Form method="post">
        <Card variant="surface">
          <Flex gap={4} direction="column">
            <TextInput id="email" name="email" label="Email" type="email" />
            <TextInput id="password" name="password" label="Password" type="password" />
            <Button type="submit">Register</Button>
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

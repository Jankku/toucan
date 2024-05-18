import { Button, Callout, Card, Container, Flex, Heading } from '@radix-ui/themes';
import { ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { createClient } from '~/utils/supabase/server';
import { Form, useActionData } from '@remix-run/react';
import { TextInput } from '~/components/common/TextInput';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

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
    <Container size="1">
      <Heading my="4">Login</Heading>
      <Form method="post">
        <Card variant="surface">
          <Flex gap="4" direction="column">
            <TextInput id="email" name="email" label="Email" type="email" />
            <TextInput id="password" name="password" label="Password" type="password" />
            <Button type="submit">Login</Button>
            {hasActionError && (
              <Callout.Root role="alert" color="red">
                <Callout.Icon>
                  <ExclamationTriangleIcon />
                </Callout.Icon>
                <Callout.Text>{actionData?.error}</Callout.Text>
              </Callout.Root>
            )}
          </Flex>
        </Card>
      </Form>
    </Container>
  );
}

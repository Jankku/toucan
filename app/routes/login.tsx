import {
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { FormProvider, getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { TextInput } from '~/components/TextInput';
import { createServerClient } from '~/utils/supabase/server';
import { authSchema } from '~/utils/zod-schema';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: authSchema });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { supabase, headers } = await createServerClient(request);

  const { error } = await supabase.auth.signInWithPassword(submission.value);

  if (error) {
    return submission.reply({
      formErrors: ['Failed to login.'],
    });
  }

  return redirect('/albums', {
    headers: headers,
  });
};

export default function Login() {
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(authSchema),
    shouldValidate: 'onBlur',
  });

  const formError = lastResult?.error?.['']?.[0];

  return (
    <Container>
      <Heading as="h1" my="4">
        Login
      </Heading>
      <FormProvider context={form.context}>
        <Form method="post" {...getFormProps(form)}>
          <Card variant="surface">
            <Flex gap={4} direction="column">
              <TextInput name={fields.email.name} label="Email" type="email" />
              <TextInput name={fields.password.name} label="Password" type="password" />
              <Button type="submit">Login</Button>
              {formError ? (
                <Alert status="error">
                  <AlertIcon />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}
            </Flex>
          </Card>
        </Form>
      </FormProvider>
    </Container>
  );
}

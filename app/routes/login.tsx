import {
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Alert,
  AlertIcon,
  AlertDescription,
  Text,
  CardBody,
} from '@chakra-ui/react';
import { FormProvider, getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { Link } from '~/components/Link';
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
  const navigation = useNavigation();
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(authSchema),
    shouldValidate: 'onBlur',
  });

  const isSubmitting = navigation.state === 'submitting';
  const formError = lastResult?.error?.['']?.[0];

  return (
    <Container py={8}>
      <Heading as="h1" my="4">
        Login
      </Heading>
      <FormProvider context={form.context}>
        <Form method="post" {...getFormProps(form)}>
          <Card variant="outline">
            <CardBody>
              <Flex gap={4} direction="column">
                <TextInput name={fields.email.name} label="Email" type="email" />
                <TextInput name={fields.password.name} label="Password" type="password" />
                <Button type="submit" isLoading={isSubmitting}>
                  Login
                </Button>
                {formError ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                ) : null}
                <Text>
                  If you don&apos;t have an account, <Link to="/register">register</Link>.
                </Text>
              </Flex>
            </CardBody>
          </Card>
        </Form>
      </FormProvider>
    </Container>
  );
}

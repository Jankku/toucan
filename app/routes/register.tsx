import {
  Button,
  Alert,
  Card,
  Container,
  Flex,
  Heading,
  AlertIcon,
  AlertDescription,
  Text,
  CardBody,
} from '@chakra-ui/react';
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { createClient } from '~/utils/supabase/client';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { authSchema } from '~/utils/zod-schema';
import { FormProvider, getFormProps, useForm } from '@conform-to/react';
import { TextInput } from '~/components/TextInput';
import { Link } from '~/components/Link';
import { createServerClient } from '~/utils/supabase/server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = await createServerClient(request);
  const session = (await supabase.auth.getSession()).data.session;
  if (session) {
    return redirect('/photos');
  }
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: authSchema });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signUp(submission.value);

  if (error) {
    return submission.reply({
      formErrors: ['Failed to register.'],
    });
  }

  return redirect('/login');
};

export default function Register() {
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
        Register
      </Heading>
      <FormProvider context={form.context}>
        <Form method="post" {...getFormProps(form)}>
          <Card variant="outline">
            <CardBody>
              <Flex gap={4} direction="column">
                <TextInput name={fields.email.name} label="Email" type="email" />
                <TextInput name={fields.password.name} label="Password" type="password" />
                <Button type="submit" isLoading={isSubmitting}>
                  Register
                </Button>
                {formError ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                ) : null}
                <Text>
                  If you already have an account, <Link to="/login">login</Link>.
                </Text>
              </Flex>
            </CardBody>
          </Card>
        </Form>
      </FormProvider>
    </Container>
  );
}

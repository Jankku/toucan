import { Box, Text, TextField as RTextField } from '@radix-ui/themes';

type TextFieldProps = RTextField.RootProps & {
  label: string;
};

export function TextInput(props: TextFieldProps) {
  const { id, label, ...rest } = props;
  return (
    <Box>
      <Text as="label" htmlFor={id}>
        {label}
      </Text>
      <RTextField.Root {...rest} id={id}></RTextField.Root>
    </Box>
  );
}

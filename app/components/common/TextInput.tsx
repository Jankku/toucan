import { Box, Text, Input, InputProps } from '@chakra-ui/react';

type TextFieldProps = InputProps & {
  label: string;
};

export function TextInput(props: TextFieldProps) {
  const { id, label, ...rest } = props;
  return (
    <Box>
      <Text as="label" fontSize="sm" fontWeight={500} htmlFor={id}>
        {label}
      </Text>
      <Input {...rest} id={id}></Input>
    </Box>
  );
}

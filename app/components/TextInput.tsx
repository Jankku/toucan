import { FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import { type FieldName, getInputProps, useField } from '@conform-to/react';

type TextInputProps = {
  name: FieldName<string>;
  label: string;
  type?: 'text' | 'email' | 'password';
};

export function TextInput({ name, label, type = 'text' }: TextInputProps) {
  const [meta] = useField(name);
  const { key, ...rest } = getInputProps(meta, { type });
  return (
    <FormControl isInvalid={!!meta.errors}>
      <FormLabel htmlFor={meta.id}>{label}</FormLabel>
      <Input key={key} {...rest} />
      <FormErrorMessage id={meta.errorId}>{meta.errors}</FormErrorMessage>
    </FormControl>
  );
}

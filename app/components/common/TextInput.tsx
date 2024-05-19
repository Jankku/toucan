import * as Label from '@radix-ui/react-label';
import { Box, TextField as RTextField } from '@radix-ui/themes';

type TextFieldProps = RTextField.RootProps & {
  label: string;
};

export function TextInput(props: TextFieldProps) {
  const { id, label, ...rest } = props;
  return (
    <Box>
      <Label.Root htmlFor={id}>{label}</Label.Root>
      <RTextField.Root {...rest} id={id}></RTextField.Root>
    </Box>
  );
}

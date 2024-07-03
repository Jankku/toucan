import { Link as CharkaLink } from '@chakra-ui/react';
import { LinkProps, Link as RemixLink } from '@remix-run/react';

interface Props extends LinkProps {}

export function Link({ children, ...rest }: Props) {
  return (
    <CharkaLink as={RemixLink} {...rest} textDecoration="underline">
      {children}
    </CharkaLink>
  );
}

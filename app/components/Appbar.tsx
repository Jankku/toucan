import { Button, Flex, Tab, TabList, Tabs } from '@chakra-ui/react';
import { Link, NavLink } from '@remix-run/react';

type AppbarProps = {
  isAuthenticated: boolean;
};

export function Appbar({ isAuthenticated }: AppbarProps) {
  return (
    <Tabs variant="unstyled" p={4} size="md" shadow="md">
      <TabList justifyContent="space-between">
        <Flex gap={2}>
          <NavTab to="/">Home</NavTab>
          {isAuthenticated ? <NavTab to="/photos">Photos</NavTab> : undefined}
          {isAuthenticated ? <NavTab to="/albums">Albums</NavTab> : undefined}
        </Flex>
        {isAuthenticated ? (
          <Button
            reloadDocument
            as={Link}
            to="/logout"
            size="md"
            variant="outline"
            colorScheme="red"
            alignSelf="center"
          >
            Logout
          </Button>
        ) : undefined}
      </TabList>
    </Tabs>
  );
}

type NavTabProps = {
  to: string;
  children: React.ReactNode;
};

function NavTab({ to, children }: NavTabProps) {
  return (
    <NavLink to={to}>
      {({ isActive, isPending }) => (
        <Tab
          as="div"
          fontWeight={500}
          borderRadius="md"
          sx={
            isPending
              ? { color: 'black', bg: 'gray.200' }
              : isActive
                ? { color: 'white', bg: 'orange.500' }
                : undefined
          }
        >
          {children}
        </Tab>
      )}
    </NavLink>
  );
}

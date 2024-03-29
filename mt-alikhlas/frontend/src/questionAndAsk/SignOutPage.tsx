import React, { FC } from 'react';
import { Page } from './Page';
import { StatusText } from './Styles';
import { useAuth } from './Auth';

type SignoutAction = 'signout' | 'signout-callback';
interface Props {
   action: SignoutAction;
}
export const SignOutPage: FC<Props> = ({ action }) => {
   let message = 'Signing out ...';
   const { signOut } = useAuth();
   switch (action) {
      case 'signout':
         signOut();
         break;
      case 'signout-callback':
         message = `You successfully signed out!
         Click Back for direct to Main Page`;
         break;
   }
   return (
      <Page title="Sign out">
         <StatusText>{message}</StatusText>
      </Page>
   );
};

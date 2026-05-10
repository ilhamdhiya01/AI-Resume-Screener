import Layout from './AuthLayout';
import AuthMessage from './AuthMessage';
import Header from './Header';

export const Auth = Object.assign(Layout, {
  Message: AuthMessage,
  Header,
});

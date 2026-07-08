import { Auth } from '@/components/features/auth';

const LoginPage = () => {
  return (
    <Auth.Layout>
      <Auth.Login />
    </Auth.Layout>
  );
};

export default LoginPage;

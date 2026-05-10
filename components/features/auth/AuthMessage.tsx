import classNames from 'classnames';

import Icon from '@/components/ui/icon';

interface AuthMessageProps {
  error?: string | null;
  success?: string | null;
}

const AuthMessage = ({ error, success }: AuthMessageProps) => {
  const messageStyle = classNames(
    'relative mt-4 rounded-lg border py-2.5 pr-2.5 pl-10 ',
    {
      'border-green-300 bg-green-100 text-green-500': success,
      'border-red-300 bg-red-100 text-red-500': error,
    }
  );
  if (!error && !success) return null;

  return (
    <div className={messageStyle}>
      <Icon
        icon={error ? 'TbAlertCircle' : 'TbCheck'}
        className="absolute top-3 left-3 shrink-0"
        size={20}
      />
      <p>{error || success}</p>
    </div>
  );
};

export default AuthMessage;

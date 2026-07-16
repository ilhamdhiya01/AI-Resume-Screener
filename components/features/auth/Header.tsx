import Image from 'next/image';

interface HeaderProps {
  title: string;
  subtitle: string;
}

const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <div className="flex flex-col gap-3 text-center">
      <div className="mx-auto inline-flex items-center gap-2">
        <Image
          src="/icons/Logo.svg"
          alt="Logo"
          width={27}
          height={27}
          unoptimized
        />
        <h1 className="text-primary-700 text-2xl font-bold">Indigo Insight</h1>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-center text-3xl font-bold">{title}</h2>
        <p className="text-neutral-700">{subtitle}</p>
      </div>
    </div>
  );
};

export default Header;

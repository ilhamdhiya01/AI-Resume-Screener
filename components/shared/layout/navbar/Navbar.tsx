import Icon from '@/components/ui/icon';

interface NavbarProps {
  isMenuOpen?: boolean;
  onMenuToggle?: () => void;
}

const Navbar = ({ isMenuOpen, onMenuToggle }: NavbarProps) => {
  return (
    <header className="flex h-16 shrink-0 items-center border-b border-slate-300 bg-[#f7fafc] px-4">
      <div className="mx-auto flex w-full items-center justify-between">
        <button
          type="button"
          onClick={onMenuToggle}
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-200 focus:ring-2 focus:ring-slate-300 focus:outline-none lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <Icon icon="TbMenu2" size={24} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;

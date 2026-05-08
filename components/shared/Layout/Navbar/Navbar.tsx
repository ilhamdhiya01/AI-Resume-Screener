const Navbar = () => {
  return (
    <header className="bg-white/80 px-4 py-5 shadow-[0_4px_2px_-2px_rgba(0,0,0,0.1)]">
      <div className="mx-auto flex items-center justify-between">
        {/* Branding Area */}
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          AI Resume Screener
        </h1>

        {/* Navigation Area - Kosongkan dulu kalau belum ada menu, tapi siapkan tempatnya */}
        <nav aria-label="Main Navigation">
          <ul className="flex items-center gap-6">
            {/* Contoh link jika nanti ada */}
            {/* <li><a href="/dashboard" className="text-sm font-medium hover:text-blue-600">Dashboard</a></li> */}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

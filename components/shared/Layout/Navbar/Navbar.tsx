const Navbar = () => {
  return (
    <header className="h-16 border-b border-slate-300 bg-white/30 px-4">
      <div className="mx-auto flex items-center justify-between">
        {/* Branding Area */}
        {/* <h1 className="text-xl font-bold tracking-tight text-slate-900">
          AI Resume Screener
        </h1> */}

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

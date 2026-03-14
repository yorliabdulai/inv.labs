const fs = require('fs');

let content = fs.readFileSync('src/components/dashboard/Sidebar.tsx', 'utf8');

const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C05E42] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121417]";

// Update NavItem Link
content = content.replace(
    /className=\{\`group flex items-center gap-3 px-3 py-2\.5 rounded-xl text-sm font-semibold transition-all duration-150 min-h-\[40px\] \$\{active/,
    `className={\`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 min-h-[40px] ${focusClasses} \${active`
);

// Update Mobile Menu Button
content = content.replace(
    /className="md:hidden fixed top-3 left-4 z-50 w-9 h-9 bg-\[#1A1D21\] rounded-xl border border-white\/\[0\.08\] flex items-center justify-center hover:bg-white\/\[0\.08\] transition-all touch-manipulation active:scale-95"/g,
    `className="md:hidden fixed top-3 left-4 z-50 w-9 h-9 bg-[#1A1D21] rounded-xl border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition-all touch-manipulation active:scale-95 ${focusClasses}"`
);

// Update Desktop Profile Link
content = content.replace(
    /<Link href="\/dashboard\/profile" className="flex items-center gap-3 px-3 py-2\.5 rounded-xl hover:bg-white\/\[0\.05\] transition-colors mb-1">/g,
    `<Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors mb-1 ${focusClasses}">`
);

// Update Desktop/Mobile Sign Out Button
content = content.replace(
    /className="flex items-center gap-2 w-full px-3 py-2\.5 text-sm font-semibold text-zinc-600 hover:text-red-400 hover:bg-red-500\/5 rounded-xl transition-all"/g,
    `className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-zinc-600 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all ${focusClasses}"`
);

// Update Mobile Header Close Button
content = content.replace(
    /className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white\/\[0\.08\] transition-colors touch-manipulation active:scale-95"/g,
    `className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/[0.08] transition-colors touch-manipulation active:scale-95 ${focusClasses}"`
);

// Update Mobile Profile Link
content = content.replace(
    /<Link href="\/dashboard\/profile" onClick=\{\(\) => setIsMobileOpen\(false\)\} className="flex items-center gap-3 px-3 py-2\.5 rounded-xl hover:bg-white\/\[0\.05\] transition-colors mb-1">/g,
    `<Link href="/dashboard/profile" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors mb-1 ${focusClasses}">`
);

fs.writeFileSync('src/components/dashboard/Sidebar.tsx', content);

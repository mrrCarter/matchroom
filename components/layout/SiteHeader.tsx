import Link from "next/link";

const NAV = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Demo", href: "/demo" },
  { label: "Ask an AI", href: "#ask-ai" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-green/15 text-green ring-1 ring-green/30">
            <DiamondMark />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Match<span className="text-green">Room</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-muted transition-colors hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/demo"
          className="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-bg transition-transform hover:scale-[1.03]"
        >
          Open Demo
        </Link>
      </div>
    </header>
  );
}

function DiamondMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M7 1l6 6-6 6-6-6 6-6z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

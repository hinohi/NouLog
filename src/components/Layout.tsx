import type { ReactNode } from "react";

const NAV_ITEMS = [
  { path: "/", label: "Home" },
  { path: "/pvt", label: "PVT" },
  { path: "/ospan", label: "OSPAN" },
  { path: "/dashboard", label: "Dashboard" },
] as const;

export function Layout({
  children,
  currentRoute,
}: {
  children: ReactNode;
  currentRoute: string;
}) {
  return (
    <div className="layout">
      <nav className="nav">
        <a href="#/" className="nav-brand">
          NouLog
        </a>
        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.path}
              href={`#${item.path}`}
              className={`nav-link ${currentRoute === item.path ? "active" : ""}`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
      <main className="main">{children}</main>
    </div>
  );
}

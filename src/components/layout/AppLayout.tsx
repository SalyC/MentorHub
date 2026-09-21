import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { DevDebugPanel } from "../Layout";

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        mobileNavOpen={mobileNavOpen}
        onToggleMobileNav={() => setMobileNavOpen((open) => !open)}
      />
      <MobileNav open={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />

      <main className="container flex-1 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-line py-6">
        <div className="container text-sm text-ink-faint">
          MentorHub — платформа наставничества
        </div>
      </footer>

      <DevDebugPanel />
    </div>
  );
}

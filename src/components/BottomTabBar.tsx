'use client';

// src/components/BottomTabBar.tsx
// Mobile bottom tab navigation. Designed as the shell for the future
// full Tindie mobile app:
//   Phase 1 (now):   News (资讯)        -> active
//   Phase 2 (later): Orders (订单)      -> reads tindie.com API, currently stub
//   Phase 3 (later): Profile (我的)     -> account + future Stripe payment, stub
//
// To add a real tab later: flip `enabled: true` and point `href` at the route.

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Tab = {
  key: string;
  label: string;
  href: string;
  enabled: boolean;
  icon: (active: boolean) => JSX.Element;
};

const TEAL = '#22b8c4';
const MUTED = '#8a9099';

const TABS: Tab[] = [
  {
    key: 'news',
    label: 'News',
    href: '/',
    enabled: true,
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? TEAL : MUTED} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
      </svg>
    ),
  },
  {
    key: 'orders',
    label: 'Orders',
    href: '#',
    enabled: false,
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? TEAL : MUTED} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Profile',
    href: '#',
    enabled: false,
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? TEAL : MUTED} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  // Hide the tab bar on admin/login — those aren't part of the app shell.
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null;
  }

  return (
    <nav
      aria-label="Primary"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'saturate(180%) blur(12px)',
        WebkitBackdropFilter: 'saturate(180%) blur(12px)',
        borderTop: '1px solid #e6e8eb',
        // Respect the iPhone home-indicator safe area.
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map((tab) => {
        const active =
          tab.enabled &&
          (tab.href === '/'
            ? pathname === '/'
            : pathname?.startsWith(tab.href));

        const inner = (
          <span
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              minHeight: 56,
              padding: '8px 0 6px',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.2,
              color: active ? TEAL : MUTED,
              opacity: tab.enabled ? 1 : 0.45,
              cursor: tab.enabled ? 'pointer' : 'default',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {tab.icon(!!active)}
            {tab.label}
            {!tab.enabled && (
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  fontSize: 8,
                  fontWeight: 700,
                  color: '#fff',
                  background: MUTED,
                  borderRadius: 6,
                  padding: '1px 5px',
                  transform: 'translateX(20px)',
                }}
              >
                SOON
              </span>
            )}
          </span>
        );

        if (!tab.enabled) {
          return (
            <div
              key={tab.key}
              role="button"
              aria-disabled="true"
              style={{ flex: 1, position: 'relative' }}
            >
              {inner}
            </div>
          );
        }

        return (
          <Link
            key={tab.key}
            href={tab.href}
            style={{ flex: 1, position: 'relative', textDecoration: 'none' }}
          >
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}

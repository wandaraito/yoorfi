import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import {
  IconHome, IconSearch, IconBag, IconChat, IconUser,
} from '@/components/AfricanIcons';

export function BottomNav() {
  const location = useLocation();
  const { profile } = useAuth();
  const isTailor = profile?.role === 'tailor';
  const isAdmin = profile?.role === 'admin';

  if (isAdmin) return null;

  const items = isTailor
    ? [
        { to: '/tailor-dashboard', label: 'Orders', Icon: IconBag },
        { to: '/tailor-dashboard/portfolio', label: 'Portfolio', Icon: IconHome },
        { to: '/tailor-dashboard/products', label: 'Products', Icon: IconSearch },
        { to: '/messages', label: 'Messages', Icon: IconChat },
        { to: '/tailor-dashboard/profile', label: 'Profile', Icon: IconUser },
      ]
    : [
        { to: '/', label: 'Home', Icon: IconHome },
        { to: '/discover', label: 'Discover', Icon: IconSearch },
        { to: '/orders', label: 'Orders', Icon: IconBag },
        { to: '/messages', label: 'Messages', Icon: IconChat },
        { to: '/profile', label: 'Profile', Icon: IconUser },
      ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 backdrop-blur-md border-t border-ink-100 z-50">
      <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const active = location.pathname === item.to ||
            (item.to !== '/' && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition ${
                  active || isActive ? 'text-ink-900' : 'text-ink-400'
                }`
              }
            >
              <item.Icon size={22} className={active ? '' : 'opacity-70'} />
              <span className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

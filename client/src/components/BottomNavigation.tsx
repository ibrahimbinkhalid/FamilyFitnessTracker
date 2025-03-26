import { useLocation, Link } from 'wouter';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems: NavItem[] = [
    { path: '/', icon: 'home', label: 'Home' },
    { path: '/goals', icon: 'emoji_events', label: 'Goals' },
    { path: '/calendar', icon: 'calendar_today', label: 'Calendar' },
    { path: '/settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <footer className="bg-white border-t border-neutral-200 py-2 px-6 sticky bottom-0">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link href={item.path} key={item.path}>
              <div className="flex flex-col items-center cursor-pointer">
                <span className={`material-icons ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                  {item.icon}
                </span>
                <span className={`text-xs ${isActive ? 'text-primary font-medium' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}

import { useLocation, Link } from 'wouter';

interface TabItem {
  path: string;
  icon: string;
  label: string;
}

export default function TabNavigation() {
  const [location] = useLocation();

  const tabs: TabItem[] = [
    { path: '/fitness', icon: 'fitness_center', label: 'Fitness' },
    { path: '/schedule', icon: 'schedule', label: 'Schedule' },
    { path: '/progress', icon: 'insights', label: 'Progress' },
    { path: '/family', icon: 'group', label: 'Family' },
  ];

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-10">
      <div className="flex justify-between">
        {tabs.map((tab) => {
          const isActive = location === tab.path;
          return (
            <Link href={tab.path} key={tab.path}>
              <button
                className={`flex-1 py-4 flex flex-col items-center text-xs font-medium ${
                  isActive
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-neutral-800'
                }`}
              >
                <span className="material-icons mb-1">{tab.icon}</span>
                {tab.label}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

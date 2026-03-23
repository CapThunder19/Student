'use client';

import {
  BookOpen,
  Users,
  BarChart3,
  MessageCircle,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Home,
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
} from 'lucide-react';

interface IconShowcaseProps {
  showTitle?: boolean;
}

export default function IconShowcase({ showTitle = true }: IconShowcaseProps) {
  const icons = [
    { name: 'BookOpen', Icon: BookOpen },
    { name: 'Users', Icon: Users },
    { name: 'BarChart3', Icon: BarChart3 },
    { name: 'MessageCircle', Icon: MessageCircle },
    { name: 'FileText', Icon: FileText },
    { name: 'Clock', Icon: Clock },
    { name: 'AlertCircle', Icon: AlertCircle },
    { name: 'CheckCircle', Icon: CheckCircle },
    { name: 'Home', Icon: Home },
    { name: 'Settings', Icon: Settings },
    { name: 'LogOut', Icon: LogOut },
    { name: 'Bell', Icon: Bell },
  ];

  return (
    <div>
      {showTitle && <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Lucide Icons</h3>}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {icons.map(({ name, Icon }) => (
          <div
            key={name}
            className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

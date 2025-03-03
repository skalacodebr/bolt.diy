import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Switch } from '~/components/ui/Switch';
import { classNames } from '~/utils/classNames';

interface DatabaseSettings {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  enabled: boolean;
}

export default function DatabaseTab() {
  const [settings, setSettings] = useState<DatabaseSettings>(() => {
    const saved = localStorage.getItem('bolt_database_settings');
    return saved
      ? JSON.parse(saved)
      : {
          host: 'localhost',
          port: 3306,
          user: 'root',
          password: '',
          database: 'bolt',
          enabled: false,
        };
  });

  // Save settings automatically when they change
  useEffect(() => {
    try {
      localStorage.setItem('bolt_database_settings', JSON.stringify(settings));
      toast.success('Database settings updated');
    } catch (error) {
      console.error('Error saving database settings:', error);
      toast.error('Failed to update database settings');
    }
  }, [settings]);

  return (
    <div className="space-y-4">
      <motion.div
        className="bg-white dark:bg-[#0A0A0A] rounded-lg shadow-sm dark:shadow-none p-4 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="i-ph:database-fill w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-bolt-elements-textPrimary">MySQL Connection</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-bolt-elements-textPrimary">Enable MySQL Connection</span>
            <p className="text-xs text-bolt-elements-textSecondary">Connect to MySQL database server</p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => {
              setSettings((prev) => ({ ...prev, enabled: checked }));
            }}
          />
        </div>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm text-bolt-elements-textSecondary mb-2">Host</label>
            <input
              type="text"
              value={settings.host}
              onChange={(e) => setSettings((prev) => ({ ...prev, host: e.target.value }))}
              className={classNames(
                'w-full px-3 py-2 rounded-lg text-sm',
                'bg-[#FAFAFA] dark:bg-[#0A0A0A]',
                'border border-[#E5E5E5] dark:border-[#1A1A1A]',
                'text-bolt-elements-textPrimary',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/30',
                'transition-all duration-200',
              )}
            />
          </div>

          <div>
            <label className="block text-sm text-bolt-elements-textSecondary mb-2">Port</label>
            <input
              type="number"
              value={settings.port}
              onChange={(e) => setSettings((prev) => ({ ...prev, port: parseInt(e.target.value) || 3306 }))}
              className={classNames(
                'w-full px-3 py-2 rounded-lg text-sm',
                'bg-[#FAFAFA] dark:bg-[#0A0A0A]',
                'border border-[#E5E5E5] dark:border-[#1A1A1A]',
                'text-bolt-elements-textPrimary',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/30',
                'transition-all duration-200',
              )}
            />
          </div>

          <div>
            <label className="block text-sm text-bolt-elements-textSecondary mb-2">Database Name</label>
            <input
              type="text"
              value={settings.database}
              onChange={(e) => setSettings((prev) => ({ ...prev, database: e.target.value }))}
              className={classNames(
                'w-full px-3 py-2 rounded-lg text-sm',
                'bg-[#FAFAFA] dark:bg-[#0A0A0A]',
                'border border-[#E5E5E5] dark:border-[#1A1A1A]',
                'text-bolt-elements-textPrimary',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/30',
                'transition-all duration-200',
              )}
            />
          </div>

          <div>
            <label className="block text-sm text-bolt-elements-textSecondary mb-2">Username</label>
            <input
              type="text"
              value={settings.user}
              onChange={(e) => setSettings((prev) => ({ ...prev, user: e.target.value }))}
              className={classNames(
                'w-full px-3 py-2 rounded-lg text-sm',
                'bg-[#FAFAFA] dark:bg-[#0A0A0A]',
                'border border-[#E5E5E5] dark:border-[#1A1A1A]',
                'text-bolt-elements-textPrimary',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/30',
                'transition-all duration-200',
              )}
            />
          </div>

          <div>
            <label className="block text-sm text-bolt-elements-textSecondary mb-2">Password</label>
            <input
              type="password"
              value={settings.password}
              onChange={(e) => setSettings((prev) => ({ ...prev, password: e.target.value }))}
              className={classNames(
                'w-full px-3 py-2 rounded-lg text-sm',
                'bg-[#FAFAFA] dark:bg-[#0A0A0A]',
                'border border-[#E5E5E5] dark:border-[#1A1A1A]',
                'text-bolt-elements-textPrimary',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/30',
                'transition-all duration-200',
              )}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
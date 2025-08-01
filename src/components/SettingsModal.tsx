import React from 'react'
import { X, Moon, Sun, Bell, Eye, Palette, User, Shield, HelpCircle } from 'lucide-react'
import { useSettings } from '../contexts/SettingsContext'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings()

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    updateSettings({ theme })
  }

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Appearance */}
          <div>
            <div className="flex items-center mb-6">
              <Palette className="h-5 w-5 mr-3 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'auto', label: 'Auto', icon: Eye }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleThemeChange(option.value as 'light' | 'dark' | 'auto')}
                      className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
                        settings.theme === option.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <option.icon className="h-4 w-4 mr-2" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Font Size
                </label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <div className="flex items-center mb-6">
              <Bell className="h-5 w-5 mr-3 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Notifications</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Receive reminders for deadlines and study sessions</p>
                </div>
                <button
                  onClick={() => handleSettingChange('notifications', !settings.notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
                    settings.notifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sound Effects</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Play sounds for notifications and interactions</p>
                </div>
                <button
                  onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
                    settings.soundEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div>
            <div className="flex items-center mb-6">
              <Shield className="h-5 w-5 mr-3 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data & Privacy</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Save</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Automatically save your progress</p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
                    settings.autoSave ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <div>
            <div className="flex items-center mb-4">
              <HelpCircle className="h-5 w-5 mr-2 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Help & Support</h3>
            </div>
            
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Help Center</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Find answers to common questions</div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Support</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Get help from our team</div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Privacy Policy</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Learn about data protection</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            StudyHive v1.0.0
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal 
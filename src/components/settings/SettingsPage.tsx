import React, { useState, useEffect } from 'react';
import { Settings, Bell, Shield, Globe, Clock, Save, RotateCcw, Layout, Monitor, Cloud, MapPin, DollarSign, Fingerprint } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../contexts/AppContext';
import { TIME_INPUT_TYPES, TimeInputType, SCHEDULE_LAYOUT_TYPES, ScheduleLayoutType } from '../../types';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useAppContext();
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      setHasChanges(false);
      toast.success(i18n.language === 'fr' ? 'Paramètres sauvegardés avec succès' : 'Settings saved successfully');
    } catch (error) {
      toast.error(i18n.language === 'fr' ? 'Échec de la sauvegarde des paramètres' : 'Failed to save settings');
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
    toast.success(i18n.language === 'fr' ? 'Paramètres réinitialisés' : 'Settings reset successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">{i18n.language === 'fr' ? 'Paramètres' : 'Settings'}</h1>
              </div>
              <div className="flex items-center space-x-3">
                {hasChanges && (
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>{i18n.language === 'fr' ? 'Réinitialiser' : 'Reset'}</span>
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>{i18n.language === 'fr' ? 'Enregistrer' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Paramètres Généraux */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">{i18n.language === 'fr' ? 'Général' : 'General'}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === 'fr' ? 'Langue' : 'Language'}
                  </label>
                  <select
                    value={localSettings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en">{i18n.language === 'fr' ? 'Anglais' : 'English'}</option>
                    <option value="fr">{i18n.language === 'fr' ? 'Français' : 'French'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === 'fr' ? 'Fuseau Horaire' : 'Timezone'}
                  </label>
                  <select
                    value={localSettings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="America/Los_Angeles">America/Los_Angeles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === 'fr' ? 'Devise' : 'Currency'}
                  </label>
                  <select
                    value={localSettings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="EUR">{i18n.language === 'fr' ? 'EUR (€)' : 'EUR (€)'}</option>
                    <option value="USD">{i18n.language === 'fr' ? 'USD ($)' : 'USD ($)'}</option>
                    <option value="GBP">{i18n.language === 'fr' ? 'GBP (£)' : 'GBP (£)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === 'fr' ? 'Format de Date' : 'Date Format'}
                  </label>
                  <select
                    value={localSettings.dateFormat}
                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Paramètres du Planning */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">{i18n.language === 'fr' ? 'Planning' : 'Schedule'}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === 'fr' ? 'Méthode de Saisie d\'Heure' : 'Time Input Method'}
                  </label>
                  <select
                    value={localSettings.timeInputType}
                    onChange={(e) => handleSettingChange('timeInputType', e.target.value as TimeInputType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(TIME_INPUT_TYPES).map(([type, config]) => (
                      <option key={type} value={type}>
                        {i18n.language === 'fr' ? config.labelFr : config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === 'fr' ? 'Type de Mise en Page' : 'Layout Type'}
                  </label>
                  <select
                    value={localSettings.scheduleLayoutType}
                    onChange={(e) => handleSettingChange('scheduleLayoutType', e.target.value as ScheduleLayoutType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(SCHEDULE_LAYOUT_TYPES).map(([layout, config]) => (
                      <option key={layout} value={layout}>
                        {i18n.language === 'fr' ? config.labelFr : config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === 'fr' ? 'Début de la Semaine' : 'Week Starts On'}
                  </label>
                  <select
                    value={localSettings.weekStartsOn}
                    onChange={(e) => handleSettingChange('weekStartsOn', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>{i18n.language === 'fr' ? 'Dimanche' : 'Sunday'}</option>
                    <option value={1}>{i18n.language === 'fr' ? 'Lundi' : 'Monday'}</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoSave"
                    checked={localSettings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoSave" className="ml-2 block text-sm text-gray-700">
                    {i18n.language === 'fr' ? 'Sauvegarde Automatique' : 'Auto-Save'}
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="payBreakTimes"
                    checked={localSettings.payBreakTimes}
                    onChange={(e) => handleSettingChange('payBreakTimes', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="payBreakTimes" className="ml-2 block text-sm text-gray-700">
                    {i18n.language === 'fr' ? 'Rémunérer les Temps de Pause' : 'Pay Break Times'}
                  </label>
                </div>
              </div>
              
              {/* Break Payment Info Box */}
              <div className="pl-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  {i18n.language === 'fr' ? 'Gestion des Temps de Pause' : 'Break Time Management'}
                </h3>
                <p className="text-sm text-blue-700">
                  {i18n.language === 'fr' 
                    ? 'Le paramètre "Rémunérer les temps de pause" détermine si les pauses sont incluses dans le calcul des heures travaillées. Activé par défaut selon les pratiques courantes de l\'industrie de la restauration où l\'employé reste à disposition.'
                    : 'The "Pay Break Times" setting determines whether breaks are included in worked hours calculations. Enabled by default according to common restaurant industry practices where the employee remains available.'}
                </p>
              </div>
            </div>

            {/* Paramètres de Notification */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">{i18n.language === 'fr' ? 'Notifications' : 'Notifications'}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-8">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={localSettings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                    {i18n.language === 'fr' ? 'Notifications par Email' : 'Email Notifications'}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    checked={localSettings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-700">
                    {i18n.language === 'fr' ? 'Notifications Push' : 'Push Notifications'}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="contractExpiryAlerts"
                    checked={localSettings.contractExpiryAlerts}
                    onChange={(e) => handleSettingChange('contractExpiryAlerts', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="contractExpiryAlerts" className="ml-2 block text-sm text-gray-700">
                    {i18n.language === 'fr' ? 'Alertes de Fin de Contrat' : 'Contract Expiry Alerts'}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="scheduleChangeAlerts"
                    checked={localSettings.scheduleChangeAlerts}
                    onChange={(e) => handleSettingChange('scheduleChangeAlerts', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="scheduleChangeAlerts" className="ml-2 block text-sm text-gray-700">
                    {i18n.language === 'fr' ? 'Alertes de Modification du Planning' : 'Schedule Change Alerts'}
                  </label>
                </div>
              </div>
            </div>

            {/* Paramètres d'Affichage */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Layout className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">{i18n.language === 'fr' ? 'Affichage' : 'Display'}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === 'fr' ? 'Thème' : 'Theme'}
                  </label>
                  <select
                    value={localSettings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">{i18n.language === 'fr' ? 'Thème Clair' : 'Light Theme'}</option>
                    <option value="dark">{i18n.language === 'fr' ? 'Thème Sombre' : 'Dark Theme'}</option>
                    <option value="auto">{i18n.language === 'fr' ? 'Automatique (Système)' : 'Auto (System)'}</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="compactView"
                    checked={localSettings.compactView}
                    onChange={(e) => handleSettingChange('compactView', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="compactView" className="ml-2 block text-sm text-gray-700">
                    {i18n.language === 'fr' ? 'Mode Compact' : 'Compact View'}
                  </label>
                </div>
              </div>
            </div>

            {/* Paramètres de Sécurité */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">{i18n.language === 'fr' ? 'Sécurité' : 'Security'}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === 'fr' ? 'Délai d\'Expiration de Session' : 'Session Timeout'}
                  </label>
                  <select
                    value={localSettings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={30}>30 {i18n.language === 'fr' ? 'minutes' : 'minutes'}</option>
                    <option value={60}>1 {i18n.language === 'fr' ? 'heure' : 'hour'}</option>
                    <option value={120}>2 {i18n.language === 'fr' ? 'heures' : 'hours'}</option>
                    <option value={480}>8 {i18n.language === 'fr' ? 'heures' : 'hours'}</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="twoFactorAuth"
                    checked={localSettings.twoFactorAuth}
                    onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="twoFactorAuth" className="ml-2 block text-sm text-gray-700">
                    {i18n.language === 'fr' ? 'Authentification à Deux Facteurs' : 'Two-Factor Authentication'}
                  </label>
                </div>
              </div>
            </div>

            {/* Paramètres d'Intégration */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Cloud className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">{i18n.language === 'fr' ? 'Intégrations' : 'Integrations'}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-8">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="posIntegration"
                    checked={localSettings.posIntegration}
                    onChange={(e) => handleSettingChange('posIntegration', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="posIntegration" className="ml-2 block text-sm text-gray-700">
                    {i18n.language === 'fr' ? 'Intégration Caisse' : 'POS Integration'}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="weatherIntegration"
                    checked={localSettings.weatherEnabled}
                    onChange={(e) => handleSettingChange('weatherEnabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="weatherIntegration" className="ml-2 block text-sm text-gray-700">
                    {i18n.language === 'fr' ? 'Prévisions Météo' : 'Weather Integration'}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="calendarSync"
                    checked={localSettings.calendarSync}
                    onChange={(e) => handleSettingChange('calendarSync', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="calendarSync" className="ml-2 block text-sm text-gray-700">
                    {i18n.language === 'fr' ? 'Synchronisation Calendrier' : 'Calendar Sync'}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="backupEnabled"
                    checked={localSettings.backupEnabled}
                    onChange={(e) => handleSettingChange('backupEnabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="backupEnabled" className="ml-2 block text-sm text-gray-700">
                    {i18n.language === 'fr' ? 'Sauvegarde Automatique' : 'Backup Enabled'}
                  </label>
                </div>
              </div>
              
              {/* Weather Integration Info Box */}
              <div className="pl-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  {i18n.language === 'fr' ? 'Prévisions Météo Intégrées' : 'Integrated Weather Forecast'}
                </h3>
                <p className="text-sm text-blue-700">
                  {i18n.language === 'fr' 
                    ? 'Les prévisions météo s\'affichent automatiquement au-dessus du planning hebdomadaire, avec détection automatique de la localisation basée sur l\'adresse du restaurant. Couvre jusqu\'à 15 jours de prévisions avec températures, conditions météo et vitesse du vent.'
                    : 'Weather forecasts automatically display above the weekly schedule, with automatic location detection based on restaurant address. Covers up to 15 days of forecasts with temperatures, weather conditions, and wind speed.'}
                </p>
              </div>
            </div>
            
            {/* Paramètres de la Badgeuse */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Fingerprint className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">{i18n.language === 'fr' ? 'Badgeuse' : 'Time Clock'}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-8">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="timeClockEnabled"
                    checked={localSettings.timeClockEnabled}
                    onChange={(e) => handleSettingChange('timeClockEnabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="timeClockEnabled" className="ml-2 block text-sm text-gray-700">
                    {i18n.language === 'fr' ? 'Activer la Badgeuse' : 'Enable Time Clock'}
                  </label>
                </div>
              </div>
              
              <div className="pl-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  {i18n.language === 'fr' ? 'Fonction Badgeuse Activée' : 'Time Clock Feature Enabled'}
                </h3>
                <p className="text-sm text-blue-700">
                  {i18n.language === 'fr' 
                    ? 'La fonction Badgeuse est maintenant disponible dans votre application.'
                    : 'The Time Clock feature is now available in your application.'}
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  {i18n.language === 'fr' 
                    ? 'Accédez à la Badgeuse via l\'onglet dédié dans le menu principal.'
                    : 'Access the Time Clock via the dedicated tab in the main menu.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

import React, { useState, useEffect } from 'react';
import { X, Trash2, Clock, Calendar, Plus, AlertTriangle, Heart, Calendar as CalendarIcon } from 'lucide-react';
import { Employee, Shift, DAYS_OF_WEEK, DAILY_STATUS, DailyStatus, POSITIONS } from '../../types';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { calculateTimeInHours } from '../../lib/scheduleUtils';
import { useAppContext } from '../../contexts/AppContext';

interface DailyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  day: number;
  shifts: Shift[];
  onSaveShifts: (shifts: Omit<Shift, 'id'>[]) => void;
  onUpdateShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onSaveAbsence: (absence: Omit<Shift, 'id'>) => void;
  restaurantId: string;
}

const DailyEntryModal: React.FC<DailyEntryModalProps> = ({
  isOpen,
  onClose,
  employee,
  day,
  shifts,
  onSaveShifts,
  onUpdateShift,
  onDeleteShift,
  onSaveAbsence,
  restaurantId
}) => {
  const { t, i18n } = useTranslation();
  const { checkAvailabilityConflicts, getEmployeePreferences } = useAppContext();
  const [activeTab, setActiveTab] = useState<'shifts' | 'absence'>('shifts');
  const [shiftItems, setShiftItems] = useState<Array<{
    id: string;
    start: string;
    end: string;
    isNew?: boolean;
  }>>([]);
  const [selectedAbsence, setSelectedAbsence] = useState<DailyStatus | ''>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [availabilityWarning, setAvailabilityWarning] = useState<string | null>(null);
  const [preferenceWarning, setPreferenceWarning] = useState<string | null>(null);
  const [positionMismatchWarning, setPositionMismatchWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize modal state based on existing shifts or absences
  useEffect(() => {
    if (isOpen && employee) {
      // Filter shifts for this employee and day
      const employeeDayShifts = shifts.filter(
        s => s.employeeId === employee.id && s.day === day
      );

      // Check if there's an absence status
      const absenceShift = employeeDayShifts.find(s => s.status);
      
      if (absenceShift && absenceShift.status) {
        // If there's an absence, set the absence tab as active
        setActiveTab('absence');
        setSelectedAbsence(absenceShift.status);
        setShiftItems([]);
      } else {
        // Otherwise, set the shifts tab as active
        setActiveTab('shifts');
        setSelectedAbsence('');
        
        // Initialize shift items from existing shifts
        if (employeeDayShifts.length > 0) {
          setShiftItems(
            employeeDayShifts.map(s => ({
              id: s.id,
              start: s.start,
              end: s.end
            }))
          );
        } else {
          // Default to one empty shift if none exist
          setShiftItems([
            {
              id: uuidv4(),
              start: '09:00',
              end: '17:00',
              isNew: true
            }
          ]);
        }
      }
      
      setValidationError(null);
      setAvailabilityWarning(null);
      setPreferenceWarning(null);
      setPositionMismatchWarning(null);
      
      // Check for position preference mismatch
      checkForPositionPreferenceConflict(employee.id);
    }
  }, [isOpen, employee, day, shifts]);

  // Handle adding a new shift
  const handleAddShift = () => {
    // CRITICAL: Limit to maximum 2 shifts per day
    if (shiftItems.length >= 2) {
      setValidationError(
        i18n.language === 'fr'
          ? 'Maximum 2 services par jour atteints pour cet employé.'
          : 'Maximum 2 shifts per day reached for this employee.'
      );
      return;
    }
    
    setShiftItems(prev => [
      ...prev,
      {
        id: uuidv4(),
        start: prev.length > 0 ? '17:00' : '09:00',
        end: prev.length > 0 ? '23:00' : '17:00',
        isNew: true
      }
    ]);
    
    setValidationError(null);
  };

  // Handle removing a shift
  const handleRemoveShift = (shiftId: string) => {
    setShiftItems(prev => prev.filter(s => s.id !== shiftId));
    setValidationError(null);
  };

  // Handle shift time change
  const handleShiftChange = (
    shiftId: string,
    field: 'start' | 'end',
    value: string
  ) => {
    setShiftItems(prev =>
      prev.map(s =>
        s.id === shiftId
          ? { ...s, [field]: value }
          : s
      )
    );
    
    setValidationError(null);
    
    // Check for availability conflicts when times change
    if (employee) {
      const updatedShift = shiftItems.find(s => s.id === shiftId);
      if (updatedShift) {
        const start = field === 'start' ? value : updatedShift.start;
        const end = field === 'end' ? value : updatedShift.end;
        
        checkForAvailabilityConflicts(employee.id, day, start, end);
        checkForPreferenceConflicts(employee.id, day, start, end);
      }
    }
  };

  // Check for availability conflicts
  const checkForAvailabilityConflicts = (employeeId: string, day: number, start: string, end: string) => {
    if (!employee) return;
    
    const conflict = checkAvailabilityConflicts(employeeId, day, start, end);
    
    if (conflict.hasConflict) {
      if (conflict.conflictType === 'UNAVAILABLE') {
        setAvailabilityWarning(
          i18n.language === 'fr'
            ? `⚠️ Conflit : L'employé a indiqué être indisponible pendant cette période`
            : `⚠️ Conflict: Employee has indicated they are unavailable during this time`
        );
      } else if (conflict.conflictType === 'LIMITED') {
        setAvailabilityWarning(
          i18n.language === 'fr'
            ? `⚠️ Attention : L'employé a une disponibilité limitée pendant cette période`
            : `⚠️ Warning: Employee has limited availability during this time`
        );
      }
    } else {
      setAvailabilityWarning(null);
    }
  };

  // Check for preference conflicts
  const checkForPreferenceConflicts = (employeeId: string, day: number, start: string, end: string) => {
    if (!employee) return;
    
    const preferences = getEmployeePreferences(employeeId);
    if (!preferences) return;
    
    // Check if day is in preferred days
    const isDayPreferred = preferences.preferredDays.includes(day);
    if (!isDayPreferred) {
      setPreferenceWarning(
        i18n.language === 'fr'
          ? `ℹ️ Ce jour ne fait pas partie des jours préférés de l'employé`
          : `ℹ️ This day is not among the employee's preferred days`
      );
      return;
    }
    
    // Check if hours are within preferred range
    // This would require converting the shift times to hours and comparing with preferences
    // For simplicity, we'll just check the day preference for now
    
    setPreferenceWarning(null);
  };

  // Check for position preference conflict
  const checkForPositionPreferenceConflict = (employeeId: string) => {
    if (!employee) return;
    
    const preferences = getEmployeePreferences(employeeId);
    if (!preferences || !preferences.preferredPositions.length) return;
    
    // Check if employee's current position is in their preferred positions
    const isCurrentPositionPreferred = preferences.preferredPositions.includes(employee.position);
    
    if (!isCurrentPositionPreferred) {
      setPositionMismatchWarning(
        i18n.language === 'fr'
          ? `ℹ️ Le poste actuel (${t(`positions.${employee.position.toLowerCase().replace(/[^a-z]/g, '')}`)}) ne fait pas partie des postes préférés de l'employé`
          : `ℹ️ The current position (${t(`positions.${employee.position.toLowerCase().replace(/[^a-z]/g, '')}`)}) is not among the employee's preferred positions`
      );
    } else {
      setPositionMismatchWarning(null);
    }
  };

  // Validate shifts for overlaps
  const validateShifts = (): boolean => {
    if (shiftItems.length <= 1) return true;
    
    // Sort shifts by start time
    const sortedShifts = [...shiftItems].sort((a, b) => {
      const aStart = a.start.split(':').map(Number);
      const bStart = b.start.split(':').map(Number);
      return (aStart[0] * 60 + aStart[1]) - (bStart[0] * 60 + bStart[1]);
    });
    
    for (let i = 0; i < sortedShifts.length - 1; i++) {
      const currentShift = sortedShifts[i];
      const nextShift = sortedShifts[i + 1];
      
      const currentEnd = currentShift.end.split(':').map(Number);
      const nextStart = nextShift.start.split(':').map(Number);
      
      const currentEndMinutes = currentEnd[0] * 60 + currentEnd[1];
      const nextStartMinutes = nextStart[0] * 60 + nextStart[1];
      
      if (currentEndMinutes > nextStartMinutes) {
        setValidationError(
          i18n.language === 'fr'
            ? 'Les services se chevauchent. Veuillez ajuster les heures.'
            : 'Shifts are overlapping. Please adjust the times.'
        );
        return false;
      }
    }
    
    return true;
  };

  // Calculate total working hours and break time
  const calculateDaySummary = () => {
    if (shiftItems.length === 0) return { workingHours: 0, breakHours: 0 };
    
    // Sort shifts by start time
    const sortedShifts = [...shiftItems].sort((a, b) => a.start.localeCompare(b.start));
    
    // Calculate total working hours
    let totalWorkingHours = 0;
    sortedShifts.forEach(shift => {
      totalWorkingHours += calculateTimeInHours(shift.start, shift.end);
    });
    
    // Calculate break hours (coupure)
    let totalBreakMinutes = 0;
    for (let i = 0; i < sortedShifts.length - 1; i++) {
      const currentShift = sortedShifts[i];
      const nextShift = sortedShifts[i + 1];
      
      const currentEnd = currentShift.end.split(':').map(Number);
      const nextStart = nextShift.start.split(':').map(Number);
      
      let currentEndMinutes = currentEnd[0] * 60 + currentEnd[1];
      let nextStartMinutes = nextStart[0] * 60 + nextStart[1];
      
      // Handle overnight breaks
      if (nextStartMinutes < currentEndMinutes) {
        nextStartMinutes += 24 * 60; // Add 24 hours
      }
      
      const breakMinutes = nextStartMinutes - currentEndMinutes;
      totalBreakMinutes += breakMinutes;
    }
    
    return {
      workingHours: Math.round(totalWorkingHours * 10) / 10,
      breakHours: Math.round((totalBreakMinutes / 60) * 10) / 10
    };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!employee) {
        setValidationError(
          i18n.language === 'fr'
            ? 'Employé non sélectionné'
            : 'No employee selected'
        );
        setLoading(false);
        return;
      }
      
      if (activeTab === 'shifts') {
        // Validate shifts
        if (shiftItems.length === 0) {
          setValidationError(
            i18n.language === 'fr'
              ? 'Veuillez ajouter au moins un service'
              : 'Please add at least one shift'
          );
          setLoading(false);
          return;
        }
        
        if (!validateShifts()) {
          setLoading(false);
          return;
        }
        
        // Prepare shifts for saving
        const shiftsToSave = shiftItems.map((item, index) => ({
          restaurantId,
          employeeId: employee.id,
          day,
          start: item.start,
          end: item.end,
          position: employee.position,
          color: index === 0 ? '#3B82F6' : '#8B5CF6', // Blue for first shift, purple for second
          type: index === 0 ? 'morning' as const : 'evening' as const,
          // Add shiftGroup for related shifts
          shiftGroup: uuidv4(),
          shiftOrder: index + 1,
          hasCoupure: shiftItems.length > 1
        }));
        
        // Save shifts
        onSaveShifts(shiftsToSave);
      } else if (activeTab === 'absence') {
        // Validate absence
        if (!selectedAbsence) {
          setValidationError(
            i18n.language === 'fr'
              ? 'Veuillez sélectionner un type d\'absence'
              : 'Please select an absence type'
          );
          setLoading(false);
          return;
        }
        
        // Create absence shift
        const absenceShift = {
          restaurantId,
          employeeId: employee.id,
          day,
          start: '',
          end: '',
          position: employee.position,
          type: 'morning' as const,
          status: selectedAbsence as DailyStatus
        };
        
        // Save absence
        onSaveAbsence(absenceShift);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving shifts/absence:', error);
      setValidationError(
        i18n.language === 'fr'
          ? 'Une erreur est survenue lors de l\'enregistrement'
          : 'An error occurred while saving'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting all entries for this day
  const handleDeleteAll = () => {
    if (!employee) return;
    
    // Find all shifts for this employee and day
    const shiftsToDelete = shifts.filter(
      s => s.employeeId === employee.id && s.day === day
    );
    
    // Delete each shift
    shiftsToDelete.forEach(shift => {
      onDeleteShift(shift.id);
    });
    
    onClose();
  };

  // Format day name
  const getDayName = () => {
    return t(`days.${DAYS_OF_WEEK[day].toLowerCase()}`);
  };

  // Calculate day summary
  const { workingHours, breakHours } = calculateDaySummary();

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center bg-gray-50 px-4 py-3 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              {i18n.language === 'fr' ? 'Gérer la journée' : 'Manage Day'}
            </h3>
            <button 
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="space-y-4">
                {/* Employee and Day Information */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-blue-800">
                      {employee.firstName} {employee.lastName}
                    </div>
                    <div className="flex items-center text-sm text-blue-600">
                      <Calendar size={16} className="mr-1" />
                      {getDayName()}
                    </div>
                  </div>
                </div>

                {/* Position Preference Warning */}
                {positionMismatchWarning && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start">
                      <Heart size={16} className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-sm text-yellow-700">
                        {positionMismatchWarning}
                      </p>
                    </div>
                  </div>
                )}

                {/* Preference and Availability Warnings */}
                {(preferenceWarning || availabilityWarning) && (
                  <div className={`p-3 rounded-lg border ${
                    availabilityWarning 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {availabilityWarning ? (
                          <AlertTriangle size={16} className="text-red-500 mt-0.5" />
                        ) : (
                          <Heart size={16} className="text-yellow-500 mt-0.5" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm ${
                          availabilityWarning ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          {availabilityWarning || preferenceWarning}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200">
                  <button
                    type="button"
                    className={`py-2 px-4 text-sm font-medium border-b-2 ${
                      activeTab === 'shifts'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('shifts')}
                  >
                    {i18n.language === 'fr' ? 'Services' : 'Shifts'}
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-4 text-sm font-medium border-b-2 ${
                      activeTab === 'absence'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('absence')}
                  >
                    {i18n.language === 'fr' ? 'Absence' : 'Absence'}
                  </button>
                </div>

                {/* Shifts Tab Content */}
                {activeTab === 'shifts' && (
                  <div className="space-y-4">
                    {/* Multiple shifts section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">
                          {i18n.language === 'fr' ? 'Services' : 'Shifts'}
                        </h4>
                        {/* CRITICAL: Only show "Add service" button if less than 2 shifts */}
                        {shiftItems.length < 2 && (
                          <button
                            type="button"
                            onClick={handleAddShift}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Plus size={16} className="mr-1" />
                            {i18n.language === 'fr' ? 'Ajouter un service' : 'Add shift'}
                          </button>
                        )}
                      </div>

                      {shiftItems.map((shiftItem, index) => (
                        <div key={shiftItem.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Clock size={16} className="text-gray-500 mr-2" />
                              <span className="text-sm font-medium text-gray-700">
                                {i18n.language === 'fr' ? `Service ${index + 1}` : `Shift ${index + 1}`}
                              </span>
                            </div>
                            {shiftItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveShift(shiftItem.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label htmlFor={`start-${shiftItem.id}`} className="block text-xs font-medium text-gray-700">
                                {i18n.language === 'fr' ? 'Heure de début' : 'Start Time'}
                              </label>
                              <input
                                type="time"
                                id={`start-${shiftItem.id}`}
                                value={shiftItem.start}
                                onChange={(e) => handleShiftChange(shiftItem.id, 'start', e.target.value)}
                                required
                                className="mt-1 block w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-xs rounded-md"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor={`end-${shiftItem.id}`} className="block text-xs font-medium text-gray-700">
                                {i18n.language === 'fr' ? 'Heure de fin' : 'End Time'}
                              </label>
                              <input
                                type="time"
                                id={`end-${shiftItem.id}`}
                                value={shiftItem.end}
                                onChange={(e) => handleShiftChange(shiftItem.id, 'end', e.target.value)}
                                required
                                className="mt-1 block w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-xs rounded-md"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Day Summary */}
                      {shiftItems.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            {i18n.language === 'fr' ? 'Résumé du jour' : 'Day Summary'}
                          </h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                {i18n.language === 'fr' ? 'Heures travaillées' : 'Working hours'}:
                              </span>
                              <span className="font-medium text-gray-800">{workingHours}h</span>
                            </div>
                            {shiftItems.length > 1 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  {i18n.language === 'fr' ? 'Heures de coupure' : 'Break hours'}:
                                </span>
                                <span className="font-medium text-orange-600">{breakHours}h</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Absence Tab Content */}
                {activeTab === 'absence' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      {i18n.language === 'fr' ? 'Type d\'Absence' : 'Absence Type'}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(DAILY_STATUS).map(([status, { label, color }]) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setSelectedAbsence(status as DailyStatus)}
                          className={`p-2 text-sm font-medium rounded-md border ${
                            selectedAbsence === status 
                              ? 'text-white' 
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          style={{
                            backgroundColor: selectedAbsence === status ? color : undefined,
                            borderColor: selectedAbsence === status ? color : undefined
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> {i18n.language === 'fr' 
                          ? 'Sélectionner une absence supprimera tous les services planifiés pour ce jour.' 
                          : 'Selecting an absence will remove any scheduled shifts for this day.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Validation Error */}
                {validationError && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start">
                      <AlertTriangle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-sm text-red-700">{validationError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {i18n.language === 'fr' ? 'Enregistrement...' : 'Saving...'}
                  </span>
                ) : (
                  i18n.language === 'fr' ? 'Enregistrer' : 'Save'
                )}
              </button>
              
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                {i18n.language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              
              {/* Delete button - only show if there are existing shifts or absences */}
              {shifts.some(s => s.employeeId === employee.id && s.day === day) && (
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={handleDeleteAll}
                >
                  <Trash2 size={16} className="mr-2" />
                  {i18n.language === 'fr' ? 'Supprimer' : 'Delete'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DailyEntryModal;
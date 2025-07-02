import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { Plus, Calendar as CalendarIcon, Clock, Users, ChefHat, Shield, Save, FileText, Copy } from 'lucide-react';
import { startOfWeek, addWeeks, format, isWithinInterval, parseISO, addDays, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import ScheduleHeader from './ScheduleHeader';
import ScheduleGrid from './ScheduleGrid';
import MonthlySchedule from './MonthlySchedule';
import WeatherForecast from '../weather/WeatherForecast';
import LaborLawCompliancePanel from './LaborLawCompliancePanel';
import DailyEntryModal from './DailyEntryModal';
import { useAppContext } from '../../contexts/AppContext';
import { Shift, EmployeeCategory, Employee, USER_ROLES } from '../../types';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { scheduleAutoSaveService } from '../../lib/scheduleAutoSave';
import { v4 as uuidv4 } from 'uuid';
import PDFPreviewModal from './PDFPreviewModal';

type ViewMode = 'weekly' | 'monthly';
type CategoryFilter = 'all' | 'cuisine' | 'salle' | 'administration' | 'entretien' | 'autre';

const SchedulePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { 
    currentRestaurant, 
    getRestaurantEmployees, 
    getRestaurantSchedule,
    addShift,
    updateShift,
    deleteShift,
    userSettings,
    setCurrentTab,
    getCurrentUserRole
  } = useAppContext();
  
  const [weekStartDate, setWeekStartDate] = useState(() => {
    // Initialize to Monday of current week
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  
  // CRITICAL: Labor law compliance panel state - default to collapsed (false)
  const [showCompliancePanel, setShowCompliancePanel] = useState(false);
  
  // CRITICAL: State for manual save button
  const [isSaving, setIsSaving] = useState(false);
  
  // CRITICAL: State for daily entry modal
  const [showDailyEntryModal, setShowDailyEntryModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  
  // CRITICAL: State for PDF export modal
  const [showPDFPreviewModal, setShowPDFPreviewModal] = useState(false);
  
  // Get current user role
  const userRole = getCurrentUserRole();
  const isReadOnly = userRole === USER_ROLES.EMPLOYEE;
  
  // CRITICAL FIX: Move all derived variables before useEffect hooks
  const allEmployees = currentRestaurant 
    ? getRestaurantEmployees(currentRestaurant.id)
    : [];

  // CRITICAL FIX: Helper function to get active employees for the week
  const getActiveEmployeesForWeek = (employees: Employee[], weekStart: Date): Employee[] => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    return employees.filter(employee => {
      const contractStart = parseISO(employee.startDate);
      const contractEnd = employee.endDate ? parseISO(employee.endDate) : null;
      
      // Employee is active if:
      // 1. Contract starts before or during the week AND
      // 2. Contract hasn't ended OR ends during or after the week
      const startsBeforeOrDuringWeek = contractStart <= weekEnd;
      const endsAfterOrDuringWeek = !contractEnd || contractEnd >= weekStart;
      
      return startsBeforeOrDuringWeek && endsAfterOrDuringWeek;
    });
  };

  // CRITICAL FIX: Filter employees based on contract dates for the selected week
  const activeEmployeesForWeek = getActiveEmployeesForWeek(allEmployees, weekStartDate);

  // CRITICAL FIX: Apply category filter to get the correct employees for the current view
  const employees = activeEmployeesForWeek.filter(employee => {
    if (categoryFilter === 'all') return true;
    
    // Handle both predefined and custom categories
    if (categoryFilter === 'cuisine') return employee.category === 'Cuisine';
    if (categoryFilter === 'salle') return employee.category === 'Salle';
    if (categoryFilter === 'administration') return employee.category === 'Administration';
    if (categoryFilter === 'entretien') return employee.category === 'Entretien';
    if (categoryFilter === 'autre') {
      // For 'autre', include any employee with a category that's not one of the predefined ones
      return !['Cuisine', 'Salle', 'Administration', 'Entretien'].includes(employee.category);
    }
    
    return true;
  });

  // CRITICAL FIX: Create filtered employee IDs list for shift filtering
  const filteredEmployeeIds = employees.map(emp => emp.id);
    
  const schedule = currentRestaurant 
    ? getRestaurantSchedule(currentRestaurant.id)
    : undefined;
    
  // CRITICAL FIX: Filter shifts to match the selected view
  const shifts = schedule?.shifts.filter(shift => 
    filteredEmployeeIds.includes(shift.employeeId)
  ) || [];
  
  // CRITICAL: Initialize auto-save service when component mounts
  useEffect(() => {
    if (currentRestaurant) {
      const schedule = getRestaurantSchedule(currentRestaurant.id);
      
      // Initialize auto-save service with current shifts
      scheduleAutoSaveService.initialize(
        (shifts) => {
          // This callback will be called when auto-save triggers
          console.log('🔄 Auto-save triggered with', shifts.length, 'shifts');
          
          // In a real implementation, this would call an API endpoint
          // For now, we'll just update the local state via context
          // No need to do anything as shifts are already saved in context
        },
        schedule?.shifts || [],
        i18n.language as 'en' | 'fr'
      );
    }
    
    // Clean up when component unmounts
    return () => {
      scheduleAutoSaveService.cleanup();
    };
  }, [currentRestaurant]);
  
  // CRITICAL: Update auto-save service when language changes
  useEffect(() => {
    scheduleAutoSaveService.setLanguage(i18n.language as 'en' | 'fr');
  }, [i18n.language]);
  
  // CRITICAL: Update auto-save service when shifts change
  useEffect(() => {
    if (currentRestaurant) {
      const schedule = getRestaurantSchedule(currentRestaurant.id);
      if (schedule) {
        scheduleAutoSaveService.updateShifts(schedule.shifts);
      }
    }
  }, [shifts]);
  
  // CRITICAL FIX: Functional week navigation arrows
  const handlePrevWeek = () => {
    const newDate = addWeeks(weekStartDate, -1);
    setWeekStartDate(newDate);
  };
  
  const handleNextWeek = () => {
    const newDate = addWeeks(weekStartDate, 1);
    setWeekStartDate(newDate);
  };
  
  const handleToday = () => {
    setWeekStartDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const handleWeekSelect = (date: Date) => {
    setWeekStartDate(date);
  };

  // CRITICAL: Enhanced duplicate week functionality with contract date validation
  const handleDuplicateWeek = () => {
    if (!currentRestaurant || !schedule) {
      toast.error(i18n.language === 'fr' 
        ? 'Aucun restaurant sélectionné' 
        : 'No restaurant selected');
      return;
    }

    const nextWeekStart = addWeeks(weekStartDate, 1);
    const nextWeekEnd = addDays(nextWeekStart, 6);
    
    // Get all shifts for the current week
    const currentWeekShifts = schedule.shifts.filter(shift => 
      filteredEmployeeIds.includes(shift.employeeId)
    );
    
    // Track duplicated shifts for success message
    let duplicatedCount = 0;
    
    try {
      // Process each shift
      currentWeekShifts.forEach(shift => {
        // Get the employee for this shift
        const employee = allEmployees.find(e => e.id === shift.employeeId);
        if (!employee) return;
        
        // Check if employee's contract is valid for the target week
        const contractStart = parseISO(employee.startDate);
        const contractEnd = employee.endDate ? parseISO(employee.endDate) : null;
        
        // Calculate the actual date of this shift in the target week
        const targetShiftDate = addDays(nextWeekStart, shift.day);
        
        // Skip if the shift date is before contract start or after contract end
        if (targetShiftDate < contractStart) {
          console.log(`Skipping shift for ${employee.firstName} ${employee.lastName} - before contract start`);
          return;
        }
        
        if (contractEnd && targetShiftDate > contractEnd) {
          console.log(`Skipping shift for ${employee.firstName} ${employee.lastName} - after contract end`);
          return;
        }
        
        // Create a new shift for the next week
        const newShift: Omit<Shift, 'id'> = {
          ...shift,
          id: undefined // Will be generated by addShift
        };
        
        // Add the new shift
        addShift(newShift);
        duplicatedCount++;
      });
      
      // Show success message with count
      if (duplicatedCount > 0) {
        toast.success(i18n.language === 'fr' 
          ? `${duplicatedCount} service(s) dupliqué(s) vers la semaine suivante` 
          : `${duplicatedCount} shift(s) duplicated to next week`);
      } else {
        toast.info(i18n.language === 'fr' 
          ? 'Aucun service à dupliquer pour la semaine suivante' 
          : 'No shifts to duplicate to next week');
      }
      
      // Navigate to the next week
      setWeekStartDate(nextWeekStart);
    } catch (error) {
      console.error('Failed to duplicate week:', error);
      toast.error(t('errors.weekDuplicationFailed'));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (isReadOnly) return; // Don't allow drag if in read-only mode
    
    const { active, over } = event;
    
    if (!over) return;

    const shiftId = active.id as string;
    const newDay = parseInt(over.id.toString().split('-')[1]);

    const shift = shifts.find(s => s.id === shiftId);
    if (shift && shift.day !== newDay) {
      updateShift({ ...shift, day: newDay });
    }
  };

  // CRITICAL FIX: Validation for scheduling outside contract period
  const validateShiftAgainstContract = (employeeId: string, day: number): { isValid: boolean; message?: string } => {
    const employee = allEmployees.find(emp => emp.id === employeeId);
    if (!employee) return { isValid: false, message: 'Employee not found' };

    const shiftDate = addDays(weekStartDate, day);
    const contractStart = parseISO(employee.startDate);
    const contractEnd = employee.endDate ? parseISO(employee.endDate) : null;

    // Check if shift date is before contract start
    if (shiftDate < contractStart) {
      return {
        isValid: false,
        message: `Attention : Vous ne pouvez pas planifier d'heures pour ${employee.firstName} ${employee.lastName} en dehors de sa période contractuelle (Date de début : ${format(contractStart, 'd MMMM yyyy')}).`
      };
    }

    // Check if shift date is after contract end
    if (contractEnd && shiftDate > contractEnd) {
      return {
        isValid: false,
        message: `Attention : Vous ne pouvez pas planifier d'heures pour ${employee.firstName} ${employee.lastName} en dehors de sa période contractuelle (Date de fin : ${format(contractEnd, 'd MMMM yyyy')}).`
      };
    }

    return { isValid: true };
  };

  // CRITICAL: Check if employee already has maximum shifts for a day
  const hasMaxShifts = (employeeId: string, day: number): boolean => {
    const dayShifts = shifts.filter(shift => 
      shift.employeeId === employeeId && 
      shift.day === day &&
      !shift.status // Only count actual shifts, not status markers
    );
    return dayShifts.length >= 2;
  };

  // Enhanced addShift with contract validation and max shifts check
  const handleAddShift = (shiftData: Omit<Shift, 'id'>) => {
    if (isReadOnly) return; // Don't allow adding shifts in read-only mode
    
    const validation = validateShiftAgainstContract(shiftData.employeeId, shiftData.day);
    
    if (!validation.isValid) {
      toast.error(validation.message || 'Invalid shift timing');
      return;
    }

    // CRITICAL: Check if employee already has maximum shifts for this day
    if (!shiftData.status && hasMaxShifts(shiftData.employeeId, shiftData.day)) {
      toast.error(i18n.language === 'fr' 
        ? 'Maximum 2 services par jour atteints pour cet employé.' 
        : 'Maximum 2 shifts per day reached for this employee.');
      return;
    }

    // Generate a unique ID if not provided
    const newShift = {
      ...shiftData,
      id: uuidv4()
    };
    
    addShift(newShift);
  };

  // Enhanced updateShift with contract validation
  const handleUpdateShift = (shift: Shift) => {
    if (isReadOnly) return; // Don't allow updating shifts in read-only mode
    
    // Only validate if we're changing the day or employee
    const existingShift = shifts.find(s => s.id === shift.id);
    const isDayOrEmployeeChanged = !existingShift || 
      existingShift.day !== shift.day || 
      existingShift.employeeId !== shift.employeeId;

    if (isDayOrEmployeeChanged) {
      const validation = validateShiftAgainstContract(shift.employeeId, shift.day);
      
      if (!validation.isValid) {
        toast.error(validation.message || 'Invalid shift timing');
        return;
      }
    }

    updateShift(shift);
  };
  
  // CRITICAL: Manual save function
  const handleManualSave = () => {
    setIsSaving(true);
    
    try {
      // Force an immediate save via the auto-save service
      scheduleAutoSaveService.saveNow();
      
      // Show success message
      toast.success(
        i18n.language === 'fr' 
          ? 'Planning sauvegardé avec succès' 
          : 'Schedule saved successfully',
        {
          duration: 3000,
          icon: '✅',
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #dcfce7'
          }
        }
      );
    } catch (error) {
      console.error('Failed to save schedule:', error);
      toast.error(
        i18n.language === 'fr' 
          ? 'Échec de la sauvegarde du planning' 
          : 'Failed to save schedule'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // CRITICAL: Open daily entry modal
  const handleOpenDailyEntryModal = (employeeId: string, day: number) => {
    if (isReadOnly) return; // Don't allow opening modal in read-only mode
    
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    setSelectedEmployee(employee);
    setSelectedDay(day);
    setShowDailyEntryModal(true);
  };

  // CRITICAL: Handle saving shifts from daily entry modal
  const handleSaveShifts = (shiftsToSave: Omit<Shift, 'id'>[]) => {
    if (!selectedEmployee || isReadOnly) return;
    
    // First, delete any existing shifts or absences for this employee and day
    const existingEntries = shifts.filter(
      s => s.employeeId === selectedEmployee.id && s.day === selectedDay
    );
    
    existingEntries.forEach(shift => {
      deleteShift(shift.id);
    });
    
    // Then add the new shifts
    shiftsToSave.forEach(shift => {
      handleAddShift(shift);
    });
    
    toast.success(
      i18n.language === 'fr'
        ? 'Services enregistrés avec succès'
        : 'Shifts saved successfully'
    );
  };

  // CRITICAL: Handle saving absence from daily entry modal
  const handleSaveAbsence = (absence: Omit<Shift, 'id'>) => {
    if (!selectedEmployee || isReadOnly) return;
    
    // First, delete any existing shifts or absences for this employee and day
    const existingEntries = shifts.filter(
      s => s.employeeId === selectedEmployee.id && s.day === selectedDay
    );
    
    existingEntries.forEach(shift => {
      deleteShift(shift.id);
    });
    
    // Then add the new absence
    handleAddShift(absence);
    
    toast.success(
      i18n.language === 'fr'
        ? 'Absence enregistrée avec succès'
        : 'Absence saved successfully'
    );
  };

  // CRITICAL FIX: Helper function to format week range in French
  const formatWeekRange = (weekStart: Date): string => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    if (i18n.language === 'fr') {
      // French format: "Semaine du 9 Juin 2025 au 15 Juin 2025"
      const startFormatted = format(weekStart, 'd MMMM yyyy', { locale: fr });
      const endFormatted = format(weekEnd, 'd MMMM yyyy', { locale: fr });
      
      // Capitalize month names
      const startCapitalized = startFormatted.replace(/\b\w/g, (char) => char.toUpperCase());
      const endCapitalized = endFormatted.replace(/\b\w/g, (char) => char.toUpperCase());
      
      return `Semaine du ${startCapitalized} au ${endCapitalized}`;
    } else {
      // English format: "Week of June 9, 2025 to June 15, 2025"
      const startFormatted = format(weekStart, 'MMMM d, yyyy');
      const endFormatted = format(weekEnd, 'MMMM d, yyyy');
      return `Week of ${startFormatted} to ${endFormatted}`;
    }
  };

  // CRITICAL: Get restaurant location for weather
  const getRestaurantLocation = (): string => {
    if (!currentRestaurant) return '';
    
    // Build location string from available address components
    const locationParts = [];
    
    if (currentRestaurant.streetAddress) {
      locationParts.push(currentRestaurant.streetAddress);
    }
    
    if (currentRestaurant.postalCode) {
      locationParts.push(currentRestaurant.postalCode);
    }
    
    if (currentRestaurant.city) {
      locationParts.push(currentRestaurant.city);
    }
    
    if (currentRestaurant.country) {
      locationParts.push(currentRestaurant.country);
    }

    if (locationParts.length > 0) {
      return locationParts.join(', ');
    }
    
    // Fallback to the location field if no detailed address
    if (currentRestaurant.location) {
      return currentRestaurant.location;
    }
    
    return 'France'; // Default fallback
  };

  // CRITICAL FIX: Safe access to userSettings with fallback
  const isCompactLayout = userSettings?.scheduleLayoutType === 'optimized';

  // CRITICAL: Debug logging to verify data flow
  console.log('🔍 SchedulePage Debug Info:', {
    categoryFilter,
    totalEmployees: allEmployees.length,
    activeEmployees: activeEmployeesForWeek.length,
    filteredEmployees: employees.length,
    filteredEmployeeIds,
    totalShifts: schedule?.shifts.length || 0,
    filteredShifts: shifts.length,
    currentRestaurant: currentRestaurant?.name,
    userSettings: userSettings || 'undefined',
    userRole
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{t('common.weeklySchedule')}</h2>
          <p className="text-gray-500">
            {currentRestaurant ? `${currentRestaurant.name} - ${currentRestaurant.location}` : t('common.selectRestaurant')}
          </p>
          {/* CRITICAL FIX: Show properly formatted week range */}
          <p className="text-sm text-gray-400 mt-1">
            {formatWeekRange(weekStartDate)}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* CRITICAL: Manual Save Button - Only for admin/manager */}
          {!isReadOnly && (
            <button
              onClick={handleManualSave}
              disabled={isSaving}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {i18n.language === 'fr' ? 'Sauvegarde...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  {i18n.language === 'fr' ? 'Sauvegarder' : 'Save'}
                </>
              )}
            </button>
          )}
          
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-2 flex items-center gap-2 ${
                viewMode === 'weekly'
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Clock size={18} />
              {t('schedule.weekly')}
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 flex items-center gap-2 ${
                viewMode === 'monthly'
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CalendarIcon size={18} />
              {t('schedule.monthly')}
            </button>
          </div>

          {/* CRITICAL: View filter buttons with debug info */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => {
                console.log('🎯 Setting categoryFilter to: all');
                setCategoryFilter('all');
              }}
              className={`px-4 py-2 flex items-center gap-2 ${
                categoryFilter === 'all'
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users size={18} />
              {t('buttons.viewGlobal')}
            </button>
            <button
              onClick={() => {
                console.log('🎯 Setting categoryFilter to: cuisine');
                setCategoryFilter('cuisine');
              }}
              className={`px-4 py-2 flex items-center gap-2 ${
                categoryFilter === 'cuisine'
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChefHat size={18} />
              {t('buttons.viewCuisine')}
            </button>
            <button
              onClick={() => {
                console.log('🎯 Setting categoryFilter to: salle');
                setCategoryFilter('salle');
              }}
              className={`px-4 py-2 flex items-center gap-2 ${
                categoryFilter === 'salle'
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users size={18} />
              {t('buttons.viewSalle')}
            </button>
          </div>

          {/* CRITICAL: Labor Law Compliance Toggle */}
          <button
            onClick={() => setShowCompliancePanel(!showCompliancePanel)}
            className={`px-4 py-2 flex items-center gap-2 rounded-lg border transition-colors ${
              showCompliancePanel
                ? 'bg-blue-50 text-blue-600 border-blue-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            title="Afficher/masquer le panneau de conformité Code du travail"
          >
            <Shield size={18} />
            <span className="hidden md:inline">Conformité</span>
          </button>
        </div>
      </div>
      
      {currentRestaurant ? (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4">
            {/* CRITICAL: Labor Law Compliance Panel - Positioned at top for visibility */}
            <LaborLawCompliancePanel
              employees={employees}
              shifts={shifts}
              weekStartDate={weekStartDate}
              isVisible={showCompliancePanel}
              onToggle={() => setShowCompliancePanel(!showCompliancePanel)}
            />

            {viewMode === 'weekly' ? (
              <>
                {/* CRITICAL: Pass the correctly filtered data to ScheduleHeader */}
                <ScheduleHeader
                  weekStartDate={weekStartDate}
                  onPrevWeek={handlePrevWeek}
                  onNextWeek={handleNextWeek}
                  onToday={handleToday}
                  onDuplicateWeek={handleDuplicateWeek}
                  onWeekSelect={handleWeekSelect}
                  restaurant={currentRestaurant}
                  employees={employees}
                  shifts={shifts}
                  viewType={categoryFilter as 'all' | 'cuisine' | 'salle'}
                  isReadOnly={isReadOnly}
                />

                {/* CRITICAL: Weather Forecast Integration - Positioned above schedule grid */}
                <WeatherForecast
                  weekStartDate={weekStartDate}
                  restaurantLocation={getRestaurantLocation()}
                  compact={isCompactLayout}
                  responsive={window.innerWidth < 640 ? 'xs' : 
                           window.innerWidth < 768 ? 'sm' : 
                           window.innerWidth < 1024 ? 'md' : 
                           window.innerWidth < 1280 ? 'lg' : 'xl'}
                />
                
                {/* CRITICAL FIX: Pass weekStartDate to ScheduleGrid */}
                <ScheduleGrid
                  shifts={shifts}
                  employees={employees}
                  onUpdateShift={handleUpdateShift}
                  onAddShift={handleAddShift}
                  onDeleteShift={deleteShift}
                  weekStartDate={weekStartDate}
                  onOpenShiftModal={handleOpenDailyEntryModal}
                  isReadOnly={isReadOnly}
                />
              </>
            ) : (
              <MonthlySchedule
                shifts={shifts}
                employees={employees}
                onShiftClick={(shift) => {
                  if (isReadOnly) return; // Don't allow opening modal in read-only mode
                  
                  const employee = employees.find(e => e.id === shift.employeeId);
                  if (employee) {
                    setSelectedEmployee(employee);
                    setSelectedDay(shift.day);
                    setShowDailyEntryModal(true);
                  }
                }}
                currentDate={weekStartDate}
                isReadOnly={isReadOnly}
              />
            )}
          </div>
        </DndContext>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-lg text-gray-500">
            {t('common.selectRestaurantPrompt')}
          </p>
        </div>
      )}

      {/* CRITICAL: Daily Entry Modal for managing shifts and absences */}
      <DailyEntryModal
        isOpen={showDailyEntryModal}
        onClose={() => setShowDailyEntryModal(false)}
        employee={selectedEmployee}
        day={selectedDay}
        shifts={shifts}
        onSaveShifts={handleSaveShifts}
        onUpdateShift={handleUpdateShift}
        onDeleteShift={deleteShift}
        onSaveAbsence={handleSaveAbsence}
        restaurantId={currentRestaurant?.id || ''}
      />
      
      {/* CRITICAL: PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPDFPreviewModal}
        onClose={() => setShowPDFPreviewModal(false)}
        restaurant={currentRestaurant!}
        employees={employees}
        shifts={shifts}
        weekStartDate={weekStartDate}
        viewType={categoryFilter as 'all' | 'cuisine' | 'salle'}
      />
    </div>
  );
};

export default SchedulePage;

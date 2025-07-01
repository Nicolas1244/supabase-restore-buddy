import React, { useState, useEffect } from 'react';
import { X, Trash2, Clock, Calendar, Plus, AlertTriangle } from 'lucide-react';
import { Employee, Shift, DAYS_OF_WEEK, DAILY_STATUS, DailyStatus, POSITIONS } from '../../types';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../../contexts/AppContext';
import { useEmployeeAvailability } from '../../hooks/useEmployeeAvailability';
import { scheduleService } from '../../services/scheduleService';

interface DailyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  day: number;
  onSave: (data: { shifts?: Shift[]; absence?: DailyStatus }) => void;
  onDelete: () => void;
}

const DailyEntryModal: React.FC<DailyEntryModalProps> = ({ isOpen, onClose, employeeId, day, onSave, onDelete }) => {
  const { t, i18n } = useTranslation();
  const { employees, getEmployee } = useAppContext();
  const employee = getEmployee(employeeId);
  const { availabilities } = useEmployeeAvailability(employeeId);
  const [activeTab, setActiveTab] = useState<'shifts' | 'absence'>('shifts');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [absence, setAbsence] = useState<DailyStatus | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && employee) {
      const employeeDayShifts = employee.shifts?.filter(s => s.day === day) || [];
      const absenceShift = employeeDayShifts.find(s => s.status);

      if (absenceShift && absenceShift.status) {
        setActiveTab('absence');
        setAbsence(absenceShift.status);
        setShifts([]);
      } else {
        setActiveTab('shifts');
        setAbsence(null);
        setShifts(employeeDayShifts);
      }
      setValidationError(null);
    }
  }, [isOpen, employee, day]);

  const handleAddShift = () => {
    if (shifts.length >= 2) {
      setValidationError(t('errors.maxShiftsReached'));
      return;
    }
    setShifts([...shifts, { id: uuidv4(), employeeId, day, start: '09:00', end: '17:00', position: employee?.position || '', type: 'morning' }]);
  };

  const handleRemoveShift = (shiftId: string) => {
    setShifts(shifts.filter(s => s.id !== shiftId));
  };

  const handleShiftChange = (shiftId: string, field: 'start' | 'end', value: string) => {
    setShifts(shifts.map(s => s.id === shiftId ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async () => {
    try {
      if (activeTab === 'shifts') {
        if (shifts.length === 0) {
          setValidationError(t('errors.addAtLeastOneShift'));
          return;
        }
        await scheduleService.saveShifts(shifts);
      } else {
        await scheduleService.saveAbsence({ employeeId, day, status: absence! });
      }
      onSave({ shifts, absence });
      onClose();
    } catch (error) {
      console.error('Error saving data:', error);
      setValidationError(t('errors.saveFailed'));
    }
  };

  const handleAbsenceChange = (status: DailyStatus | null) => {
    setAbsence(status);
    if (status) {
      setShifts([]);
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center bg-gray-50 px-4 py-3 border-b">
            <h3 className="text-lg font-medium text-gray-900">{t('modal.manageDay')}</h3>
            <button className="text-gray-400 hover:text-gray-500 focus:outline-none" onClick={onClose}><X size={20} /></button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-blue-800">{employee.firstName} {employee.lastName}</div>
                  <div className="flex items-center text-sm text-blue-600"><Calendar size={16} className="mr-1" />{t(`days.${DAYS_OF_WEEK[day].toLowerCase()}`)}</div>
                </div>
              </div>

              <div className="flex border-b border-gray-200">
                <button type="button" className={`py-2 px-4 text-sm font-medium border-b-2 ${activeTab === 'shifts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => setActiveTab('shifts')}>{t('modal.shifts')}</button>
                <button type="button" className={`py-2 px-4 text-sm font-medium border-b-2 ${activeTab === 'absence' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => setActiveTab('absence')}>{t('modal.absence')}</button>
              </div>

              {activeTab === 'shifts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">{t('modal.shifts')}</h4>
                    {shifts.length < 2 && <button type="button" onClick={handleAddShift} className="flex items-center text-sm text-blue-600 hover:text-blue-800"><Plus size={16} className="mr-1" />{t('modal.addShift')}</button>}
                  </div>
                  {shifts.map((shift, index) => (
                    <div key={shift.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center"><Clock size={16} className="text-gray-500 mr-2" /><span className="text-sm font-medium text-gray-700">{t('modal.shift', { index: index + 1 })}</span></div>
                        {shifts.length > 1 && <button type="button" onClick={() => handleRemoveShift(shift.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <TimeInput label={t('modal.startTime')} value={shift.start} onChange={e => handleShiftChange(shift.id, 'start', e.target.value)} />
                        <TimeInput label={t('modal.endTime')} value={shift.end} onChange={e => handleShiftChange(shift.id, 'end', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'absence' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">{t('modal.absenceType')}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(DAILY_STATUS).map(([status, { label, color }]) => (
                      <button key={status} type="button" onClick={() => handleAbsenceChange(status as DailyStatus)} className={`p-2 text-sm font-medium rounded-md border ${absence === status ? 'text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`} style={{ backgroundColor: absence === status ? color : undefined, borderColor: absence === status ? color : undefined }}>{label}</button>
                    ))}
                  </div>
                </div>
              )}

              {validationError && <div className="p-3 bg-red-50 rounded-lg border border-red-200"><div className="flex items-start"><AlertTriangle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" /><p className="text-sm text-red-700">{validationError}</p></div></div>}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" onClick={handleSubmit} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">{t('modal.save')}</button>
            <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">{t('modal.cancel')}</button>
            {shifts.length > 0 && <button type="button" onClick={onDelete} className="mt-3 w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto sm:text-sm"><Trash2 size={16} className="mr-2" />{t('modal.delete')}</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyEntryModal;

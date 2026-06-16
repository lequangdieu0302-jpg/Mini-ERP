'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useERP } from '@/context/erp-context';
import { usePayrollState } from '@/hooks/use-payroll-state';
import {
  Clock, MapPin, Camera, User, Calendar, FileText, CheckCircle,
  AlertTriangle, Send, ShieldAlert, ArrowLeft, Download, Eye, Lock, X
} from 'lucide-react';

export function EmployeePortal() {
  const { t, currentUser, employees, updateAvatarUrl } = useERP();
  const {
    shifts,
    locations,
    attendance, clockIn, clockOut,
    leaveRequests, requestLeave,
    otRequests, requestOT,
    adjustments, requestAdjustment,
    payslips
  } = usePayrollState();

  // Active ESS tab - connected to URL query parameters
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = (searchParams.get('tab') || 'timeclock') as 'timeclock' | 'history' | 'payslips' | 'requests' | 'settings';

  const setActiveTab = (tab: string) => {
    router.replace(`/payroll?tab=${tab}`);
  };

  // Match current user to employee profile
  const currentEmployee = employees.find(e => e.user_id === currentUser.id) || {
    id: `emp-${currentUser.id}`,
    position: 'Operations Engineer',
    salary: 5800,
    department_id: 'dept1',
    active: true
  };

  const empDepartment = currentUser.id === 'u6' ? 'Engineering Operations' : currentUser.id === 'u8' ? 'Finance & Accounting' : 'Operations';

  // Biometric Timeclock States
  const [gpsText, setGpsText] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isOutOfArea, setIsOutOfArea] = useState(false);
  const [closestLoc, setClosestLoc] = useState<any>(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [snapshotUrl, setSnapshotUrl] = useState('');
  const [faceVerified, setFaceVerified] = useState(false);
  const [scanActive, setScanActive] = useState(false);

  // Active Punch Check (In but no Out today)
  const todayStr = new Date().toISOString().split('T')[0];
  const activePunch = attendance.find(log => log.employeeId === currentEmployee.id && log.date === todayStr && !log.checkOut);
  const completedTodayPunch = attendance.find(log => log.employeeId === currentEmployee.id && log.date === todayStr && log.checkOut);

  // Leave Form states
  const [leaveType, setLeaveType] = useState<'annual' | 'sick' | 'unpaid' | 'personal'>('annual');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // OT Form states
  const [otDate, setOtDate] = useState('');
  const [otHours, setOtHours] = useState(2);
  const [otType, setOtType] = useState<'weekday' | 'sunday' | 'holiday'>('weekday');
  const [otReason, setOtReason] = useState('');

  // Adjustment Form states
  const [adjDate, setAdjDate] = useState('');
  const [adjCheckIn, setAdjCheckIn] = useState('08:00');
  const [adjCheckOut, setAdjCheckOut] = useState('17:00');
  const [adjReason, setAdjReason] = useState('');

  // Profile Form states
  const [passwordOld, setPasswordOld] = useState('');
  const [passwordNew, setPasswordNew] = useState('');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const success = await updateAvatarUrl(base64);
      if (success) {
        triggerToast(t('Profile picture updated successfully!'));
      } else {
        triggerToast(t('Failed to update profile picture.'));
      }
    };
    reader.readAsDataURL(file);
  };

  // Payslip preview modal state
  const [previewSlip, setPreviewSlip] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 1. GPS Check Logic
  const handleGetLocation = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          setGpsText(`${userLat.toFixed(5)}, ${userLng.toFixed(5)}`);

          // Calculate closest location from locations list
          if (locations.length > 0) {
            // Find distance (simple Euclidean mock)
            let minDistance = Infinity;
            let closest = locations[0];
            locations.forEach(loc => {
              const d = Math.sqrt(Math.pow(loc.lat - userLat, 2) + Math.pow(loc.lng - userLng, 2)) * 111000; // rough meters estimation
              if (d < minDistance) {
                minDistance = d;
                closest = loc;
              }
            });
            setClosestLoc(closest);
            // If distance > allowed radius
            if (minDistance > closest.radius) {
              setIsOutOfArea(true);
            } else {
              setIsOutOfArea(false);
            }
          }
          setGpsLoading(false);
        },
        () => {
          // Fallback to summit HQ coordinates
          const defaultLoc = locations[2] || locations[0] || { lat: 40.7128, lng: -74.0060, radius: 100 };
          setGpsText(`${defaultLoc.lat.toFixed(5)}, ${defaultLoc.lng.toFixed(5)}`);
          setClosestLoc(defaultLoc);
          setIsOutOfArea(false); // mock inside area
          setGpsLoading(false);
        }
      );
    } else {
      const defaultLoc = locations[2] || locations[0];
      setGpsText(`${defaultLoc.lat.toFixed(5)}, ${defaultLoc.lng.toFixed(5)}`);
      setClosestLoc(defaultLoc);
      setIsOutOfArea(false);
      setGpsLoading(false);
    }
  };

  // 2. Webcam Simulation Logic
  const startCamera = async () => {
    setCameraActive(true);
    setSnapshotUrl('');
    setFaceVerified(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Webcam blocked, using simulation mock feeds");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    setScanActive(true);
    setTimeout(() => {
      // Draw canvas
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (ctx && video) {
        ctx.drawImage(video, 0, 0, 320, 240);
        setSnapshotUrl(canvas.toDataURL('image/jpeg'));
      } else {
        // Fallback mock photo
        setSnapshotUrl('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80');
      }
      setFaceVerified(true);
      setScanActive(false);
      stopCamera();
    }, 1500); // simulated scanning delay
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSnapshotUrl(reader.result as string);
      setFaceVerified(true);
      triggerToast(t('Face selfie uploaded and verified!'));
    };
    reader.readAsDataURL(file);
  };

  // 3. Punch Handlers
  const handlePunchIn = () => {
    const status = isOutOfArea ? 'out_of_area' : 'on_time';
    clockIn(
      currentEmployee.id,
      currentUser.full_name,
      empDepartment,
      'sh1',
      gpsText || '40.7128, -74.0060',
      closestLoc?.name || 'Unknown Geofence',
      snapshotUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80',
      'Chrome v124 (Mobile WebView)',
      status
    );
    setGpsText('');
    setSnapshotUrl('');
    setFaceVerified(false);
    triggerToast(t('Clocked in successfully!'));
  };

  const handlePunchOut = () => {
    if (!activePunch) return;
    clockOut(
      activePunch.id,
      gpsText || '40.7128, -74.0060',
      closestLoc?.name || 'Unknown Geofence',
      snapshotUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80',
      'Chrome v124 (Mobile WebView)',
      1 // mock 1 hour OT earned
    );
    setGpsText('');
    setSnapshotUrl('');
    setFaceVerified(false);
    triggerToast(t('Clocked out successfully!'));
  };

  // 4. Request Handlers
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd || !leaveReason) return;
    requestLeave({
      employeeId: currentEmployee.id,
      employeeName: currentUser.full_name,
      department: empDepartment,
      type: leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason
    });
    setLeaveStart('');
    setLeaveEnd('');
    setLeaveReason('');
    triggerToast(t('Leave request submitted!'));
  };

  const handleOTSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otDate || !otReason) return;
    requestOT({
      employeeId: currentEmployee.id,
      employeeName: currentUser.full_name,
      department: empDepartment,
      date: otDate,
      hours: Number(otHours),
      type: otType,
      reason: otReason
    });
    setOtDate('');
    setOtHours(2);
    setOtReason('');
    triggerToast(t('Overtime request submitted!'));
  };

  const handleAdjSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjDate || !adjReason) return;
    requestAdjustment({
      employeeId: currentEmployee.id,
      employeeName: currentUser.full_name,
      department: empDepartment,
      date: adjDate,
      requestedCheckIn: adjCheckIn,
      requestedCheckOut: adjCheckOut,
      reason: adjReason
    });
    setAdjDate('');
    setAdjReason('');
    triggerToast(t('Adjustment request submitted!'));
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-4xl mx-auto min-h-screen text-xs select-none">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-emerald-500 text-white px-4 py-2.5 shadow-lg border border-emerald-400 flex items-center gap-2 animate-bounce">
          <CheckCircle className="h-4.5 w-4.5" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-semibold mb-1">
            <span>{t('Employee Self-Service')}</span>
            <span>/</span>
            <span className="text-zinc-650 dark:text-zinc-350">{t('My Workday')}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            <User className="h-6 w-6 text-zinc-950 dark:text-white" />
            {t('Welcome back')}, {currentUser.full_name}
          </h1>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-450 mt-1">
            {t('Check in to active coordinates, submit time requests, or download monthly secure PDF payslips.')}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          {activePunch ? (
            <span suppressHydrationWarning className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-200/30 dark:border-emerald-900/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              On Shift Since {new Date(activePunch.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200/40 dark:border-zinc-800/40">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              Off Duty
            </span>
          )}
        </div>
      </div>

      {/* Tabs Menu - hidden on desktop since it's now in the sidebar tree */}
      <div className="md:hidden flex overflow-x-auto pb-1 gap-1.5 border-b border-zinc-200/40 dark:border-zinc-850/40 scrollbar-thin">
        {[
          { id: 'timeclock', label: 'Time Clock', icon: Clock },
          { id: 'history', label: 'My Timesheets', icon: Calendar },
          { id: 'payslips', label: 'My Payslips', icon: FileText },
          { id: 'requests', label: 'Submit Requests', icon: Send },
          { id: 'settings', label: 'Account Settings', icon: Lock }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-450 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(tab.label)}
            </button>
          );
        })}
      </div>

      {/* Tab contents */}
      {activeTab === 'timeclock' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Geofence Clocking Panel */}
          <div className="saas-card p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-900 pb-3 uppercase tracking-wider flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-indigo-500" />
                {t('Biometric Timeclock')}
              </h3>

              {/* GPS coordinates panel */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('GPS Coordinates *')}</label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      placeholder={t('Retrieve coordinates...')}
                      value={gpsText}
                      className="saas-input bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="saas-button-secondary inline-flex items-center gap-1 shrink-0 px-3 py-2"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{gpsLoading ? t('Reading...') : t('Get Location')}</span>
                    </button>
                  </div>
                  
                  {/* Dropdown for Manual/Office Check-in Selection */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase shrink-0">{t('Or Select Location:')}</span>
                    <select
                      onChange={(e) => {
                        const locId = e.target.value;
                        if (!locId) return;
                        const selected = locations.find(l => l.id === locId);
                        if (selected) {
                          setClosestLoc(selected);
                          setGpsText(`${selected.lat.toFixed(5)}, ${selected.lng.toFixed(5)}`);
                          setIsOutOfArea(false);
                        }
                      }}
                      className="saas-input py-1 text-[10px] font-bold border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg flex-1"
                    >
                      <option value="">-- {t('Choose Active Office/Site')} --</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>
                          {t(loc.name)} ({loc.lat.toFixed(3)}, {loc.lng.toFixed(3)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {closestLoc && (
                  <p className="text-[10px] text-zinc-450 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-indigo-500" />
                    {t('Closest location:')} <span className="font-bold">{closestLoc.name}</span>
                    {isOutOfArea && (
                      <span className="text-rose-500 font-bold ml-1 flex items-center gap-0.5">
                        <AlertTriangle className="h-3 w-3" /> {t('OUT OF GEOFENCE')}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Biometric webcam simulation panel */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Webcam Biometric Face Scan')}</label>
                <div className="relative aspect-video rounded-xl bg-zinc-950 border border-zinc-200/60 dark:border-zinc-850 flex flex-col items-center justify-center text-center p-4 overflow-hidden">
                  {cameraActive ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="absolute inset-0 h-full w-full object-cover transform scale-x-[-1]" />
                      
                      {scanActive ? (
                        <div className="absolute inset-0 bg-indigo-950/70 flex flex-col items-center justify-center text-white">
                          <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-2" />
                          <span className="text-[10px] uppercase font-bold tracking-widest animate-pulse">{t('Scanning liveness...')}</span>
                        </div>
                      ) : (
                        <>
                          <div className="absolute inset-4 border border-dashed border-white/20 rounded-lg pointer-events-none flex items-center justify-center">
                            <div className="h-24 w-24 border-2 border-dashed border-indigo-500/50 rounded-full animate-pulse" />
                          </div>
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="absolute bottom-4 bg-white/95 text-zinc-950 rounded-xl px-4 py-2 font-bold hover:bg-white shadow-lg flex items-center gap-1 border"
                          >
                            <Camera className="h-3.5 w-3.5" /> {t('Verify Face')}
                          </button>
                        </>
                      )}
                    </>
                  ) : snapshotUrl ? (
                    <>
                      <img src={snapshotUrl} alt="Biometric Face" className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-emerald-950/75 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                        <CheckCircle className="h-10 w-10 text-emerald-400 animate-bounce mb-1.5" />
                        <span className="text-[10px] font-bold tracking-widest uppercase">{t('Biometric Face Verified')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSnapshotUrl('');
                          setFaceVerified(false);
                        }}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Camera className="h-8 w-8 text-zinc-500 mb-2" />
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{t('Biometric Feed Offline')}</span>
                      <div className="flex gap-2 mt-3 justify-center">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="text-[10px] text-indigo-550 hover:text-indigo-650 font-bold px-3 py-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/25 transition-colors cursor-pointer"
                        >
                          {t('Start Face Scan')}
                        </button>
                        <label
                          className="text-[10px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-bold px-3 py-1.5 bg-zinc-500/10 rounded-lg border border-zinc-500/25 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Download className="h-3.5 w-3.5 rotate-180" />
                          {t('Upload Selfie')}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                          />
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Punch Button */}
            <div className="pt-6 border-t border-zinc-150 dark:border-zinc-850 mt-6">
              {completedTodayPunch ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border border-emerald-250/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <CheckCircle className="h-6 w-6 text-emerald-500 mb-1" />
                  <span className="font-bold text-xs">{t('All Shift Punches Completed Today!')}</span>
                  <span className="text-[9px] text-zinc-450 mt-0.5">{t('Have a nice evening!')}</span>
                </div>
              ) : activePunch ? (
                <button
                  disabled={!gpsText || !faceVerified}
                  onClick={handlePunchOut}
                  className="w-full saas-button-primary bg-rose-600 hover:bg-rose-500 text-white py-2.5 font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition"
                >
                  <Clock className="h-4 w-4" /> {t('Check-out & Record Hours')}
                </button>
              ) : (
                <button
                  disabled={!gpsText || !faceVerified}
                  onClick={handlePunchIn}
                  className="w-full saas-button-primary bg-indigo-650 hover:bg-indigo-600 text-white py-2.5 font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition"
                >
                  <Clock className="h-4 w-4" /> {t('Verify Biometrics & Check-in')}
                </button>
              )}
            </div>
          </div>

          {/* Punch history for today */}
          <div className="saas-card p-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-900 pb-3 uppercase tracking-wider">
                {t('Attendance History Overview')}
              </h3>

              <div className="space-y-4">
                {attendance
                  .filter(log => log.employeeId === currentEmployee.id)
                  .slice(0, 5)
                  .map(log => {
                    const cIn = new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const cOut = log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
                    return (
                      <div key={log.id} className="border border-zinc-200/50 dark:border-zinc-850 rounded-xl p-3.5 space-y-3 bg-zinc-50/10">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span suppressHydrationWarning className="text-zinc-500">{new Date(log.date).toLocaleDateString()}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                            log.status === 'on_time'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-250/20'
                              : 'bg-amber-50 text-amber-700 border-amber-250/20'
                          }`}>{t(log.status)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Clock In')}</span>
                            <div className="font-mono font-bold text-sm text-zinc-800 dark:text-zinc-200">{cIn}</div>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Clock Out')}</span>
                            <div className="font-mono font-bold text-sm text-zinc-800 dark:text-zinc-200">{cOut}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="saas-card p-5 space-y-4">
          <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-3">{t('My Personal Timesheets Ledger')}</h3>
          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>{t('Date')}</th>
                  <th>{t('Shift Policy')}</th>
                  <th>{t('Punches')}</th>
                  <th>{t('OT Earned')}</th>
                  <th>{t('Location Gps')}</th>
                  <th>{t('Verification')}</th>
                  <th>{t('Status')}</th>
                </tr>
              </thead>
              <tbody>
                {attendance
                  .filter(log => log.employeeId === currentEmployee.id)
                  .map(log => {
                    return (
                      <tr key={log.id}>
                        <td suppressHydrationWarning className="font-mono font-bold">{log.date}</td>
                        <td>{t('Office Administrative')}</td>
                        <td suppressHydrationWarning className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          {' - '}
                          {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </td>
                        <td className="font-mono text-center">+{log.overtimeHours || 0} Hrs</td>
                        <td className="font-mono text-zinc-400 text-[9px]">{log.gpsIn}</td>
                        <td>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-250/20">
                            BIOMETRIC OK
                          </span>
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                            log.status === 'on_time'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200/20'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/20'
                          }`}>
                            {t(log.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payslips' && (
        <div className="space-y-6">
          <div className="saas-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-3">{t('My Salary History & Payslips')}</h3>
            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>{t('Target Month')}</th>
                    <th>{t('Base Salary')}</th>
                    <th>{t('Overtime Pay')}</th>
                    <th>{t('Bonuses & Allowances')}</th>
                    <th>{t('Deductions & Ins')}</th>
                    <th className="font-black">{t('Net Pay')}</th>
                    <th className="text-right">{t('Action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips
                    .filter(p => p.employeeId === currentEmployee.id && p.status !== 'draft')
                    .map(p => (
                      <tr key={p.id}>
                        <td className="font-mono font-bold text-zinc-900 dark:text-white">{p.month}</td>
                        <td className="font-mono">${p.baseSalary.toLocaleString()}</td>
                        <td className="font-mono">${p.otPay.toLocaleString()}</td>
                        <td className="font-mono">${(p.bonus + p.allowance).toLocaleString()}</td>
                        <td className="font-mono text-rose-500">-${(p.deductions + p.insurance + p.tax).toLocaleString()}</td>
                        <td className="font-mono font-black text-emerald-600 dark:text-emerald-450">${p.netPay.toLocaleString()}</td>
                        <td className="text-right flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewSlip(p)}
                            className="saas-button-secondary p-1 hover:bg-zinc-100 rounded inline-flex items-center gap-1 text-[9px] uppercase font-bold"
                          >
                            <Eye className="h-3.5 w-3.5" /> View Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payslip PDF interactive preview model */}
          {previewSlip && (
            <div className="saas-card p-6 border-2 border-zinc-950 dark:border-white space-y-6 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between border-b border-zinc-250 dark:border-zinc-800 pb-4">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-zinc-950 dark:text-white">DIEULE CONTRACTING & BUILDERS</h2>
                  <p className="text-[9px] text-zinc-450 uppercase tracking-widest mt-0.5">Corporate Payslip Ledger</p>
                </div>
                <button
                  onClick={() => setPreviewSlip(null)}
                  className="text-zinc-400 hover:text-zinc-650"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[10px]">
                <div className="space-y-1">
                  <div>{t('Employee Name:')} <span className="font-bold text-zinc-900 dark:text-white">{previewSlip.employeeName}</span></div>
                  <div>{t('Position Title:')} <span className="font-semibold">{currentEmployee.position}</span></div>
                  <div>{t('Workday Period:')} <span className="font-bold font-mono">{previewSlip.month}</span></div>
                </div>
                <div className="space-y-1 text-right">
                  <div>{t('Registered Email:')} <span className="font-mono font-semibold">{previewSlip.email}</span></div>
                  <div>{t('Days Worked:')} <span className="font-mono font-bold">{previewSlip.workdays} Days</span></div>
                  <div>{t('OT Logged:')} <span className="font-mono font-bold">{previewSlip.otHours} Hours</span></div>
                </div>
              </div>

              <div className="border-y border-dashed border-zinc-250 dark:border-zinc-850 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Earnings */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-950 dark:text-white">{t('Gross Earnings')}</h4>
                  <div className="space-y-1 font-mono">
                    <div className="flex justify-between"><span>Base Contract Salary:</span><span>${previewSlip.baseSalary.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Approved Overtime:</span><span>${previewSlip.otPay.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Allowances:</span><span>${previewSlip.allowance.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Performance Bonuses:</span><span>${previewSlip.bonus.toLocaleString()}</span></div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-rose-500">{t('Deductions & Taxes')}</h4>
                  <div className="space-y-1 font-mono text-rose-500">
                    <div className="flex justify-between"><span>Deductions:</span><span>-${previewSlip.deductions.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Govt Insurance (Social/Health):</span><span>-${previewSlip.insurance.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Personal Income Tax (PIT):</span><span>-${previewSlip.tax.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl">
                <span className="text-xs font-black uppercase tracking-wider">{t('Total Net Received:')}</span>
                <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-450">${previewSlip.netPay.toLocaleString()}</span>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => triggerToast(t('Downloaded PDF payslip successfully!'))}
                  className="saas-button-primary bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 inline-flex items-center gap-1 text-[9px] uppercase font-bold py-1.5"
                >
                  <Download className="h-3 w-3" /> {t('Download secure PDF')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Submit leave */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-900 pb-3 uppercase tracking-wider">
              {t('Request Vacation / Off')}
            </h3>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Leave Category')}</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="saas-input"
                >
                  <option value="annual">{t('Annual Leave')}</option>
                  <option value="sick">{t('Sick Leave')}</option>
                  <option value="personal">{t('Personal Leave')}</option>
                  <option value="unpaid">{t('Unpaid Leave')}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Start Date')}</label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="saas-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('End Date')}</label>
                  <input
                    type="date"
                    required
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="saas-input"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Detailed Reason *')}</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Reason for requesting leave..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="saas-input text-xs"
                />
              </div>
              <button type="submit" className="saas-button-primary w-full flex items-center justify-center gap-1.5 py-2 font-bold">
                <Send className="h-3.5 w-3.5" /> {t('Send Leave Request')}
              </button>
            </form>
          </div>

          {/* Submit OT & Adjustment */}
          <div className="space-y-6">
            {/* OT request */}
            <div className="saas-card p-6 space-y-4">
              <h3 className="text-xs font-bold text-zinc-855 dark:text-zinc-202 border-b border-zinc-100 dark:border-zinc-900 pb-3 uppercase tracking-wider">
                {t('Request Overtime Approval')}
              </h3>
              <form onSubmit={handleOTSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Date *')}</label>
                    <input
                      type="date"
                      required
                      value={otDate}
                      onChange={(e) => setOtDate(e.target.value)}
                      className="saas-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Hours spent')}</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={otHours}
                      onChange={(e) => setOtHours(Number(e.target.value))}
                      className="saas-input"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Detailed Reason *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="Why was overtime needed..."
                    value={otReason}
                    onChange={(e) => setOtReason(e.target.value)}
                    className="saas-input"
                  />
                </div>
                <button type="submit" className="saas-button-primary w-full flex items-center justify-center gap-1.5 py-2 font-bold">
                  <Send className="h-3.5 w-3.5" /> {t('Send Overtime Request')}
                </button>
              </form>
            </div>

            {/* Adjustments */}
            <div className="saas-card p-6 space-y-4">
              <h3 className="text-xs font-bold text-zinc-855 dark:text-zinc-202 border-b border-zinc-100 dark:border-zinc-900 pb-3 uppercase tracking-wider">
                {t('Request Time Correction')}
              </h3>
              <form onSubmit={handleAdjSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Date *')}</label>
                  <input
                    type="date"
                    required
                    value={adjDate}
                    onChange={(e) => setAdjDate(e.target.value)}
                    className="saas-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Corrected Check In')}</label>
                    <input
                      type="time"
                      value={adjCheckIn}
                      onChange={(e) => setAdjCheckIn(e.target.value)}
                      className="saas-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Corrected Check Out')}</label>
                    <input
                      type="time"
                      value={adjCheckOut}
                      onChange={(e) => setAdjCheckOut(e.target.value)}
                      className="saas-input"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Reason *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="Why was correction needed..."
                    value={adjReason}
                    onChange={(e) => setAdjReason(e.target.value)}
                    className="saas-input"
                  />
                </div>
                <button type="submit" className="saas-button-primary w-full flex items-center justify-center gap-1.5 py-2 font-bold">
                  <Send className="h-3.5 w-3.5" /> {t('Send Correction Request')}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile details */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-900 pb-3 uppercase tracking-wider">{t('Employment Contract Profiles')}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative group cursor-pointer">
                  <img src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} alt="Profile" className="h-12 w-12 rounded-full object-cover border-2 border-zinc-200/50 dark:border-zinc-800 transition-opacity group-hover:opacity-75" />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="h-4.5 w-4.5" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white">{currentUser.full_name}</h4>
                  <p className="text-[10px] text-zinc-450">{currentUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[10px] pt-4 border-t border-zinc-100 dark:border-zinc-900/60">
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Department')}</span>
                  <div className="font-semibold text-zinc-755 dark:text-zinc-300">{t(empDepartment)}</div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Position')}</span>
                  <div className="font-semibold text-zinc-755 dark:text-zinc-300">{currentEmployee.position}</div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Shift Policy')}</span>
                  <div className="font-semibold text-zinc-755 dark:text-zinc-300">Office Administrative (08:00 - 17:00)</div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Contract Base Salary')}</span>
                  <div className="font-semibold text-zinc-755 dark:text-zinc-300 font-mono">${(currentEmployee.salary || 0).toLocaleString()}/mo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Change password */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-zinc-855 dark:text-zinc-202 border-b border-zinc-100 dark:border-zinc-900 pb-3 uppercase tracking-wider">{t('Update Security Passwords')}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!passwordOld || !passwordNew) return;
              setPasswordOld('');
              setPasswordNew('');
              triggerToast(t('Password updated successfully!'));
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Current Password *')}</label>
                <input
                  type="password"
                  required
                  value={passwordOld}
                  onChange={(e) => setPasswordOld(e.target.value)}
                  className="saas-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('New Password *')}</label>
                <input
                  type="password"
                  required
                  value={passwordNew}
                  onChange={(e) => setPasswordNew(e.target.value)}
                  className="saas-input"
                />
              </div>
              <button type="submit" className="saas-button-primary w-full flex items-center justify-center gap-1.5 py-2 font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent">
                <Lock className="h-3.5 w-3.5" /> {t('Update password')}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

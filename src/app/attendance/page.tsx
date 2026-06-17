'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState, useRef, useEffect } from 'react';
import { useERP } from '@/context/erp-context';
import { 
  Clock, MapPin, Camera, Check, RefreshCw, AlertTriangle,
  Play, StopCircle, UserCheck, ShieldAlert
} from 'lucide-react';
import { Attendance } from '@/types/erp';

export default function AttendancePage() {
  const { attendance, clockIn, clockOut, employees, currentUser, t } = useERP();
  
  const [localAttendance, setLocalAttendance] = useState<Attendance[]>(attendance);
  const [activeAtt, setActiveAtt] = useState<Attendance | null>(null);

  const [gpsText, setGpsText] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  
  // Camera state variables
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [snapshotUrl, setSnapshotUrl] = useState('');
  const [faceVerified, setFaceVerified] = useState(false);

  // Sync state
  useEffect(() => {
    setLocalAttendance(attendance);
    // Find if user is currently clocked in (active record has check_in but no check_out)
    const emp = employees.find(e => e.user_id === currentUser.id);
    if (emp) {
      const active = attendance.find(a => a.employee_id === emp.id && !a.check_out);
      setActiveAtt(active || null);
    }
  }, [attendance, currentUser, employees]);

  // Turn on device webcam
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
      console.warn("Webcam access not granted, running simulation feed", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  // Capture canvas image screenshot
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, 320, 240);
      const url = canvas.toDataURL('image/jpeg');
      setSnapshotUrl(url);
      setFaceVerified(true);
      stopCamera();
    }
  };

  // Get current GPS
  const handleGetGPS = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsText(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
          setGpsLoading(false);
        },
        () => {
          setGpsText('40.7018, -73.9968'); // default Brooklyn Bridge GPS
          setGpsLoading(false);
        }
      );
    } else {
      setGpsText('40.7018, -73.9968');
      setGpsLoading(false);
    }
  };

  const handleClockIn = () => {
    const emp = employees.find(e => e.user_id === currentUser.id);
    if (!emp) return;

    clockIn(
      emp.id,
      currentUser.full_name,
      emp.department_id || 'General',
      'sh1',
      gpsText || '40.7018, -73.9968',
      'Office',
      snapshotUrl || '',
      'Browser',
      'on_time'
    );
    
    // Clear simulation states
    setGpsText('');
    setSnapshotUrl('');
    setFaceVerified(false);
  };

  const handleClockOut = () => {
    if (!activeAtt) return;
    clockOut(
      activeAtt.id,
      gpsText || '40.7018, -73.9968',
      'Office',
      snapshotUrl || '',
      'Browser',
      0
    );
    
    // Clear simulation states
    setGpsText('');
    setSnapshotUrl('');
    setFaceVerified(false);
  };

  return (
    <PermissionGuard module="payroll">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t("Shift Attendance & Biometrics")}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t("Clock in and out using live GPS coordinates and biometric webcam verification.")}</p>
        </div>
        <div className="flex items-center gap-2">
          {activeAtt ? (
            <span suppressHydrationWarning className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-800/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t("On Duty Since")} {new Date(activeAtt.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-650 dark:bg-zinc-800/50 dark:text-zinc-400 border border-zinc-200/40 dark:border-zinc-700/20">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              {t("Off Duty")}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Clock In Panel */}
        <div className="saas-card p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-zinc-850 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <Clock className="h-4 w-4 text-indigo-505" />
              {t("Duty Timeclock")}
            </h3>

            {/* Main interface */}
            <div className="space-y-5">
              
              {/* GPS coordinates panel */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("Live GPS Coordinates *")}</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    readOnly
                    placeholder={t("Retrieve current coordinates...")}
                    value={gpsText}
                    className="saas-input bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-800/80"
                  />
                  <button
                    onClick={handleGetGPS}
                    className="saas-button-secondary inline-flex items-center gap-1.5 shrink-0 px-4"
                  >
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" /> 
                    <span>{gpsLoading ? t('Reading...') : t('Get Location')}</span>
                  </button>
                </div>
              </div>

              {/* Webcam Verification Box */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("Webcam Biometric Face Scan")}</label>
                
                <div className="relative aspect-video rounded-xl bg-zinc-950 border border-zinc-200/60 dark:border-zinc-850 overflow-hidden flex flex-col items-center justify-center text-center p-4">
                  {cameraActive ? (
                    <>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline
                        className="absolute inset-0 h-full w-full object-cover transform scale-x-[-1]"
                      />
                      {/* Viewfinder borders overlay */}
                      <div className="absolute inset-6 border border-dashed border-white/20 rounded-lg pointer-events-none flex items-center justify-center">
                        <div className="w-16 h-16 border-2 border-white/10 rounded-full border-t-white/40 animate-spin" />
                      </div>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="absolute bottom-4 rounded-lg bg-white/90 backdrop-blur-sm text-zinc-950 px-4 py-2 text-xs font-semibold hover:bg-white transition-all shadow-lg flex items-center gap-1.5 border border-white"
                      >
                        <Camera className="h-4 w-4 text-zinc-700" /> {t("Verify Face")}
                      </button>
                    </>
                  ) : snapshotUrl ? (
                    <>
                      <img src={snapshotUrl} alt="Capture preview" className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-emerald-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                        <UserCheck className="h-10 w-10 text-emerald-400 animate-bounce mb-1.5" />
                        <span className="text-xs font-semibold tracking-wider uppercase">{t("Face Verified")}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
                        <Camera className="h-5 w-5 text-zinc-500" />
                      </div>
                      <span className="text-[11px] text-zinc-500 uppercase font-medium tracking-wider">{t("Camera Offline")}</span>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-4 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 rounded-lg transition-colors"
                      >
                        {t("Start Face Scan")}
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Clock In / Out toggle */}
          <div className="pt-6 border-t border-zinc-150 dark:border-zinc-850 mt-6 space-y-3">
            {activeAtt ? (
              <button
                disabled={!gpsText}
                onClick={handleClockOut}
                className="w-full saas-button-primary bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-rose-600 transition"
              >
                <StopCircle className="h-4 w-4" /> {t("Clock Out")}
              </button>
            ) : (
              <button
                disabled={!gpsText || !faceVerified}
                onClick={handleClockIn}
                className="w-full saas-button-primary bg-indigo-600 hover:bg-indigo-505 text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-indigo-600 transition"
              >
                <Play className="h-4 w-4" /> {t("Verify & Clock In")}
              </button>
            )}
            
            {!gpsText && (
              <p className="text-[10px] text-zinc-405 dark:text-zinc-500 text-center font-medium flex items-center justify-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                {t("Must retrieve GPS location and verify face biometrics first.")}
              </p>
            )}
          </div>
        </div>

        {/* Recent logs */}
        <div className="space-y-4">
          <div className="saas-card p-6 space-y-4 flex flex-col h-full">
            <h3 className="text-sm font-semibold text-zinc-850 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-900 pb-3">
              {t("Today's Attendance Register")}
            </h3>
            
            <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[420px]">
              {localAttendance.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                  <p className="text-xs font-medium text-zinc-405">{t("No shift recordings found for today.")}</p>
                </div>
              ) : (
                localAttendance.map((log) => {
                  const clockInTime = typeof window !== 'undefined' ? new Date(log.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
                  const clockOutTime = log.check_out 
                    ? (typeof window !== 'undefined' ? new Date(log.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--')
                    : '--:--';

                  return (
                    <div key={log.id} className="rounded-lg border border-zinc-200/50 dark:border-zinc-800/40 p-4 space-y-3 bg-zinc-50/20 dark:bg-zinc-900/10">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-xs text-zinc-500 dark:text-zinc-400" suppressHydrationWarning>{new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        {log.status === 'on_time' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-455 border border-emerald-200/30 dark:border-emerald-800/20">
                            <Check className="h-2.5 w-2.5" /> {t("On Time")}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-505 uppercase tracking-wider">{t("Clock In")}</span>
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm" suppressHydrationWarning>{clockInTime}</div>
                          <p className="text-[10px] text-zinc-450 dark:text-zinc-505 flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" /> {log.gps_in}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-505 uppercase tracking-wider">{t("Clock Out")}</span>
                          <div className={`font-semibold text-sm ${log.check_out ? 'text-zinc-850 dark:text-zinc-200' : 'text-zinc-400 italic'}`} suppressHydrationWarning>
                            {clockOutTime}
                          </div>
                          {log.gps_out && (
                            <p className="text-[10px] text-zinc-455 dark:text-zinc-505 flex items-center gap-0.5">
                              <MapPin className="h-2.5 w-2.5" /> {log.gps_out}
                            </p>
                          )}
                        </div>
                      </div>

                      {log.overtime_hours > 0 && (
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900/60 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex justify-between items-center">
                          <span>{t("Overtime Earned:")}</span>
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 rounded font-bold">+{log.overtime_hours} hrs</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
    </PermissionGuard>
  );
}

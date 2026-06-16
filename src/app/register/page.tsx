'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Lock, Mail, User, Loader2, ShieldAlert, Activity, Building2, Briefcase } from 'lucide-react';

const COMPANIES_OPTIONS = [
  { id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'Công ty Cổ phần Xây dựng Dieule' },
  { id: 'c8b671a8-ff69-42b7-a37a-77c86f7882c2', name: 'Nhà cung cấp Vật liệu Xây dựng Dieule' },
  { id: 'c8b671a8-ff69-42b7-a37a-77c86f7883c3', name: 'Tổng công ty Đầu tư & Xây dựng Summit' }
];

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES_OPTIONS[0].id);
  const [selectedRole, setSelectedRole] = useState('Employee');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Sign up user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) {
      setError('Đăng ký không thành công, vui lòng thử lại.');
      setLoading(false);
      return;
    }
    router.push('/');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-lg space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
            <Activity className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-2xl font-black tracking-tight text-white">
            Đăng ký thành viên mới
          </h2>
          <p className="mt-2 text-xs text-zinc-400">
            Tạo tài khoản và chọn vai trò của bạn trong hệ thống ERP
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="mt-8 space-y-5">
          <div className="space-y-4 rounded-md">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Họ và tên
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 pl-10 pr-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Địa chỉ Email
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 pl-10 pr-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Mật khẩu
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Tối thiểu 6 ký tự)"
                  minLength={6}
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 pl-10 pr-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Doanh nghiệp
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Building2 className="h-4 w-4" />
                </div>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 pl-10 pr-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none"
                >
                  {COMPANIES_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id} className="bg-zinc-900">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Đăng ký tài khoản'
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-zinc-450 border-t border-zinc-800/80 pt-4">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Đăng nhập ngay
          </Link>
        </div>

      </div>
    </div>
  );
}

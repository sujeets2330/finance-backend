'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, TrendingUp, Wallet, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'VIEWER' | 'ANALYST' | 'ADMIN'>('VIEWER');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isLogin 
            ? { email, password }
            : { name, email, password, role }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Something went wrong');
        return;
      }

      let token, user;
      
      if (data.data && data.data.token) {
        token = data.data.token;
        user = data.data.user;
      } else if (data.token) {
        token = data.token;
        user = data.user;
      } else {
        throw new Error('Invalid response format');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      router.push('/dashboard');
    } catch (error) {
      alert('Network error. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Side - Hero Section */}
            <div className="text-white space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-400 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold">FinanceHub</h1>
              </div>
              
              <h2 className="text-4xl font-bold leading-tight">
                Smart Financial<br />
                <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  Management System
                </span>
              </h2>
              
              <p className="text-slate-300 text-lg">
                Track your income, manage expenses, and gain powerful insights with our comprehensive finance dashboard.
              </p>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-slate-300">Real-time analytics & insights</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-teal-400" />
                  </div>
                  <span className="text-slate-300">Secure role-based access control</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-slate-300">Income & expense tracking</span>
                </div>
              </div>
            </div>

            {/* Right Side - Login/Register Card */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-white">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </CardTitle>
                <p className="text-slate-300 text-sm">
                  {isLogin ? 'Sign in to access your dashboard' : 'Get started with your free account'}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Full Name
                        </label>
                        <Input
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required={!isLogin}
                          disabled={isLoading}
                          className="bg-white/20 border-white/30 text-white placeholder:text-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Role
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value as 'VIEWER' | 'ANALYST' | 'ADMIN')}
                          className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isLoading}
                        >
                          <option value="VIEWER" className="bg-slate-800">Viewer (View Only)</option>
                          <option value="ANALYST" className="bg-slate-800">Analyst (View & Create)</option>
                          <option value="ADMIN" className="bg-slate-800">Admin (Full Access)</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-white/20 border-white/30 text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-white/20 border-white/30 text-white placeholder:text-slate-400"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold py-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isLogin ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      <>
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="text-center pt-4 border-t border-white/20">
                    <p className="text-sm text-slate-300">
                      {isLogin ? "Don't have an account? " : 'Already have an account? '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setEmail('');
                          setPassword('');
                          setName('');
                        }}
                        className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                        disabled={isLoading}
                      >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                      </button>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
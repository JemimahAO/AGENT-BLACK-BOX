import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSession } from '@/contexts/SessionContext';
import { UserPlus, User, Mail, Lock, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await register(name, email, company, password);
      if (error) {
        toast.error('Registration failed', { description: error.message });
      } else {
        toast.success('Account created', { description: 'Welcome to AgentBlackbox' });
        navigate('/command-center');
      }
    } catch (err) {
      toast.error('Registration error', { description: String(err) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-0">
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Branding */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/25 to-primary/10 border border-primary/35 flex items-center justify-center glow-amber">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary w-7 h-7">
                <path d="M10 2 L16 6 L16 14 L10 18 L4 14 L4 6 Z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
                <path d="M10 6 L14 9 L14 14 L10 17 L6 14 L6 9 Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Create Demo Workspace</h1>
            <p className="text-sm text-muted-foreground">Get started with AgentBlackbox</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-muted/30 backdrop-blur-sm overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="p-6 space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Full Name</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border/40 bg-background/50 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Jemimah Adwar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Email Address</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border/40 bg-background/50 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                {/* Company/Workspace Field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Company/Workspace</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border/40 bg-background/50 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Acme Corporation"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Password</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border/40 bg-background/50 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                {/* Create Account Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/85 font-bold py-2.5 h-auto glow-amber"
                >
                  {isLoading ? (
                    <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />Creating...</>
                  ) : (
                    <><UserPlus className="w-4 h-4 mr-2" />Create Demo Workspace</>
                  )}
                </Button>

                {/* Login Link */}
                <div className="text-center text-xs text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline font-semibold">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center text-[10px] text-muted-foreground/60 space-y-2">
            <p>This is a demo application. No account data is stored.</p>
            <p>Session data uses browser localStorage only.</p>
          </div>
        </div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

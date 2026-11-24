import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  UserCheck,
  Store,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  AlertCircle
} from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthPage() {
  const { login, loginWithCredentials, register, authError } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('student');
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form fields
  const [identifier, setIdentifier] = useState('aarav.sharma@dtu.ac.in');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNumber, setRollNumber] = useState('');

  const accountTypes = [
    {
      id: 'student',
      title: 'Student Login',
      icon: GraduationCap,
      description: 'Order food, track tokens and skip queues with university ID'
    },
    {
      id: 'staff',
      title: 'Staff / Faculty',
      icon: Briefcase,
      description: 'Faculty dining pre-orders and express counter pickup'
    },
    {
      id: 'guest',
      title: 'Guest / Parent',
      icon: UserCheck,
      description: 'Direct browsing and order placement without account registration'
    },
    {
      id: 'canteen_owner',
      title: 'Canteen Owner',
      icon: Store,
      description: 'Live kitchen orders, token scanner, menu and slot configuration'
    }
  ];

  const handleRoleSelect = async (roleId) => {
    setSelectedRole(roleId);
    setErrorMsg('');
    if (roleId === 'canteen_owner') setAuthMode('login');
    if (roleId === 'student') {
      setIdentifier('aarav.sharma@dtu.ac.in');
    } else if (roleId === 'staff') {
      setIdentifier('meenakshi.s@dtu.ac.in');
    } else if (roleId === 'canteen_owner') {
      setIdentifier('ramesh.nescafe@campus.in');
    } else if (roleId === 'guest') {
      try {
        await login('guest');
        navigate('/select-university');
      } catch (error) {
        setSelectedRole('student');
        setErrorMsg(error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMode === 'login') {
      if (!identifier.trim()) {
        setErrorMsg('Please enter your email or mobile phone');
        return;
      }
      try {
        const signedInUser = await loginWithCredentials(identifier, password);
        if (signedInUser.role === 'canteen_owner') {
          navigate('/owner/dashboard');
        } else if (signedInUser.role === 'university_admin') {
          navigate('/university-admin/dashboard');
        } else if (signedInUser.role === 'platform_admin') {
          navigate('/platform-admin/dashboard');
        } else {
          navigate('/select-university');
        }
      } catch (error) {
        setErrorMsg(error.message);
      }
    } else {
      if (!name.trim() || !identifier.trim()) {
        setErrorMsg('Please complete all required fields');
        return;
      }
      try {
        const registeredUser = await register({
          name,
          email: identifier,
          password,
          phone,
          rollNumber,
          role: selectedRole
        });
        navigate('/select-university');
      } catch (error) {
        setErrorMsg(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-brandBg-light dark:bg-brandBg-dark text-brandText-primary dark:text-brandText-darkPrimary flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Top Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-xs sm:text-sm text-forest dark:text-cream">
          <span>← Back to Home</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="max-w-5xl w-full mx-auto my-auto py-6">
        <div className="text-center max-w-lg mx-auto mb-8">
          <BrandLogo className="w-14 h-14 rounded-2xl shadow-subtle mx-auto mb-3" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brandText-primary dark:text-cream">
            Welcome to Where is my Canteen
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1.5">
            Select your account type to proceed with campus dining
          </p>
        </div>

        {/* 4 Account Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {accountTypes.map(type => {
            const Icon = type.icon;
            const isSelected = selectedRole === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleRoleSelect(type.id)}
                className={`p-5 rounded-2xl border text-left transition-all duration-200 relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-forest bg-white dark:bg-brandCard-dark shadow-soft ring-2 ring-forest/20'
                    : 'border-brandBorder-light dark:border-brandBorder-dark bg-white/80 dark:bg-brandCard-dark/60 hover:border-sage'
                }`}
              >
                <div>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-primary text-white' : 'bg-cream-100 dark:bg-brandBorder-dark text-forest dark:text-cream'
                  }`}>
                    <Icon className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <h3 className="font-bold text-sm text-brandText-primary dark:text-brandText-darkPrimary mb-1">
                    {type.title}
                  </h3>
                  <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary leading-relaxed">
                    {type.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-brandBorder-light dark:border-brandBorder-dark flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isSelected ? 'text-forest dark:text-cream' : 'text-brandText-secondary'}`}>
                    {type.id === 'guest' ? 'Browse Directly' : isSelected ? 'Selected' : 'Choose'}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-forest dark:text-cream stroke-[2]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Authentication Card (if not guest) */}
        {selectedRole !== 'guest' && (
          <div className="max-w-md mx-auto bg-white dark:bg-brandCard-dark rounded-3xl border border-brandBorder-light dark:border-brandBorder-dark p-6 sm:p-8 shadow-soft">
            {selectedRole !== 'canteen_owner' && (
              <div className="flex rounded-2xl bg-cream-100 dark:bg-brandBorder-dark/40 p-1 mb-6 text-xs font-semibold border border-brandBorder-light dark:border-brandBorder-dark">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 rounded-xl transition ${
                    authMode === 'login'
                      ? 'bg-white dark:bg-brandCard-dark text-brandText-primary dark:text-cream shadow-subtle'
                      : 'text-brandText-secondary'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 rounded-xl transition ${
                    authMode === 'register'
                      ? 'bg-white dark:bg-brandCard-dark text-brandText-primary dark:text-cream shadow-subtle'
                      : 'text-brandText-secondary'
                  }`}
                >
                  New Registration
                </button>
              </div>
            )}

            {selectedRole === 'canteen_owner' && (
              <div className="mb-6 p-3 rounded-2xl bg-sage-50 dark:bg-forest/40 border border-sage-300 dark:border-forest text-xs text-forest dark:text-cream flex items-center gap-2">
                <Store className="w-4 h-4 flex-shrink-0" />
                <span>Authorized Canteen Partner Portal Access</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {!errorMsg && authError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block font-semibold text-brandText-primary dark:text-cream mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBorder-dark/40 text-brandText-primary dark:text-cream focus:outline-none focus:border-sage"
                    />
                  </div>

                  {selectedRole === 'student' && (
                    <div>
                      <label className="block font-semibold text-brandText-primary dark:text-cream mb-1">
                        University Roll Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2023/CS/104"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBorder-dark/40 text-brandText-primary dark:text-cream focus:outline-none focus:border-sage"
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block font-semibold text-brandText-primary dark:text-cream mb-1">
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="name@university.ac.in or +91..."
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBorder-dark/40 text-brandText-primary dark:text-cream focus:outline-none focus:border-sage"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-brandText-primary dark:text-cream">
                    Password
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => alert('Password reset link sent to your registered campus email.')}
                      className="text-[11px] text-forest dark:text-sage-300 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={authMode === 'register' ? 8 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBorder-dark/40 text-brandText-primary dark:text-cream focus:outline-none focus:border-sage pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-brandText-secondary hover:text-brandText-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-primary text-white font-bold hover:bg-primary-600 transition flex items-center justify-center gap-2 shadow-subtle mt-2"
              >
                <span>{authMode === 'login' ? 'Sign In to Campus' : 'Create Student Account'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </button>
            </form>
          </div>
        )}

        {/* Security & Admin Disclaimer */}
        <div className="mt-8 text-center text-xs text-brandText-secondary">
          <p>
            Privileged administrative roles (University & Platform Admins) require approved authority authorization.
          </p>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs font-semibold text-forest dark:text-sage-300">
            <button
              onClick={() => {
                login('university_admin')
                  .then(() => navigate('/university-admin/dashboard'))
                  .catch(error => setErrorMsg(error.message));
              }}
              className="hover:underline"
            >
              University Admin Portal →
            </button>
            <span>•</span>
            <button
              onClick={() => {
                login('platform_admin')
                  .then(() => navigate('/platform-admin/dashboard'))
                  .catch(error => setErrorMsg(error.message));
              }}
              className="hover:underline"
            >
              Platform Administration →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

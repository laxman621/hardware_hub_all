
   import React, { useState } from 'react'
   import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
    skill: '',
    experienceYears: '',
    hourlyRate: '',
    bio: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.role === 'professional' && !formData.skill) {
      setError('Skill is required for professional registration');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          role: formData.role,
          skill: formData.role === 'professional' ? formData.skill : undefined,
          experienceYears: formData.role === 'professional' && formData.experienceYears !== '' ? Number(formData.experienceYears) : undefined,
          hourlyRate: formData.role === 'professional' && formData.hourlyRate !== '' ? Number(formData.hourlyRate) : undefined,
          bio: formData.role === 'professional' ? formData.bio || undefined : undefined,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('Registration successful! Redirecting to login...');
      // Store token if needed
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-5 py-12 relative overflow-hidden bg-gradient-radial">
      <section className="relative z-10 w-full max-w-4xl grid md:grid-cols-[1fr_1.05fr] bg-slate-50 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-100 flex flex-col gap-6">
          <span className="self-start bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-300 px-3 py-2 rounded-full text-xs uppercase tracking-[0.18em]">
            New Member
          </span>
          <h1 className="m-0 text-4xl md:text-5xl font-bold tracking-tight">Build your hub</h1>
          <p className="m-0 text-slate-300/80 leading-relaxed">
            Create an account to manage rentals, track repairs, and keep your
            parts list organized.
          </p>
          <div className="flex gap-8">
            <div className="flex flex-col gap-1.5">
              <strong className="text-2xl text-slate-400">48h</strong>
              <span className="text-sm text-slate-400">Fast onboarding</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <strong className="text-2xl text-slate-400">1-stop</strong>
              <span className="text-sm text-slate-400">Service desk</span>
            </div>
          </div>
        </div>

        <form className="p-12 flex flex-col gap-4 bg-slate-50" onSubmit={handleSubmit}>
          <div>
            <h2 className="m-0 text-3xl font-bold">Create account</h2>
            <p className="mt-1.5 mb-0 text-slate-600">Sign up to start your build journey.</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
              {success}
            </div>
          )}

          <label className="flex flex-col gap-2 text-sm text-slate-900">
            <span>Full name</span>
            <input
              type="text"
              name="name"
              placeholder="Alex Morgan"
              required
              value={formData.name}
              onChange={handleChange}
              className="border border-slate-300 rounded-xl px-3.5 py-3 text-base bg-slate-100 outline-none transition-all focus:border-slate-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-900">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="you@hardwarehub.com"
              required
              value={formData.email}
              onChange={handleChange}
              className="border border-slate-300 rounded-xl px-3.5 py-3 text-base bg-slate-100 outline-none transition-all focus:border-slate-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-900">
            <span>Phone (optional)</span>
            <input
              type="tel"
              name="phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
              className="border border-slate-300 rounded-xl px-3.5 py-3 text-base bg-slate-100 outline-none transition-all focus:border-slate-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-900">
            <span>Register as</span>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border border-slate-300 rounded-xl px-3.5 py-3 text-base bg-slate-100 outline-none transition-all focus:border-slate-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
            >
              <option value="user">User</option>
              <option value="professional">Professional</option>
            </select>
          </label>

          {formData.role === 'professional' && (
            <>
              <label className="flex flex-col gap-2 text-sm text-slate-900">
                <span>Skill</span>
                <input
                  type="text"
                  name="skill"
                  required
                  placeholder="Electrician"
                  value={formData.skill}
                  onChange={handleChange}
                  className="border border-slate-300 rounded-xl px-3.5 py-3 text-base bg-slate-100 outline-none transition-all focus:border-slate-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-900">
                <span>Experience Years (optional)</span>
                <input
                  type="number"
                  min="0"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  className="border border-slate-300 rounded-xl px-3.5 py-3 text-base bg-slate-100 outline-none transition-all focus:border-slate-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-900">
                <span>Hourly Rate NPR (optional)</span>
                <input
                  type="number"
                  min="0"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  className="border border-slate-300 rounded-xl px-3.5 py-3 text-base bg-slate-100 outline-none transition-all focus:border-slate-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-900">
                <span>Bio (optional)</span>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  className="border border-slate-300 rounded-xl px-3.5 py-3 text-base bg-slate-100 outline-none transition-all focus:border-slate-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
                />
              </label>
            </>
          )}

          <label className="flex flex-col gap-2 text-sm text-slate-900">
            <span>Password</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-3 pr-12 text-base bg-slate-100 outline-none transition-all focus:border-slate-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-900">
            <span>Confirm password</span>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Re-enter your password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-3 pr-12 text-base bg-slate-100 outline-none transition-all focus:border-slate-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" required />
            I agree to the terms and privacy policy
          </label>

          <button
            className="border-0 rounded-xl px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-slate-950 font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="relative text-center text-xs text-slate-500 before:content-[''] before:absolute before:top-1/2 before:left-0 before:w-[36%] before:h-px before:bg-slate-300 after:content-[''] after:absolute after:top-1/2 after:right-0 after:w-[36%] after:h-px after:bg-slate-300">
            <span>or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="border border-slate-300 rounded-xl px-3 py-2.5 bg-white cursor-pointer font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Google
            </button>
            <button
              type="button"
              className="border border-slate-300 rounded-xl px-3 py-2.5 bg-white cursor-pointer font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
            >
              GitHub
            </button>
          </div>

          <p className="m-0 text-center text-slate-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 font-semibold no-underline hover:underline">Sign in</Link>
          </p>
        </form>
      </section>
    </div>
  )
}


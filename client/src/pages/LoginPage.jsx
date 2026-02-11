import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      toast.success('Welcome back');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="glass-card p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold racing-title text-trackRed">Login</h1>
        <input className="w-full p-2 rounded bg-black/40" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="w-full p-2 rounded bg-black/40" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="w-full bg-trackRed py-2 rounded">Sign In</button>
        <p className="text-sm text-white/70">No account? <Link to="/register" className="text-trackRed">Register</Link></p>
      </form>
    </div>
  );
};

export default LoginPage;

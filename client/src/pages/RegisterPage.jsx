import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      toast.success('Account created');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="glass-card p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold racing-title text-trackRed">Register</h1>
        <input className="w-full p-2 rounded bg-black/40" placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full p-2 rounded bg-black/40" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="w-full p-2 rounded bg-black/40" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="w-full bg-trackRed py-2 rounded">Create account</button>
        <p className="text-sm text-white/70">Already in? <Link to="/login" className="text-trackRed">Login</Link></p>
      </form>
    </div>
  );
};

export default RegisterPage;

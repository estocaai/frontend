"use client";

import { useState, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/register', {
        name,
        email,
        password,
      });
      alert('Registration successful! Please log in.');
      router.push('/'); 
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data || error.message);
      alert(error.response?.data || 'Registration failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div
        className="flex items-center justify-center bg-green-500 h-[30vh] relative overflow-hidden"
        style={{
          backgroundColor: "#6CB0BE",
        }}
      >
        <h1 className="text-3xl font-bold text-white">Registrar</h1>
      </div>

      <div className="relative flex flex-col items-center justify-start bg-white h-[70vh] py-8 px-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Crie Sua Conta
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              id="name"
              type="text"
              placeholder="Sigma boy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email 
            </label>
            <input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
              required
            />
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="********************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
                required
              />
                {/* Olho */}
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-azul2 text-white font-semibold py-2 px-4 rounded-lg hover:bg-azul3 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            Registrar
          </button>

          {/* Redireciona para login */}
          <p className="text-center text-gray-500">
            Já possui uma conta?{' '}
            <span
              className="text-azul3 cursor-pointer"
              onClick={() => router.push('/')}
            >
              Log in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
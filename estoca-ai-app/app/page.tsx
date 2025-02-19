"use client";

import { useState, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/login', { email, password });
      const [token, userId] = response.data.split(" ");
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      router.push('/aplicacao/casas');
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
      alert(error.response?.data || 'Login failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div
        className="flex items-center justify-center bg-azul1 h-[30vh] relative overflow-hidden"
        style={{
          backgroundColor: "#A3D9E4",
        }}
      >
        <img
          src="/shopping.png"
          alt="Shopping Background"
          className="object-contain w-full h-full"
        />
      </div>

      <div className="relative flex flex-col items-center justify-start bg-white h-[60vh] py-8 px-6">
        <img
          src="/logo-estocai.jpg"
          alt="Estoca Aí Logo"
          className="w-20 h-20 mb-4 rounded-xl shadow-2xl absolute -top-14 z-10"
        />
        <h1 className="text-2xl font-bold text-center text-gray-800 mt-12 mb-2">
          Estoca Aí!
        </h1>

        <p className="text-center text-gray-500 mb-6 max-w-[240px] mx-auto leading-tight">
          Organize sua despensa, simplifique suas compras.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Endereço de e-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-azul1 focus:border-azul1 text-sm"
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
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-azul1 focus:border-azul1 text-sm"
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
            className="w-full bg-azul1 text-white font-semibold py-2 px-4 rounded-lg hover:bg-azul2 focus:outline-none focus:ring-2 focus:ring-azul2"
          >
            Entrar
          </button>
          <button
            type="button"
            className="w-full border border-azul1 text-azul1 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#60a7b5]"
            onClick={() => router.push('/register')} // Redirect to registration page
          >
            Registrar-se
          </button>
        </form>
      </div>
    </div>
  );
}
'use client';

import { useState, FormEvent } from 'react';
import axios from 'axios';

interface FormCasasProps {
  onClose?: () => void;
}

export default function FormCasas({ onClose }: FormCasasProps) {
  const [nome, setNome] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Usuário não autenticado! Faça login novamente.');
      return;
    }

    try {
        const response = await axios.post(
            'https://estocaai-0a5bc1c57b9e.herokuapp.com/casas',
            {
                nome,
                estado,
                cidade,
                bairro,
                rua,
                numero: parseInt(numero), // Converte para número
                complemento,
            },
            {
                headers: {
                    Authorization: `${token}`,
                    "Content-Type": "application/json"
                },
            }
        );

      // Limpar os campos após o envio bem-sucedido
      setNome('');
      setEstado('');
      setCidade('');
      setBairro('');
      setRua('');
      setNumero('');
      setComplemento('');

      if (onClose) onClose(); // Fecha o popout e atualiza a lista
      alert('Casa adicionada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar casa:', error.response?.data || error.message);
      alert(error.response?.data || 'Falha ao adicionar casa');
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome da casa</label>
          <input
            type="text"
            placeholder="Casa do João"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-azul1 focus:border-azul1 text-sm"
            required
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <input
            type="text"
            placeholder="SP"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-azul1 focus:border-azul1 text-sm"
            required
          />
        </div>

        {/* Cidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Cidade</label>
          <input
            type="text"
            placeholder="São Paulo"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-azul1 focus:border-azul1 text-sm"
            required
          />
        </div>

        {/* Bairro */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Bairro</label>
          <input
            type="text"
            placeholder="Vila João"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-azul1 focus:border-azul1 text-sm"
            required
          />
        </div>

        {/* Rua */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Rua</label>
          <input
            type="text"
            placeholder="Rua João"
            value={rua}
            onChange={(e) => setRua(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-azul1 focus:border-azul1 text-sm"
            required
          />
        </div>

        {/* Número */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Número</label>
          <input
            type="number"
            placeholder="300"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-azul1 focus:border-azul1 text-sm"
            required
          />
        </div>

        {/* Complemento */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Complemento</label>
          <input
            type="text"
            placeholder="Apartamento 1"
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-azul1 focus:border-azul1 text-sm"
          />
        </div>

        {/* Botão de Adicionar */}
        <button
          type="submit"
          className="w-full bg-azul1 text-white font-semibold py-2 px-4 rounded-lg hover:bg-azul2 focus:outline-none focus:ring-2 focus:ring-azul2"
        >
          Adicionar
        </button>
      </form>
    </div>
  );
}
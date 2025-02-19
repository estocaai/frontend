'use client';

import Image from 'next/image';
import { Plus, Minus } from 'iconoir-react';
import React, { useState } from 'react';

export default function ItemDespensa({
  Id,
  Img,
  Nome,
  Qntd,
  CasaId,
  refreshItens, // Função para atualizar a despensa
}: {
  Id: string;
  Img: string;
  Nome: string;
  Qntd: number;
  CasaId: string;
  refreshItens: () => void;
}) {
  
  const [quantidade, setQuantidade] = useState(Qntd);

  const atualizarQuantidade = async (novaQuantidade: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Usuário não autenticado.");
        return;
      }

      if (!CasaId || !Id) {
        console.error("Erro: CasaId ou Id indefinido!");
        return;
      }

      const response = await fetch(`http://localhost:8080/casas/${CasaId}/despensa/produtos/${Id}`, {
        method: 'PUT', // Mantemos como PUT, agora que o backend aceita JSON
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({ quantidade: novaQuantidade }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar a quantidade');
      }

      setQuantidade(novaQuantidade); // Atualiza o estado local
      refreshItens(); // Atualiza a lista de produtos na despensa

    } catch (error) {
      console.error('Erro na atualização da quantidade:', error);
      alert('Não foi possível atualizar a quantidade. Tente novamente.');
    }
  };

  const incrementar = () => {
    const novaQuantidade = quantidade + 1;
    setQuantidade(novaQuantidade); 
    atualizarQuantidade(novaQuantidade); 
  };

  const decrementar = () => {
    if (quantidade > 0) {
      const novaQuantidade = quantidade - 1;
      setQuantidade(novaQuantidade); 
      atualizarQuantidade(novaQuantidade);
    }
  };

  return (
    <div className="flex flex-row mt-2 pb-2 mb-2 border-b border-solid border-gray-500 items-center justify-between">
      <div className="flex flex-row gap-2 items-center">
        <div className="relative w-16 h-16 rounded-md overflow-hidden">
          <Image
            src={Img || '/diversas.webp'} 
            layout="fill"
            objectFit="cover"
            alt={Nome || "Imagem do item"}
          />
        </div>

        <div className="flex flex-col justify-between h-16">
          <span className="text-base text-cinza1 font-semibold">
            {Nome || 'Nome do item'} 
          </span>
        </div>
      </div>

      <div className="flex flex-row gap-4 h-min items-center">
        <button onClick={decrementar} disabled={quantidade <= 0}>
          <Minus />
        </button>
        <span className="text-2xl font-bold">{quantidade}</span>
        <button onClick={incrementar}>
          <Plus />
        </button>
      </div>
    </div>
  );
}

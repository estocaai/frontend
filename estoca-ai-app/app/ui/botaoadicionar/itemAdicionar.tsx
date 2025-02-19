"use client";
import Image from "next/image";
import { PlusCircle } from "iconoir-react";
import React from "react";

export default function ItemAdicionar({
  produto,
  onAddClick,
}: {
  produto: {
    id: string;
    nome: string;
    imagemb64?: string;
  };
  onAddClick: (produto: { id: string; nome: string; imagemb64?: string }) => void;
}) {
  // Verifica se a imagemb64 é Base64 e adiciona o prefixo correto
  const imagemSrc = produto.imagemb64
    ? `data:image/png;base64,${produto.imagemb64}`
    : "/diversas.webp";

  return (
    <div className="flex flex-row mt-2 pb-2 mb-2 border-b border-solid border-gray-500 items-center justify-between">
      <div className="flex flex-row gap-2 items-center">
        <div className="relative w-16 h-16 rounded-md overflow-hidden">
          <Image
            src={imagemSrc}
            layout="fill"
            objectFit="cover"
            alt={produto.nome}
          />
        </div>

        <div className="flex flex-col justify-between h-16">
          <span className="text-base text-cinza1 font-semibold">
            {produto.nome}
          </span>
        </div>
      </div>

      {/* Botão para abrir popout de escolha */}
      <button onClick={() => onAddClick(produto)} className="hover:text-[#6CB0BE]">
        <PlusCircle />
      </button>
    </div>
  );
}

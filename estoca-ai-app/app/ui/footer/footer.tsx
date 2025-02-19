"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { HomeSimpleDoor, Closet, ListSelect, User, MinusCircle, PlusCircle } from "iconoir-react";
import Add from "./add";
import Item from "./item";
import clsx from "clsx";
import Background from "./background";
import ItemAdicionar from "../botaoadicionar/itemAdicionar";

interface Produto {
  id: string;
  nome: string;
  imagem?: string;
}

export default function Footer() {
  const [showPopout, setShowPopout] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [showSelectionPopout, setShowSelectionPopout] = useState(false);
  const [quantidade, setQuantidade] = useState(1);
  const [casaSelecionada, setCasaSelecionada] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Buscar casa selecionada pelo usuário
  useEffect(() => {
    const fetchCasaSelecionada = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Usuário não autenticado.");
          return;
        }
  
        setError(null); // Resetar erro antes da requisição
  
        const response = await axios.get("http://localhost:8080/users/details", {
          headers: { Authorization: `${token}` },
        });
  
        setCasaSelecionada(response.data.casaEscolhida || null);
      } catch (err) {
        console.error("Erro ao buscar casa selecionada:", err);
        setError("Falha ao carregar a casa selecionada.");
      }
    };
  
    fetchCasaSelecionada();
  }, []);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch("http://localhost:8080/produtos", {
        headers: {
          Authorization: token,
        },
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar produtos");
      }
      const data: Produto[] = await response.json();
      setProdutos(data);
      setProdutosFiltrados(data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setShowPopout(true);
    fetchProdutos();
  };

  const closePopout = () => {
    setShowPopout(false);
    setSearchTerm("");
    setProdutosFiltrados(produtos);
  };

  const handleProdutoSelecionado = (produto: Produto) => {
    setSelectedProduto(produto);
    setQuantidade(1);
    setShowSelectionPopout(true);
  };

  const closeSelectionPopout = () => {
    setShowSelectionPopout(false);
    setSelectedProduto(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    setProdutosFiltrados(
      produtos.filter((produto) => produto.nome.toLowerCase().includes(term))
    );
  };

  const incrementar = () => setQuantidade(quantidade + 1);
  const decrementar = () => quantidade > 1 && setQuantidade(quantidade - 1);

  // Função para adicionar produto à despensa
  const adicionarProdutoDespensa = async () => {
    if (!selectedProduto) return;
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(
        `http://localhost:8080/casas/${casaSelecionada}/despensa/produtos/${selectedProduto.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ quantidade }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Erro ao adicionar produto à despensa");
      }
  
      alert("Produto adicionado à despensa com sucesso!");
      closeSelectionPopout();
    } catch (error) {
      console.error("Erro ao adicionar produto à despensa:", error);
      alert("Erro ao adicionar o produto. Tente novamente.");
    }
  };

  // Função para adicionar produto à lista de compras
  const adicionarProdutoLista = async () => {
    if (!selectedProduto) return;
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(
        `http://localhost:8080/casas/${casaSelecionada}/lista-de-compras/produtos/${selectedProduto.id}?quantidade=${quantidade}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Erro ao adicionar produto à lista de compras");
      }
  
      alert("Produto adicionado à Lista de Compras com sucesso!");
      closeSelectionPopout();
    } catch (error) {
      console.error("Erro ao adicionar produto à lista de compras:", error);
      alert("Erro ao adicionar o produto à Lista de Compras. Tente novamente.");
    }
  };

  return (
    <div>
      <Background />
      <footer className="w-full flex flex-row items-center justify-center bg-white fixed bottom-0 pl-8 pr-8 pb-7 pt-4">
        <div className="w-dvw flex flex-row items-center justify-between">
          <Item href="/aplicacao/casas" label="Casas" Icon={HomeSimpleDoor} />
          <Item href="/aplicacao/despensa" label="Despensa" Icon={Closet} />
          <div onClick={handleAddClick} style={{ cursor: "pointer" }}>
            <Add />
          </div>
          <Item href="/aplicacao/lista" label="Lista" Icon={ListSelect} />
          <Item href="/aplicacao/perfil" label="Perfil" Icon={User} />
        </div>
      </footer>

      {/* Popout para adicionar produtos */}
      <div className="formAdd">
        <div
          className={clsx(
            "popout-overlay fixed inset-0 z-50 flex items-end justify-center bg-black transition-opacity duration-300 ease-in-out",
            showPopout ? "opacity-100 bg-opacity-50" : "opacity-0 pointer-events-none bg-opacity-0"
          )}
        >
          <div
            className={clsx(
              "popout bg-white p-6 w-full max-w-none transform transition-transform duration-500 ease-in-out",
              showPopout ? "translate-y-0 h-[80%]" : "translate-y-full h-80%]"
            )}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Adicionar Produto</h2>
              <button onClick={closePopout} className="text-gray-600 hover:text-gray-800 text-2xl">
                &times;
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6CB0BE]"
              />
            </div>

            {loading ? (
              <p>Carregando produtos...</p>
            ) : (
              <ul className="overflow-y-auto max-h-[50vh]">
                {produtosFiltrados.map((produto) => (
                  <li key={produto.id}>
                    <ItemAdicionar produto={produto} onAddClick={handleProdutoSelecionado} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Popout para escolher onde adicionar */}
      {selectedProduto && (
        <div
          className={clsx(
            "popout-overlay fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-300 ease-in-out",
            showSelectionPopout ? "opacity-100 bg-opacity-50" : "opacity-0 pointer-events-none bg-opacity-0"
          )}
        >
          <div className="popout bg-white p-6 w-96 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold">{selectedProduto.nome}</h2>

            <div className="flex items-center justify-center gap-4 my-4">
              <button onClick={decrementar} className="text-gray-700 text-2xl hover:text-gray-900">
                <MinusCircle />
              </button>
              <span className="text-lg font-semibold">{quantidade}</span>
              <button onClick={incrementar} className="text-gray-700 text-2xl hover:text-gray-900">
                <PlusCircle />
              </button>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col gap-3">
              <button
                onClick={adicionarProdutoDespensa}
                className="w-full border border-[#6CB0BE] text-[#6CB0BE] font-semibold py-2 rounded-lg"
              >
                Adicionar à Despensa
              </button>
              <button
                onClick={adicionarProdutoLista}
                className="w-full border border-[#6CB0BE] text-[#6CB0BE] font-semibold py-2 rounded-lg"
              >
                Adicionar à Lista de Compras
              </button>
              <button
                onClick={closeSelectionPopout}
                className="w-full border border-red-500 text-red-500 font-semibold py-2 rounded-lg hover:bg-red-500 hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
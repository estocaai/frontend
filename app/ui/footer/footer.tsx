"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  HomeSimpleDoor,
  Closet,
  ListSelect,
  User,
  MinusCircle,
  PlusCircle,
} from "iconoir-react";
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

// Definindo as props para o Footer – onProductAdded é opcional
interface FooterProps {
  onProductAdded?: () => Promise<void>;
  onDespensaUpdated?: () => Promise<void>;
}

export default function Footer({ onProductAdded, onDespensaUpdated }: FooterProps) {
  const [showPopout, setShowPopout] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [showSelectionPopout, setShowSelectionPopout] = useState(false);
  const [quantidade, setQuantidade] = useState(1);
  const [casaSelecionada, setCasaSelecionada] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Referência do contêiner de produtos para manipular o scroll
  const produtosContainerRef = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 20;

  useEffect(() => {
    const fetchCasaSelecionada = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Usuário não autenticado.");
          return;
        }
        setError(null);
        const response = await axios.get(
          "https://estocaai-0a5bc1c57b9e.herokuapp.com/users/details",
          {
            headers: { Authorization: token },
          }
        );
        setCasaSelecionada(response.data.casaEscolhida || null);
      } catch (err) {
        setError("Falha ao carregar a casa selecionada.");
      }
    };
    fetchCasaSelecionada();
  }, []);

  // Buscar produtos de forma paginada
  const fetchProdutosPaginados = async (
    pageNumber: number,
    search: string
  ): Promise<void> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const url = `https://estocaai-0a5bc1c57b9e.herokuapp.com/produtos/paginado?page=${pageNumber}&size=${PAGE_SIZE}&search=${encodeURIComponent(
        search
      )}`;
      const resp = await fetch(url, { headers: { Authorization: token } });
      if (!resp.ok) {
        throw new Error("Erro ao buscar produtos");
      }
      const data = await resp.json();
      const newProducts: Produto[] = data.content ?? data;

      if (pageNumber === 0) {
        setProdutos(newProducts);
      } else {
        setProdutos((prev) => [...prev, ...newProducts]);
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Abrir popout, resetar página e buscar a primeira página
  const handleAddClick = () => {
    setShowPopout(true);
    setPage(0);
    fetchProdutosPaginados(0, searchTerm);
  };

  // Fechar popout, limpar busca e lista
  const closePopout = () => {
    setShowPopout(false);
    setSearchTerm("");
    setProdutos([]);
    setPage(0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setPage(0);
    fetchProdutosPaginados(0, term);
  };

  const handleCarregarMais = async () => {
    if (!produtosContainerRef.current) return;

    const container = produtosContainerRef.current;
    const oldScrollTop = container.scrollTop;

    const nextPage = page + 1;
    setPage(nextPage);

    await fetchProdutosPaginados(nextPage, searchTerm);

    if (produtosContainerRef.current) {
      produtosContainerRef.current.scrollTop = oldScrollTop;
    }
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

  const incrementar = () => setQuantidade((q) => q + 1);
  const decrementar = () => setQuantidade((q) => (q > 1 ? q - 1 : q));

  // Função para adicionar produto à Lista de Compras
  const adicionarProdutoLista = async () => {
    if (!selectedProduto || !casaSelecionada) return;
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(
        `https://estocaai-0a5bc1c57b9e.herokuapp.com/casas/${casaSelecionada}/lista-de-compras/produtos/${selectedProduto.id}?quantidade=${quantidade}`,
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
      // Chama o callback para atualizar a Lista de Compras, se fornecido
      if (onProductAdded) {
        await onProductAdded();
      }
    } catch (error) {
      console.error("Erro ao adicionar produto à Lista de Compras:", error);
      alert("Erro ao adicionar o produto à Lista de Compras. Tente novamente.");
    }
  };

  // Função para adicionar produto à Despensa
  const adicionarProdutoDespensa = async () => {
    if (!selectedProduto || !casaSelecionada) return;
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(
        `https://estocaai-0a5bc1c57b9e.herokuapp.com/casas/${casaSelecionada}/despensa/produtos/${selectedProduto.id}`,
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
      // Atualiza a página da despensa se a função estiver presente
      if (onDespensaUpdated) {
        await onDespensaUpdated();
      }
    } catch (error) {
      console.error("Erro ao adicionar produto à despensa:", error);
      alert("Erro ao adicionar o produto. Tente novamente.");
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
              showPopout ? "translate-y-0 h-[80%]" : "translate-y-full"
            )}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Adicionar Produto</h2>
              <button
                onClick={closePopout}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
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

            {produtos.length === 0 && loading ? (
              <p>Carregando produtos...</p>
            ) : (
              <div
                className="flex flex-col max-h-[50vh] overflow-y-auto"
                ref={produtosContainerRef}
              >
                {produtos.map((produto) => (
                  <div key={produto.id}>
                    <ItemAdicionar
                      produto={produto}
                      onAddClick={handleProdutoSelecionado}
                    />
                  </div>
                ))}

                {loading && produtos.length > 0 && (
                  <p className="text-center my-2">Carregando mais produtos...</p>
                )}

                <button
                  type="button"
                  onClick={handleCarregarMais}
                  className="mt-4 bg-[#6CB0BE] text-white font-semibold py-2 rounded-lg self-center w-full"
                >
                  Carregar mais
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
              <button
                onClick={decrementar}
                className="text-gray-700 text-2xl hover:text-gray-900"
              >
                <MinusCircle />
              </button>
              <span className="text-lg font-semibold">{quantidade}</span>
              <button
                onClick={incrementar}
                className="text-gray-700 text-2xl hover:text-gray-900"
              >
                <PlusCircle />
              </button>
            </div>

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

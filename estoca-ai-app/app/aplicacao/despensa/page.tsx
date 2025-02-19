'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import HeaderDepensa from "@/app/ui/header/headerDespensa";
import ItemDespensa from "@/app/ui/aplicacao/despensa/itemDespensa";
import ItemAdicionar from "@/app/ui/botaoadicionar/itemAdicionar";

interface Produto {
  Id: string;
  Img: string;
  Nome: string;
  Qntd: number;
  CasaId: string;
}

export default function Page() {
  const [itens, setItens] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [casaSelecionada, setCasaSelecionada] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Atualiza a casa selecionada quando o usuário troca no Header
  const atualizarCasaSelecionada = async (novaCasa: string) => {
    if (novaCasa === casaSelecionada) return; // Evita recarregar desnecessariamente
    setCasaSelecionada(novaCasa);
    setItens([]);
  };

  // Buscar casa selecionada pelo usuário
  useEffect(() => {
    const fetchCasaSelecionada = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Usuário não autenticado.");
          return;
        }
        setError(null);
        const response = await axios.get("http://localhost:8080/users/details", {
          headers: { Authorization: `${token}` },
        });
        if (!response.data.casaEscolhida) {
          setError("Nenhuma casa foi selecionada.");
          return;
        }
        setCasaSelecionada(response.data.casaEscolhida);
      } catch (err) {
        console.error("Erro ao buscar casa selecionada:", err);
        setError("Falha ao carregar a casa selecionada.");
      }
    };
    fetchCasaSelecionada();
  }, []);

  // Buscar itens da despensa da casa selecionada
  const fetchItens = async () => {
    if (!casaSelecionada) return;
    try {
      setLoading(true);
      setError(null);
      setItens([]);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Usuário não autenticado.");
        setLoading(false);
        return;
      }
      const despensaResponse = await axios.get(
        `http://localhost:8080/casas/${casaSelecionada}/despensa`,
        { headers: { Authorization: `${token}` } }
      );
      const { produtosIds, produtosQuantidades } = despensaResponse.data;
      if (!produtosIds || produtosIds.length === 0) {
        setItens([]);
        setLoading(false);
        return;
      }
      const produtosResponse = await axios.get(
        `http://localhost:8080/casas/${casaSelecionada}/despensa/produtos`,
        {
          headers: { Authorization: `${token}` },
          params: { ids: produtosIds.join(",") },
        }
      );
      const produtosDetalhes = produtosResponse.data;
      // Use the original order from produtosIds to merge details with their quantities with explicit types
      const produtosFormatados = produtosIds.map((prodId: string, index: number) => {
        // Find the matching product (assume _id or id matches prodId)
        const produto = produtosDetalhes.find(
          (p: any) => p._id === prodId || p.id === prodId
        );
        return {
          Id: prodId,
          Img: produto && produto.imagemb64
            ? `data:image/png;base64,${produto.imagemb64}`
            : "/placeholder.png",
          Nome: (produto && produto.nome) || "Produto sem nome",
          Qntd: produtosQuantidades[index] || 0,
          CasaId: casaSelecionada,
        };
      });
      setItens(produtosFormatados);
    } catch (err) {
      console.error("Erro ao buscar itens da despensa:", err);
      setError("Falha ao carregar os itens da despensa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItens();
  }, [casaSelecionada]);

  return (
    <div>
      {/* Atualiza a casa selecionada ao trocar */}
      <HeaderDepensa onCasaSelecionada={atualizarCasaSelecionada} />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Escolha um produto</h2>
            <ItemAdicionar
              produto={{ id: "produto-teste", nome: "Produto Exemplo", imagemb64: undefined }}
              onAddClick={() => {
                setShowModal(false);
                fetchItens(); // Atualiza ao fechar o popout
              }}
            />
            <button
              onClick={() => {
                setShowModal(false);
                fetchItens(); // Atualiza ao fechar o popout
              }}
              className="mt-4 p-2 bg-red-500 text-white rounded"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mt-[-2px] ml-8 mr-8">
        <input
          type="text"
          placeholder="Buscar produto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6CB0BE]"
        />
      </div>

      {/* Itens da Despensa */}
      <ul className="mt-10 ml-8 mr-8 mb-20">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : loading ? (
          <p>Carregando itens...</p>
        ) : itens.length > 0 ? (
          itens
            .filter((item) =>
              item.Nome.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item) => (
              <li key={item.Id}>
                <ItemDespensa
                  Id={item.Id}
                  Img={item.Img}
                  Nome={item.Nome}
                  Qntd={item.Qntd}
                  CasaId={item.CasaId}
                  refreshItens={fetchItens}
                />
              </li>
            ))
        ) : (
          <p>Despensa vazia :(</p>
        )}
      </ul>
    </div>
  );
}
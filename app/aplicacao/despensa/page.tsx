'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { EditPencil, Trash, PlusCircle, MinusCircle } from "iconoir-react";
import HeaderDepensa from "@/app/ui/header/headerDespensa";
import Footer from '@/app/ui/footer/footer';

interface ProdutoDespensa {
  // Ajuste os campos conforme sua API/dados retornados
  Id: string;
  Img: string;   // base64 ou URL
  Nome: string;
  Qntd: number;
  CasaId: string;
}

export default function Page() {
  const [itens, setItens] = useState<ProdutoDespensa[]>([]);
  const [casaSelecionada, setCasaSelecionada] = useState<string | null>(null);

  // Estados para carregamento e erro
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de busca
  const [searchQuery, setSearchQuery] = useState("");

  // Estados para modais de edição/exclusão
  const [selectedItem, setSelectedItem] = useState<ProdutoDespensa | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [tempQuantidade, setTempQuantidade] = useState<number | null>(null);

  // ----------------------------------
  // 1) BUSCAR CASA SELECIONADA
  // ----------------------------------
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

  // ----------------------------------
  // 2) FUNÇÃO PARA BUSCAR ITENS DA DESPENSA
  // ----------------------------------
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

      // 1. Buscar a despensa
      const despensaResponse = await axios.get(
        `https://estocaai-0a5bc1c57b9e.herokuapp.com/casas/${casaSelecionada}/despensa`,
        { headers: { Authorization: token } }
      );

      const { produtosIds, produtosQuantidades } = despensaResponse.data;

      // Se não houver produtos, finaliza
      if (!produtosIds || produtosIds.length === 0) {
        setItens([]);
        setLoading(false);
        return;
      }

      // 2. Buscar detalhes dos produtos
      const produtosResponse = await axios.get(
        `https://estocaai-0a5bc1c57b9e.herokuapp.com/casas/${casaSelecionada}/despensa/produtos`,
        {
          headers: { Authorization: token },
          params: { ids: produtosIds.join(",") },
        }
      );

      const produtosDetalhes = produtosResponse.data;

      // 3. Montar lista final (apenas exemplo de mapeamento)
      const produtosFormatados = produtosIds.map((prodId: string, index: number) => {
        const produtoEncontrado = produtosDetalhes.find(
          (p: any) => p._id === prodId || p.id === prodId
        );

        return {
          Id: prodId,
          Img:
            produtoEncontrado && produtoEncontrado.imagemb64
              ? `data:image/png;base64,${produtoEncontrado.imagemb64}`
              : "/placeholder.png",
          Nome: produtoEncontrado?.nome || "Produto sem nome",
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

  // ----------------------------------
  // 3) BUSCAR ITENS QUANDO TIVER CASA SELECIONADA
  // ----------------------------------
  useEffect(() => {
    fetchItens();
  }, [casaSelecionada]);

  // ----------------------------------
  // 4) ATUALIZAR CASA SELECIONADA (Chamado pelo Header)
  // ----------------------------------
  const atualizarCasaSelecionada = (novaCasa: string) => {
    if (novaCasa === casaSelecionada) return;
    setCasaSelecionada(novaCasa);
    setItens([]);
  };

  // ----------------------------------
  // 5) EDITAR ITEM (Abrir popup)
  // ----------------------------------
  const handleEditItem = (item: ProdutoDespensa) => {
    setSelectedItem(item);
    setTempQuantidade(item.Qntd);
    setIsEditModalOpen(true);
  };

  // ----------------------------------
  // 6) SALVAR NOVA QUANTIDADE (Despensa)
  // ----------------------------------
  const handleSaveQuantidade = async () => {
    if (!selectedItem || tempQuantidade === null || !casaSelecionada) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // PUT /casas/{casaId}/despensa/produtos/{produtoId}?quantidade=valor
      await axios.put(
        `https://estocaai-0a5bc1c57b9e.herokuapp.com/casas/${casaSelecionada}/despensa/produtos/${selectedItem.Id}?quantidade=${tempQuantidade}`,
        {},
        { headers: { Authorization: token } }
      );

      // Atualiza a lista local
      setItens((prev) =>
        prev.map((p) =>
          p.Id === selectedItem.Id ? { ...p, Qntd: tempQuantidade } : p
        )
      );
    } catch (error: any) {
      console.error("Erro ao atualizar quantidade:", error.response?.data || error.message);
    } finally {
      setIsEditModalOpen(false);
    }
  };

  // ----------------------------------
  // 7) EXCLUIR ITEM (Abrir popup)
  // ----------------------------------
  const handleExcluirItem = (item: ProdutoDespensa) => {
    setSelectedItem(item);
    setIsConfirmModalOpen(true);
  };

  // ----------------------------------
  // 8) CONFIRMAR EXCLUSÃO
  // ----------------------------------
  const confirmExcluirItem = async () => {
    if (!selectedItem || !casaSelecionada) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // DELETE /casas/{casaId}/despensa/produtos/{produtoId}?quantidade=valor
      await axios.delete(
        `https://estocaai-0a5bc1c57b9e.herokuapp.com/casas/${casaSelecionada}/despensa/produtos/${selectedItem.Id}?quantidade=${selectedItem.Qntd}`,
        { headers: { Authorization: token } }
      );

      // Remove localmente
      setItens((prev) => prev.filter((p) => p.Id !== selectedItem.Id));
    } catch (error: any) {
      console.error("Erro ao excluir produto:", error.response?.data || error.message);
    } finally {
      setIsConfirmModalOpen(false);
      setSelectedItem(null);
    }
  };

  const cancelExcluirItem = () => {
    setIsConfirmModalOpen(false);
    setSelectedItem(null);
  };

  // ----------------------------------
  // 9) CONTROLES DE INCREMENTO/DECREMENTO
  // ----------------------------------
  const incrementQuantidade = () => {
    if (tempQuantidade !== null) {
      setTempQuantidade(tempQuantidade + 1);
    }
  };

  const decrementQuantidade = () => {
    if (tempQuantidade !== null && tempQuantidade > 0) {
      setTempQuantidade(tempQuantidade - 1);
    }
  };

  // ----------------------------------
  // 10) RENDERIZAÇÃO
  // ----------------------------------
  // Filtro de busca
  const itensFiltrados = searchQuery
    ? itens.filter((item) =>
        item.Nome.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : itens;

  return (
    <div>
      {/* Header que permite alterar a casa */}
      <HeaderDepensa onCasaSelecionada={atualizarCasaSelecionada} />

      {/* Footer */}
      <Footer casaSelecionada={casaSelecionada} onDespensaUpdated={fetchItens} />

      {/* Barra de busca */}
      <div className="mt-[-2px] ml-8 mr-8">
        <input
          type="text"
          placeholder="Buscar produto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6CB0BE]"
        />
      </div>

      {/* Lista de itens da despensa */}
      <ul className="mt-10 ml-8 mr-8 mb-20">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : loading ? (
          <p>Carregando itens...</p>
        ) : itensFiltrados.length > 0 ? (
          itensFiltrados.map((item) => (
            <li
              key={item.Id}
              className="flex items-center justify-between border-b pb-2 mb-2"
            >
              <div className="flex items-center space-x-3">
                {/* Caso queira exibir a imagem do produto */}
                <img
                  src={item.Img}
                  alt={item.Nome}
                  className="w-8 h-8 object-cover rounded"
                />
                <p className="text-lg font-medium">{item.Nome}</p>
              </div>

              <div className="flex items-center space-x-4">
                <p>{item.Qntd}</p>
                {/* Botão de editar (abre popout) */}
                <button
                  onClick={() => handleEditItem(item)}
                  className="hover:text-black"
                >
                  <EditPencil className="w-5 h-5 text-gray-600" />
                </button>
                {/* Botão de excluir (abre popout) */}
                <button
                  onClick={() => handleExcluirItem(item)}
                  className="hover:text-black"
                >
                  <Trash className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </li>
          ))
        ) : (
          <p>Despensa vazia</p>
        )}
      </ul>

      {/* Modal de edição de quantidade */}
      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-md">
            <h3 className="text-xl font-semibold mb-4">{selectedItem.Nome}</h3>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <button onClick={decrementQuantidade} className="hover:text-[#6CB0BE]">
                <MinusCircle className="w-5 h-5" />
              </button>
              <input
                type="number"
                className="text-center border rounded-md w-16"
                value={tempQuantidade ?? ""}
                onChange={(e) => setTempQuantidade(Number(e.target.value))}
              />
              <button onClick={incrementQuantidade} className="hover:text-[#6CB0BE]">
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-white text-azul1 border border-azul1 rounded-md hover:bg-azul1 hover:text-white transition-colors duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveQuantidade}
                className="px-4 py-2 bg-azul1 text-white rounded-md hover:bg-blue-600 transition-colors duration-300"
              >
                Alterar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {isConfirmModalOpen && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-md">
            <h3 className="text-xl font-semibold mb-4">Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir "{selectedItem.Nome}"?</p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={cancelExcluirItem}
                className="px-4 py-2 bg-white text-azul1 border border-azul1 rounded-md hover:bg-azul1 hover:text-white transition-colors duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmExcluirItem}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

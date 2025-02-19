'use client';

import { useEffect, useState } from "react";
import { MapPin, NavArrowDown, Edit, Trash, PlusCircle, MinusCircle } from "iconoir-react";
import axios from "axios";

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  quantidade: number;
  unidadeMedida: string;
  checked: boolean;
}

export default function Page() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmarPressed, setIsConfirmarPressed] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [tempQuantidade, setTempQuantidade] = useState<number | null>(null);
  const [casaId, setCasaId] = useState<string>("");
  const [casas, setCasas] = useState<{ id: string; nome: string }[]>([]);
  const [casaError, setCasaError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCasas = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCasaError("Usuário não autenticado.");
        return;
      }
      try {
        const casasResponse = await axios.get("http://localhost:8080/casas", {
          headers: { Authorization: token },
        });
        setCasas(casasResponse.data);
        const userResponse = await axios.get("http://localhost:8080/users/details", {
          headers: { Authorization: token },
        });
        if (userResponse.data.casaEscolhida) {
          setCasaId(userResponse.data.casaEscolhida);
        } else {
          console.error("Nenhuma casa selecionada encontrada.");
        }
      } catch (error: any) {
        console.error("Erro ao buscar casa selecionada:", error.response?.data || error.message);
        setCasaError("Falha ao carregar casas.");
      }
    };

    fetchCasas();
  }, []);

  useEffect(() => {
    const fetchListaProdutos = async () => {
      const token = localStorage.getItem("token");
      if (!token || !casaId) return;

      // console.log("casaID" , casaId);
  
      try {
        const listaResponse = await axios.get(
          `http://localhost:8080/casas/${casaId}/lista-de-compras`,
          { headers: { Authorization: token } }
        );
        const lista = listaResponse.data;
  
        const produtosResponse = await axios.get(
          `http://localhost:8080/casas/${casaId}/lista-de-compras/produtos`,
          { headers: { Authorization: token } }
        );
  
        // Build a map from produto id to its quantity
        const produtosQuantMap = lista.produtosIds.reduce((acc: Record<string, number>, id: string, index: number) => {
          acc[id] = lista.produtosQuantidades[index];
          return acc;
        }, {});
  
        const mergedProdutos = produtosResponse.data.map((produto: any) => ({
          ...produto,
          quantidade: produtosQuantMap[produto.id] || 0,
          checked: false,
        }));
  
        setProdutos(mergedProdutos);
      } catch (error: any) {
        console.error("Error fetching lista or produtos:", error.response?.data || error.message);
      }
    };
  
    fetchListaProdutos();
  }, [casaId]);

  const handleCasaChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const novaCasa = event.target.value;
    if (!novaCasa || novaCasa === casaId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setCasaError("Usuário não autenticado.");
      return;
    }
    try {
      await axios.put(
        "http://localhost:8080/selecionar/casa",
        { casaId: novaCasa },
        { headers: { Authorization: token } }
      );
      setCasaId(novaCasa);
    } catch (error: any) {
      console.error("Erro ao atualizar casa selecionada:", error.response?.data || error.message);
      setCasaError("Falha ao atualizar a casa selecionada.");
    }
  };

  const handleEditProduto = (produto: Produto) => {
    setSelectedProduto(produto);
    setTempQuantidade(produto.quantidade);
    setIsEditModalOpen(true);
  };

  const handleConfirmarCompraAddToDespensa = async () => {
    const token = localStorage.getItem("token");
    if (!token || !casaId) return;
    const produtosSelecionados = produtos.filter((produto) => produto.checked);
    try {
      for (const produto of produtosSelecionados) {
        await axios.post(
          `http://localhost:8080/casas/${casaId}/despensa/produtos/${produto.id}`,
          { quantidade: produto.quantidade },
          { headers: { Authorization: token } }
        );
        await axios.delete(
          `http://localhost:8080/casas/${casaId}/lista-de-compras/produtos/${produto.id}?quantidade=${produto.quantidade}`,
          { headers: { Authorization: token } }
        );
      }
      setProdutos((prev) => prev.filter((produto) => !produto.checked));
      setIsConfirmarPressed(false);
    } catch (error: any) {
      console.error(
        "Error processing compra to despensa:",
        error.response?.data || error.message
      );
    }
  };
  
  const handleSaveQuantidade = async () => {
    if (selectedProduto !== null && tempQuantidade !== null) {
      const token = localStorage.getItem("token");
      if (!token || !casaId) return;
      try {
        await axios.put(
          `http://localhost:8080/casas/${casaId}/lista-de-compras/produtos/${selectedProduto.id}?quantidade=${tempQuantidade}`,
          {},
          { headers: { Authorization: token } }
        );
        setProdutos((prev) =>
          prev.map((produto) =>
            produto.id === selectedProduto.id
              ? { ...produto, quantidade: tempQuantidade }
              : produto
          )
        );
      } catch (error: any) {
        console.error("Error updating quantity:", error.response?.data || error.message);
      }
    }
    setIsEditModalOpen(false);
  };

  const handleExcluirProduto = (produto: Produto) => {
    setSelectedProduto(produto);
    setIsConfirmModalOpen(true);
  };

  const confirmExcluirProduto = async () => {
    if (!selectedProduto || !casaId) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.delete(
        `http://localhost:8080/casas/${casaId}/lista-de-compras/produtos/${selectedProduto.id}?quantidade=${selectedProduto.quantidade}`,
        { headers: { Authorization: token } }
      );
      setProdutos((prev) =>
        prev.filter((p) => p.id !== selectedProduto.id)
      );
      setIsConfirmModalOpen(false);
      setSelectedProduto(null);
    } catch (error: any) {
      console.error("Error deleting product:", error.response?.data || error.message);
    }
  };

  const cancelExcluirProduto = () => {
    setIsConfirmModalOpen(false);
    setSelectedProduto(null);
  };

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

  const handleConfirmarCompra = async () => {
    const token = localStorage.getItem("token");
    if (!token || !casaId) return;
    const produtosToDelete = produtos.filter(produto => produto.checked);
    try {
      await Promise.all(
        produtosToDelete.map(produto =>
          axios.delete(
            `http://localhost:8080/casas/${casaId}/lista-de-compras/produtos/${produto.id}?quantidade=${produto.quantidade}`,
            { headers: { Authorization: token } }
          )
        )
      );
      setProdutos(prev => prev.filter(produto => !produto.checked));
      setIsConfirmarPressed(false);
    } catch (error: any) {
      console.error("Error deleting selected produtos:", error.response?.data || error.message);
    }
  };

  const displayedProdutos = searchQuery
    ? produtos.filter((produto) =>
        produto.nome.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : produtos;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section with Search and Casa Selection */}
      <div className="p-8 bg-white">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-cinza1">Lista</h2>
        <div className="relative bg-white w-32">
          <MapPin className="text-xs text-azul1 absolute left-2 top-1/2 transform -translate-y-1/2" />
          <select
            value={casaId || ""}
            onChange={handleCasaChange}
            className="w-full appearance-none text-cinza1 text-xs bg-white pl-8 pr-8 py-1 focus:outline-none"
          >
            <option value="" disabled>
              Selecione uma casa
            </option>
            {casas.map((casa) => (
              <option key={casa.id} value={casa.id}>
                {casa.nome}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <NavArrowDown className="text-base text-cinza1" />
          </div>
        </div>
      </div>
      <div className="mt-8">
        <input
          type="text"
          placeholder="Buscar produto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6CB0BE]"
					/>
      </div>
    </div>

      {/* Produtos List */}
      <div className="flex-1 p-8 mt-[-25px]">
        <ul className="space-y-4">
          {displayedProdutos.length === 0 ? (
            <p>Sem produtos para exibir.</p>
          ) : (
            displayedProdutos.map((produto) => (
              <li
                key={produto.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() =>
                      setProdutos((prev) =>
                        prev.map((p) =>
                          p.id === produto.id ? { ...p, checked: !p.checked } : p
                        )
                      )
                    }
                    className={`w-5 h-5 rounded-md border-2 border-azul1 transition-colors duration-300 ${
                      produto.checked ? "bg-azul1" : "bg-white"
                    }`}
                    aria-label={produto.checked ? "Deselect item" : "Select item"}
                  ></button>
                  <p className="text-lg font-medium">{produto.nome}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <p>
                    {produto.quantidade} {produto.unidadeMedida}
                  </p>
                  <button onClick={() => handleEditProduto(produto)} className="hover:text-black">
                      <Edit className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={() => handleExcluirProduto(produto)} className="hover:text-black">
                      <Trash className="w-5 h-5 text-red-600" />
                    </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Confirmar Compra Button */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-10">
        <button
          onClick={() => setIsConfirmarPressed(true)}
          className="bg-white border border-azul1 text-azul1 px-6 py-3 rounded-md font-medium hover:bg-azul1 hover:text-white transition-colors duration-300"
        >
          Confirmar Compra
        </button>
      </div>

      {/* Confirmar Compra Modal */}
      {isConfirmarPressed && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md">
            <h3 className="text-xl font-semibold mb-4">Confirmar Compra</h3>
            <p>Tem certeza que deseja confirmar a compra?</p>
            <div className="flex flex-col items-center space-y-4 mt-4">
              <button
                onClick={handleConfirmarCompraAddToDespensa}
                className="px-4 py-2 bg-white text-azul1 border border-azul1 rounded-md hover:bg-azul1 hover:text-white transition-colors duration-300"
              >
                Sim, e adiciona-los a despensa
              </button>
              <button
                onClick={handleConfirmarCompra}
                className="px-4 py-2 bg-white text-azul1 border border-azul1 rounded-md hover:bg-azul1 hover:text-white transition-colors duration-300"
              >
                Sim, e não adiciona-los a despensa
              </button>
              <button
                onClick={() => setIsConfirmarPressed(false)}
                className="px-4 py-2 bg-white text-red-500 border border-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedProduto && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md">
            <h3 className="text-xl font-semibold mb-4">{selectedProduto.nome}</h3>
            <div className="flex items-center justify-center space-x-2 mb-4">
						<button
							onClick={decrementQuantidade}
							className="hover:text-[#6CB0BE]"
						>
							<MinusCircle className="w-5 h-5" />
						</button>
						<input
							type="number"
							className="text-center border rounded-md w-16"
							value={tempQuantidade ?? ""}
							onChange={(e) => setTempQuantidade(Number(e.target.value))}
						/>
						<button
							onClick={incrementQuantidade}
							className="hover:text-[#6CB0BE]"
						>
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

      {/* Confirm Exclude Modal */}
      {isConfirmModalOpen && selectedProduto && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md">
            <h3 className="text-xl font-semibold mb-4">Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir "{selectedProduto.nome}"?</p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={cancelExcluirProduto}
                className="px-4 py-2 bg-white text-azul1 border border-azul1 rounded-md hover:bg-azul1 hover:text-white transition-colors duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmExcluirProduto}
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
"use client";

import withAuth from '../../components/withAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import HeaderCasas from "@/app/ui/header/headerCasas";
import axios from "axios";
import { Trash } from 'iconoir-react';

interface Casa {
  id: string;
  nome: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: number;
}

function Casas() {
  const router = useRouter();
  const [casas, setCasas] = useState<Casa[]>([]);
  const [casaSelecionada, setCasaSelecionada] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCasas = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Usuário não autenticado.");
        return;
      }
      // Buscar todas as casas
      const casasResponse = await axios.get("https://estocaai-0a5bc1c57b9e.herokuapp.com/casas", {
        headers: { Authorization: `${token}` }
      });
      setCasas(casasResponse.data);

      // Buscar detalhes do usuário para obter a casa selecionada
      const userResponse = await axios.get("https://estocaai-0a5bc1c57b9e.herokuapp.com/users/details", {
        headers: { Authorization: `${token}` }
      });
      setCasaSelecionada(userResponse.data.casaEscolhida || null);
    } catch (err: any) {
      console.error("Erro ao buscar dados:", err);
      setError("Falha ao carregar casas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCasas();
  }, []);

  // Atualizar a casa selecionada no backend e no frontend
  const selecionarCasa = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Usuário não autenticado!");
        return;
      }

      // Atualiza no backend
      await axios.put(
        "https://estocaai-0a5bc1c57b9e.herokuapp.com/selecionar/casa",
        { casaId: id },
        { headers: { Authorization: `${token}` } }
      );

      // Buscar os detalhes atualizados do usuário para refletir no frontend
      const userResponse = await axios.get("https://estocaai-0a5bc1c57b9e.herokuapp.com/users/details", {
        headers: { Authorization: `${token}` }
      });
      setCasaSelecionada(userResponse.data.casaEscolhida);
    } catch (error) {
      console.error("Erro ao atualizar casa selecionada:", error);
      alert("Erro ao selecionar casa.");
    }
  };

  // Função para excluir a casa
  const handleDeleteCasa = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir essa casa?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Usuário não autenticado!");
        return;
      }
      await axios.delete(`https://estocaai-0a5bc1c57b9e.herokuapp.com/casas/${id}`, {
        headers: { Authorization: `${token}` }
      });
      alert("Casa excluída com sucesso!");
      setCasaSelecionada(null);
      fetchCasas();
    } catch (error) {
      console.error("Erro ao excluir casa:", error);
      alert("Falha ao excluir casa.");
    }
  };

  return (
    <div>
      <HeaderCasas onHouseCreated={fetchCasas} />
      <div className="p-8">
        {loading && <p className="text-gray-500">Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && casas.length === 0 && (
          <p className="text-gray-500">Nenhuma casa cadastrada.</p>
        )}
        <div className="space-y-4 mb-28">
          {casas.map((casa) => (
            <div
              key={casa.id}
              className={`relative p-4 border rounded-lg shadow-md cursor-pointer transition duration-300 transform ${
                casaSelecionada === casa.id
                  ? "border-[#8CC8D5] bg-[#8CC8D5] text-white scale-105 shadow-lg"
                  : "border-gray-300 bg-white hover:shadow-md"
              }`}
              onClick={() => selecionarCasa(casa.id)}
            >
              {casaSelecionada === casa.id && (
                <div className="absolute top-2 right-2">
                  <Trash
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCasa(casa.id);
                    }}
                    className="cursor-pointer"
                  />
                </div>
              )}
              <h2 className={`text-lg font-semibold ${casaSelecionada === casa.id ? "text-white" : "text-gray-900"}`}>
                {casa.nome}
              </h2>
              <p className={`${casaSelecionada === casa.id ? "text-white" : "text-gray-600"}`}>
                {casa.bairro}, {casa.cidade} - {casa.estado}
              </p>
              <p className={`${casaSelecionada === casa.id ? "text-[#E3FAFF]" : "text-gray-500"}`}>
                {casa.rua}, {casa.numero}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuth(Casas);

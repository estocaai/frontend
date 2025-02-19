"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { MapPin, NavArrowDown } from "iconoir-react";

interface Casa {
  id: string;
  nome: string;
}

export default function SelecaoCasas({ onCasaSelecionada }: { onCasaSelecionada: (novaCasa: string) => void }) {
  const [casas, setCasas] = useState<Casa[]>([]);
  const [casaSelecionada, setCasaSelecionada] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Buscar todas as casas e a casa selecionada do usuário ao entrar na página
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Usuário não autenticado.");
          return;
        }

        // Buscar todas as casas
        const casasResponse = await axios.get("http://localhost:8080/casas", {
          headers: { Authorization: `${token}` },
        });
        setCasas(casasResponse.data);

        // Buscar detalhes do usuário para obter a casa selecionada
        const userResponse = await axios.get("http://localhost:8080/users/details", {
          headers: { Authorization: `${token}` },
        });

        setCasaSelecionada(userResponse.data.casaEscolhida || null);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Falha ao carregar casas.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Atualizar a casa selecionada no backend quando o usuário muda a seleção
  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selecionada = event.target.value;
    if (!selecionada || selecionada === casaSelecionada) return; // Evita re-selecionar a mesma casa

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Usuário não autenticado.");
        return;
      }

      await axios.put(
        "http://localhost:8080/selecionar/casa",
        { casaId: selecionada },
        { headers: { Authorization: `${token}` } }
      );

      setCasaSelecionada(selecionada); // Atualiza o estado local
      onCasaSelecionada(selecionada); // Notifica a mudança para a `Despensa.tsx`
    } catch (err) {
      console.error("Erro ao atualizar casa selecionada:", err);
      setError("Falha ao atualizar a casa selecionada.");
    }
  };


  if (loading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="flex flex-row items-center justify-between">
      <MapPin className="text-xs text-azul1" />
      <select
        name="casas"
        id="casa-selecionada"
        value={casaSelecionada || ""}
        onChange={handleChange}
        className="appearance-none border-none text-cinza1 text-sm bg-white p-2 rounded-md focus:outline-none focus:ring-0 focus:border-none"
      >
        {/* Opção padrão para evitar seleção vazia */}
        <option value="" disabled>
          Selecione uma casa
        </option>
        {casas.map((casa) => (
          <option key={casa.id} value={casa.id}>
            {casa.nome}
          </option>
        ))}
      </select>
      <NavArrowDown className="text-base text-cinza1" />
    </div>
  );
}

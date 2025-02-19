"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "", email: "", fotoPerfil: "" });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedUser, setEditedUser] = useState({ name: "", email: "" });

  useEffect(() => {
    // Buscar dados do usuário na API
    fetch("http://localhost:8080/users/details", {
      headers: { Authorization: `${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setEditedUser({ name: data.name, email: data.email });
      })
      .catch((err) => console.error("Erro ao buscar dados do usuário", err));
  }, []);

  const handleEditAccount = () => {
    setIsEditOpen(true);
  };

  const handleSaveChanges = () => {
    // Enviar alterações para API
    fetch("http://localhost:8080/users/details", {
      method: "PUT",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(editedUser),
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setIsEditOpen(false);
      })
      .catch((err) => console.error("Erro ao atualizar usuário", err));
  };

  const handleLogout = () => {
    alert("Você foi desconectado.");
    router.push("/");
  };

  return (
    <div style={{ fontFamily: "Roboto, sans-serif", maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: "32px", color: "#4E4E4E", fontFamily: "Roboto, sans-serif", fontWeight: "700", paddingTop: "20px", marginBottom: "40px" }}>Minha conta</h1>

      {/* Avatar e Nome */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "24px", color: "#4E4E4E", fontWeight: "600" }}>{user.name}</div>
      </div>

      {/* Botões */}
      <div style={{ borderTop: "1px solid #AEAEAE" }}>
        <button
          onClick={handleEditAccount}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            padding: "10px 10px 10px 0px",
            border: "none",
            borderBottom: "1px solid #AEAEAE",
            background: "none",
            color: "#4E4E4E",
            fontFamily: "Roboto, sans-serif",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Alterar dados da conta
        </button>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "100%",
            textAlign: "left",
            padding: "10px 10px 10px 0px",
            border: "none",
            background: "none",
            color: "#4E4E4E",
            fontFamily: "Roboto, sans-serif",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          <img
            src="/icones/log-out.png"
            alt="Sair"
            style={{ width: "20px", height: "20px", marginRight: "8px" }}
          />
          Sair
        </button>
      </div>

      {/* Popout de edição */}
      {isEditOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="opacity-100 m-6 w-full bg-white rounded-2xl p-5 flex flex-col">
            <h3 className="text-xl font-semibold mb-4">Editar Perfil</h3>

            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
            <input type="text"
              value={editedUser.name}
              onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
              className="w-full p-3 mt-1 mb-4 border border-gray-300 rounded-lg focus:ring-azul1 focus:border-azul1 text-sm"
              placeholder="Nome"
            />
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input type="email"
              value={editedUser.email}
              onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
              className="w-full p-3 mt-1 mb-6 border border-gray-300 rounded-lg focus:ring-azul1 focus:border-azul1 text-sm"
              placeholder="E-mail"
            />

            <div className='flex flex-col gap-4'>
              <button onClick={handleSaveChanges} className="w-full bg-azul1 text-white font-semibold py-2 px-4 rounded-lg hover:bg-azul2 focus:outline-none focus:ring-2 focus:ring-azul2">Salvar</button>
              <button onClick={() => setIsEditOpen(false)} className="w-full border-solid border-2 border-azul1 text-azul1 font-semibold py-2 px-4 rounded-lg hover:bg-azul2 focus:outline-none focus:ring-2 focus:ring-azul2">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

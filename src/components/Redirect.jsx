import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../config/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { Loader2, AlertCircle, Home } from "lucide-react";

const Redirect = () => {
  const { code } = useParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      if (!code) {
        setError("Nenhum código de redirecionamento fornecido.");
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "links", code);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const targetUrl = data.originalUrl;

          // Incrementa cliques de forma atômica no Firestore
          await updateDoc(docRef, {
            clicks: increment(1)
          });

          // Redireciona
          window.location.replace(targetUrl);
        } else {
          setError("O link que você tentou acessar não existe ou foi excluído.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Erro no redirecionamento:", err);
        setError("Ocorreu um erro ao processar o redirecionamento.");
        setLoading(false);
      }
    };

    handleRedirect();
  }, [code]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "1rem"
      }}>
        <Loader2 size={40} className="animate-spin" style={{ color: "var(--accent-primary)", animation: "spin 1s linear infinite" }} />
        <h2 style={{ fontSize: "1.25rem", color: "var(--text-secondary)" }}>Redirecionando você...</h2>
        
        <style>{`
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "1rem"
    }}>
      <div className="glass-card animate-fade-in text-center" style={{ width: "100%", maxWidth: "480px" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "56px",
          height: "56px",
          borderRadius: "var(--radius-md)",
          background: "rgba(239, 68, 68, 0.1)",
          color: "#f87171",
          marginBottom: "1.5rem"
        }}>
          <AlertCircle size={32} />
        </div>
        <h1 style={{ fontSize: "1.75rem", margin: "0 0 1rem 0" }}>Link não Encontrado</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          {error || "Não conseguimos localizar o endereço solicitado."}
        </p>
        <button onClick={() => navigate("/login")} className="btn btn-primary" style={{ width: "100%" }}>
          <Home size={18} /> Voltar para o Login
        </button>
      </div>
    </div>
  );
};

export default Redirect;

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../config/firebase";
import { generateShortCode } from "../utils/generator";
import { 
  collection, 
  doc, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  Link2, 
  Copy, 
  Check, 
  Trash2, 
  LogOut, 
  ExternalLink, 
  Calendar, 
  MousePointerClick 
} from "lucide-react";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [longUrl, setLongUrl] = useState("");
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const baseDomain = window.location.origin;

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "links"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linksData = [];
      snapshot.forEach((doc) => {
        linksData.push({ id: doc.id, ...doc.data() });
      });
      setLinks(linksData);
    }, (err) => {
      console.error("Erro no listener do Firestore:", err);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleShorten = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    let formattedUrl = longUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      new URL(formattedUrl);
    } catch (err) {
      setError("Por favor, insira uma URL válida.");
      return;
    }

    setLoading(true);

    try {
      const code = generateShortCode();
      const linkRef = doc(db, "links", code);

      // Salva no firestore incluindo shortCode, originalUrl, clicks, userId e createdAt
      await setDoc(linkRef, {
        originalUrl: formattedUrl,
        shortCode: code,
        userId: currentUser.uid,
        clicks: 0,
        createdAt: serverTimestamp(),
      });

      setLongUrl("");
      setSuccess(`Link encurtado com sucesso! Código: ${code}`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error(err);
      setError("Falha ao salvar o link. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code, id) => {
    const fullShortLink = `${baseDomain}/r/${code}`;
    navigator.clipboard.writeText(fullShortLink);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir este link?")) {
      try {
        await deleteDoc(doc(db, "links", id));
      } catch (err) {
        console.error(err);
        alert("Falha ao excluir o link.");
      }
    }
  };

  return (
    <div className="app-container animate-fade-in" style={{ paddingBottom: "3rem" }}>
      
      {/* Header Personalizado: Encurta Link Senai */}
      <nav className="navbar">
        <div className="logo">
          <Link2 size={24} className="logo-accent" />
          <span>Encurta Link Senai</span>
        </div>
        <div className="user-profile">
          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            {currentUser?.email}
          </span>
          <button onClick={logout} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
            <LogOut size={16} /> Sair
          </button>
        </div>
      </nav>

      <main style={{ display: "grid", gap: "2rem" }}>
        
        <section className="glass-card">
          <h2 style={{ marginBottom: "0.5rem", fontSize: "1.75rem" }}>Encurtar um novo Link</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
            Cole sua URL longa e nós faremos o resto.
          </p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleShorten} style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "250px" }}>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Cole aqui seu link longo (ex: google.com)"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                style={{ padding: "1rem" }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-primary"
              style={{ minWidth: "150px", padding: "1rem" }}
            >
              {loading ? "Encurtando..." : "Encurtar Link"}
            </button>
          </form>
        </section>

        <section className="glass-card" style={{ padding: "2rem" }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>Seus Links Encurtados</h2>

          {links.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "3rem 0",
              color: "var(--text-muted)",
              fontSize: "0.95rem"
            }}>
              Nenhum link criado ainda. Encurte seu primeiro link acima!
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                minWidth: "600px"
              }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                    <th style={{ padding: "12px 8px", fontWeight: "600" }}>Link Original</th>
                    <th style={{ padding: "12px 8px", fontWeight: "600" }}>Link Encurtado</th>
                    <th style={{ padding: "12px 8px", fontWeight: "600" }}>Cliques</th>
                    <th style={{ padding: "12px 8px", fontWeight: "600" }}>Criado em</th>
                    <th style={{ padding: "12px 8px", textAlign: "right" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => {
                    const formattedDate = link.createdAt?.seconds 
                      ? new Date(link.createdAt.seconds * 1000).toLocaleDateString("pt-BR")
                      : "...";

                    // Usa shortCode ou id
                    const code = link.shortCode || link.id;
                    const shortUrl = `${baseDomain}/r/${code}`;

                    return (
                      <tr key={link.id} style={{ 
                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                        transition: "background-color 0.2s"
                      }} className="table-row">
                        <td style={{ padding: "16px 8px", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                            {link.originalUrl}
                          </span>
                        </td>
                        
                        <td style={{ padding: "16px 8px" }}>
                          <a 
                            href={shortUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ 
                              display: "inline-flex", 
                              alignItems: "center", 
                              gap: "4px", 
                              fontWeight: "600",
                              fontSize: "0.9rem" 
                            }}
                          >
                            /r/{code} <ExternalLink size={12} />
                          </a>
                        </td>

                        <td style={{ padding: "16px 8px" }}>
                          <span style={{ 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: "6px",
                            fontSize: "0.9rem",
                            color: "var(--text-secondary)"
                          }}>
                            <MousePointerClick size={14} style={{ color: "var(--accent-secondary)" }} />
                            {link.clicks}
                          </span>
                        </td>

                        <td style={{ padding: "16px 8px" }}>
                          <span style={{ 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: "6px",
                            fontSize: "0.85rem",
                            color: "var(--text-muted)"
                          }}>
                            <Calendar size={14} />
                            {formattedDate}
                          </span>
                        </td>

                        <td style={{ padding: "16px 8px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px" }}>
                            <button
                              onClick={() => handleCopy(code, link.id)}
                              className="btn btn-secondary"
                              style={{ padding: "6px 10px" }}
                              title="Copiar Link"
                            >
                              {copiedId === link.id ? <Check size={14} style={{ color: "var(--accent-secondary)" }} /> : <Copy size={14} />}
                            </button>
                            <button
                              onClick={() => handleDelete(link.id)}
                              className="btn btn-danger"
                              style={{ padding: "6px 10px" }}
                              title="Excluir Link"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default Dashboard;

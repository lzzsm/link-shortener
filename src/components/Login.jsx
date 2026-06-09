import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link2, Mail, Lock, LogIn, UserPlus } from "lucide-react";

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signUp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        await signUp(email, password);
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("E-mail ou senha incorretos.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Este e-mail já está em uso.");
      } else if (err.code === "auth/weak-password") {
        setError("A senha deve conter pelo menos 6 caracteres.");
      } else if (err.code === "auth/invalid-email") {
        setError("Formato de e-mail inválido.");
      } else {
        setError("Ocorreu um erro. Tente novamente mais tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Falha ao entrar com o Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "1rem"
    }}>
      <div className="glass-card animate-fade-in" style={{ width: "100%", maxWidth: "450px" }}>
        
        <div className="text-center mb-6">
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "var(--radius-md)",
            background: "rgba(59, 130, 246, 0.1)",
            color: "var(--accent-primary)",
            marginBottom: "1rem"
          }}>
            <Link2 size={32} />
          </div>
          <h1 style={{ fontSize: "2rem", margin: "0 0 0.5rem 0" }}>
            Encurta<span className="logo-accent">Senai</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            {isRegistering ? "Crie sua conta para começar" : "Encurte e gerencie seus links com facilidade"}
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">E-mail</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }} />
              <input
                id="email"
                type="email"
                required
                className="input-field"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "40px" }}
              />
            </div>
          </div>

          <div className="form-group mb-6">
            <label className="form-label" htmlFor="password">Senha</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }} />
              <input
                id="password"
                type="password"
                required
                className="input-field"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "40px" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", marginBottom: "1rem" }}
          >
            {loading ? "Processando..." : (
              isRegistering ? (
                <>
                  <UserPlus size={18} /> Cadastrar
                </>
              ) : (
                <>
                  <LogIn size={18} /> Entrar
                </>
              )
            )}
          </button>
        </form>

        <div style={{
          display: "flex",
          alignItems: "center",
          margin: "1.5rem 0",
          color: "var(--text-muted)",
          fontSize: "0.85rem"
        }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
          <span style={{ padding: "0 10px" }}>OU CONTINUAR COM</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn btn-google"
          style={{ width: "100%", display: "flex", gap: "8px", justifyContent: "center", fontWeight: "600" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.19-2.78-6.19-6.19s2.78-6.19 6.19-6.19c1.7 0 3.23.69 4.34 1.81l3.07-3.07C19.38 2.19 15.98 1 12.24 1 5.92 1 1 5.92 1 12.24s4.92 11.24 11.24 11.24c6.64 0 11.24-4.67 11.24-11.24 0-.78-.07-1.54-.2-2.285H12.24z"
            />
          </svg>
          Entrar com o Google
        </button>

        <div className="text-center mt-4" style={{ fontSize: "0.9rem" }}>
          <span style={{ color: "var(--text-secondary)" }}>
            {isRegistering ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
          </span>
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent-primary)",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              textDecoration: "underline"
            }}
          >
            {isRegistering ? "Fazer Login" : "Criar uma conta"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;

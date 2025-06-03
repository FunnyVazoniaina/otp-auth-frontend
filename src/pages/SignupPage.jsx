import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import axios from "axios";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // États pour les erreurs de validation
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: ""
  });

  const navigate = useNavigate();

  // Regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // Format international
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; // 3-20 caractères, lettres, chiffres, underscore

  // Validation en temps réel
  const validateField = (field, value) => {
    let errorMessage = "";

    switch (field) {
      case 'username':
        if (value.length === 0) {
          errorMessage = "";
        } else if (value.length < 3) {
          errorMessage = "Le nom d'utilisateur doit contenir au moins 3 caractères";
        } else if (value.length > 20) {
          errorMessage = "Le nom d'utilisateur ne peut pas dépasser 20 caractères";
        } else if (!usernameRegex.test(value)) {
          errorMessage = "Seules les lettres, chiffres et _ sont autorisés";
        }
        break;

      case 'email':
        if (value.length === 0) {
          errorMessage = "";
        } else if (!emailRegex.test(value)) {
          errorMessage = "Format d'email invalide (ex: user@domain.com)";
        }
        break;

      case 'phone':
        if (value.length === 0) {
          errorMessage = "";
        } else if (!phoneRegex.test(value)) {
          errorMessage = "Format de téléphone invalide (ex: +261341234567)";
        }
        break;

      case 'password':
        if (value.length === 0) {
          errorMessage = "";
        } else if (value.length < 6) {
          errorMessage = "Le mot de passe doit contenir au moins 6 caractères";
        }
        break;

      case 'passwordConfirm':
        if (value.length === 0) {
          errorMessage = "";
        } else if (value !== password) {
          errorMessage = "Les mots de passe ne correspondent pas";
        }
        break;

      default:
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: errorMessage
    }));
  };

  const handleInputChange = (field, value) => {
    switch (field) {
      case 'username':
        setUsername(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      case 'password':
        setPassword(value);
        // Re-valider la confirmation si elle existe
        if (passwordConfirm) {
          validateField('passwordConfirm', passwordConfirm);
        }
        break;
      case 'passwordConfirm':
        setPasswordConfirm(value);
        break;
    }
    validateField(field, value);
  };

  const isFormValid =
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    password.length >= 6 &&
    password === passwordConfirm;

  const isFormValidWithValidation = () => {
    return (
      username.trim().length >= 3 &&
      emailRegex.test(email) &&
      phoneRegex.test(phone) &&
      password.length >= 6 &&
      password === passwordConfirm &&
      Object.values(validationErrors).every(error => error === "")
    );
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isFormValidWithValidation()) {
      setError("Veuillez corriger les erreurs avant de continuer.");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        username,
        email,
        phone,
        password,
      });
      alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Une erreur est survenue lors de l'inscription."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <form
        onSubmit={handleSignup}
        className="bg-white shadow-lg rounded-lg max-w-md w-full p-8 space-y-6"
      >
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
          Créer un compte
        </h2>

        <div>
          <InputField
            label="Nom d'utilisateur"
            type="text"
            value={username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            required
            placeholder="Ex: user123"
          />
          {validationErrors.username && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <span className="mr-1">⚠️</span>
              {validationErrors.username}
            </p>
          )}
        </div>

        <div>
          <InputField
            label="Adresse Email"
            type="email"
            value={email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            placeholder="exemple@domaine.com"
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <span className="mr-1">⚠️</span>
              {validationErrors.email}
            </p>
          )}
        </div>

        <div>
          <InputField
            label="Numéro de téléphone (+261...)"
            type="tel"
            value={phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
            placeholder="+261 34 12 345 67"
          />
          {validationErrors.phone && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <span className="mr-1">⚠️</span>
              {validationErrors.phone}
            </p>
          )}
        </div>

        <div>
          <InputField
            label="Mot de passe (min 6 caractères)"
            type="password"
            value={password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
            placeholder="••••••••"
          />
          {validationErrors.password && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <span className="mr-1">⚠️</span>
              {validationErrors.password}
            </p>
          )}
          {password.length > 0 && !validationErrors.password && (
            <p className="text-green-500 text-sm mt-1 flex items-center">
              <span className="mr-1">✅</span>
              Mot de passe valide
            </p>
          )}
        </div>

        <div>
          <InputField
            label="Confirmer mot de passe"
            type="password"
            value={passwordConfirm}
            onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
            required
            placeholder="••••••••"
          />
          {validationErrors.passwordConfirm && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <span className="mr-1">⚠️</span>
              {validationErrors.passwordConfirm}
            </p>
          )}
          {passwordConfirm.length > 0 && !validationErrors.passwordConfirm && password === passwordConfirm && (
            <p className="text-green-500 text-sm mt-1 flex items-center">
              <span className="mr-1">✅</span>
              Les mots de passe correspondent
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 font-medium flex items-center">
              <span className="mr-2">❌</span>
              {error}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!isFormValid || loading}
          className={`w-full ${
            !isFormValid 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? "Inscription en cours..." : "S'inscrire"}
        </Button>

              <p className="mt-4 text-center text-gray-600">
          Déjà un compte ?{" "}
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Connectez-vous ici
          </Link>
        </p>
      </form>
    </div>
  );
}


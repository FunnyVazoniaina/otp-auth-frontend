import { useState } from "react";
import { Link } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import axios from "axios";

export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [contact, setContact] = useState(""); // email ou phone
  const [otpMethod, setOtpMethod] = useState("email"); // email | sms | voice
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("login"); // "login" | "mfa" | "otp"
  const [tempToken, setTempToken] = useState("");
  const [otp, setOtp] = useState("");
  
  // États pour les erreurs de validation
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    password: "",
    passwordConfirm: "",
    contact: "",
    otp: ""
  });

  // Regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const otpRegex = /^\d{6}$/;

  // Validation en temps réel
  const validateField = (field, value) => {
    let errorMessage = "";

    switch (field) {
      case 'username':
        if (value.length === 0) {
          errorMessage = "";
        } else if (value.length < 3) {
          errorMessage = "Le nom d'utilisateur doit contenir au moins 3 caractères";
        } else if (!usernameRegex.test(value)) {
          errorMessage = "Format de nom d'utilisateur invalide";
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

      case 'contact':
        if (value.length === 0) {
          errorMessage = "";
        } else if (otpMethod === 'email' && !emailRegex.test(value)) {
          errorMessage = "Format d'email invalide (ex: user@domain.com)";
        } else if ((otpMethod === 'sms' || otpMethod === 'voice') && !phoneRegex.test(value)) {
          errorMessage = "Format de téléphone invalide (ex: +261341234567)";
        }
        break;

      case 'otp':
        if (value.length === 0) {
          errorMessage = "";
        } else if (!otpRegex.test(value)) {
          errorMessage = "L'OTP doit contenir exactement 6 chiffres";
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
      case 'contact':
        setContact(value);
        break;
      case 'otp':
        // Limiter à 6 chiffres
        if (value.length <= 6 && /^\d*$/.test(value)) {
          setOtp(value);
        }
        break;
    }
    validateField(field, value);
  };

  const isFormValid =
    username.trim().length > 0 &&
    password.length >= 6 &&
    password === passwordConfirm &&
    contact.trim().length > 0;

  const isLoginFormValid = () => {
    return (
      username.trim().length >= 3 &&
      password.length >= 6 &&
      password === passwordConfirm &&
      contact.trim().length > 0 &&
      !validationErrors.username &&
      !validationErrors.password &&
      !validationErrors.passwordConfirm &&
      !validationErrors.contact
    );
  };

  const isMfaFormValid = () => {
    return (
      contact.trim().length > 0 &&
      !validationErrors.contact
    );
  };

  const isOtpValid = () => {
    return otpRegex.test(otp);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setError(
        "Veuillez remplir correctement tous les champs et vérifier que les mots de passe correspondent."
      );
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = { username, password, otpMethod };
      if (otpMethod === "email") {
        payload.email = contact;
      } else {
        payload.phone = contact;
      }
      await axios.post("http://localhost:5000/api/auth/request-otp", payload);
      alert(
        `OTP envoyé via ${
          otpMethod === "email" ? "Email" : otpMethod === "sms" ? "SMS" : "Appel vocal"
        }`
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Une erreur est survenue lors de l'envoi de l'OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isLoginFormValid()) {
      setError("Veuillez corriger les erreurs avant de continuer.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password
      });

      if (response.data.mfaRequired) {
        setTempToken(response.data.tempToken);
        setStep("mfa");
      } else {
        // Connexion réussie sans MFA
        localStorage.setItem('token', response.data.token);
        alert("Connexion réussie !");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Une erreur est survenue lors de la connexion."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtpMfa = async (e) => {
    e.preventDefault();
    if (!isMfaFormValid()) {
      setError("Veuillez corriger les erreurs avant de continuer.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/auth/send-otp", {
        tempToken,
        method: otpMethod,
        contact
      });
      
      setStep("otp");
      alert(
        `OTP envoyé via ${
          otpMethod === "email" ? "Email" : otpMethod === "sms" ? "SMS" : "Appel vocal"
        }`
      );
    } catch (err) {
      setError(
        err.response?.data?.error || "Une erreur est survenue lors de l'envoi de l'OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!isOtpValid()) {
      setError("Veuillez saisir un OTP valide (6 chiffres).");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        tempToken,
        otp
      });

      localStorage.setItem('token', response.data.token);
      alert("Authentification réussie !");
      // Rediriger vers le dashboard ou page principale
    } catch (err) {
      setError(
        err.response?.data?.error || "Une erreur est survenue lors de la vérification de l'OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <>
      <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
        Connexion avec OTP
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

      <div>
        <label className="block mb-2 font-semibold text-gray-700">
          Méthode d'envoi OTP
        </label>
        <select
          value={otpMethod}
          onChange={(e) => {
            setOtpMethod(e.target.value);
            setContact("");
            setValidationErrors(prev => ({ ...prev, contact: "" }));
          }}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="voice">Appel vocal</option>
        </select>
      </div>

      <div>
        <InputField
          label={otpMethod === "email" ? "Adresse Email" : "Numéro de téléphone (+261...)"}
          type={otpMethod === "email" ? "email" : "tel"}
          value={contact}
          onChange={(e) => handleInputChange('contact', e.target.value)}
          required
          placeholder={
            otpMethod === "email"
              ? "exemple@domaine.com"
              : "+261 34 12 345 67"
          }
        />
        {validationErrors.contact && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <span className="mr-1">⚠️</span>
            {validationErrors.contact}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!isFormValid || loading}
        className={`w-full ${
          !isFormValid 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
        onClick={handleSendOtp}
      >
        {loading ? "Envoi en cours..." : "Envoyer OTP"}
      </Button>
    </>
  );

  const renderMfaForm = () => (
    <>
      <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
        Authentification à deux facteurs
      </h2>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
        <p className="text-blue-700 text-sm flex items-center">
          <span className="mr-2">🔐</span>
          Pour votre sécurité, veuillez choisir une méthode de vérification
        </p>
      </div>

      <div>
        <label className="block mb-2 font-semibold text-gray-700">
          Méthode d'envoi OTP
        </label>
        <select
          value={otpMethod}
          onChange={(e) => {
            setOtpMethod(e.target.value);
            setContact("");
            setValidationErrors(prev => ({ ...prev, contact: "" }));
          }}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="email">📧 Email</option>
          <option value="sms">📱 SMS</option>
          <option value="voice">📞 Appel vocal</option>
        </select>
      </div>

      <div>
        <InputField
          label={otpMethod === "email" ? "Adresse Email" : "Numéro de téléphone"}
          type={otpMethod === "email" ? "email" : "tel"}
          value={contact}
          onChange={(e) => handleInputChange('contact', e.target.value)}
          required
          placeholder={
            otpMethod === "email"
              ? "exemple@domaine.com"
              :              "+261341234567"
          }
        />
        {validationErrors.contact && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <span className="mr-1">⚠️</span>
            {validationErrors.contact}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!isMfaFormValid() || loading}
        className={`w-full ${
          !isMfaFormValid() 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
        onClick={handleSendOtpMfa}
      >
        {loading ? "Envoi en cours..." : "Envoyer OTP"}
      </Button>
    </>
  );

  const renderOtpForm = () => (
    <>
      <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
        Vérification OTP
      </h2>

      <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
        <p className="text-green-700 text-sm flex items-center">
          <span className="mr-2">✅</span>
          Code envoyé via {otpMethod === "email" ? "Email" : otpMethod === "sms" ? "SMS" : "Appel vocal"}
        </p>
        <p className="text-green-600 text-xs mt-1">
          Vérifiez votre {otpMethod === "email" ? "boîte email" : "téléphone"}
        </p>
      </div>

      <div>
        <InputField
          label="Code de vérification (6 chiffres)"
          type="text"
          value={otp}
          onChange={(e) => handleInputChange('otp', e.target.value)}
          required
          placeholder="123456"
          maxLength={6}
        />
        {validationErrors.otp && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <span className="mr-1">⚠️</span>
            {validationErrors.otp}
          </p>
        )}
        {otp.length > 0 && isOtpValid() && (
          <p className="text-green-500 text-sm mt-1 flex items-center">
            <span className="mr-1">✅</span>
            Code valide
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!isOtpValid() || loading}
        className={`w-full ${
          !isOtpValid() 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
        onClick={handleVerifyOtp}
      >
        {loading ? "Vérification en cours..." : "Vérifier OTP"}
      </Button>

      <button
        type="button"
        onClick={() => setStep("mfa")}
        className="w-full mt-3 text-indigo-600 hover:text-indigo-800 font-medium"
      >
        ← Changer de méthode
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <form
        onSubmit={step === "login" ? handleSendOtp : step === "mfa" ? handleSendOtpMfa : handleVerifyOtp}
        className="bg-white shadow-lg rounded-lg max-w-md w-full p-8 space-y-6"
      >
        {step === "login" && renderLoginForm()}
        {step === "mfa" && renderMfaForm()}
        {step === "otp" && renderOtpForm()}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 font-medium flex items-center">
              <span className="mr-2">❌</span>
              {error}
            </p>
          </div>
        )}

        {step === "login" && (
          <p className="mt-4 text-center text-gray-600">
            Pas encore de compte ?{" "}
            <Link
              to="/signup"
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Inscrivez-vous ici
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}


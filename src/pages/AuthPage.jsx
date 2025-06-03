import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import { requestOtp } from '../services/api';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await requestOtp({ email, phone });
      navigate('/verify', { state: { email, phone } });
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la requête OTP');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Connexion OTP</h2>
        <InputField label="Email (optionnel)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <InputField label="Téléphone (+261...)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">
          Envoyer OTP
        </button>
      </form>
    </div>
  );
}

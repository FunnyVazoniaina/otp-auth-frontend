import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InputField from '../components/InputField';
import { verifyOtp } from '../services/api';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const { state } = useLocation();

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await verifyOtp({ otp, email: state.email, phone: state.phone });
      navigate('/success');
    } catch (err) {
      alert(err.response?.data?.message || 'Échec de la vérification OTP');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleVerify} className="bg-white p-6 rounded-lg shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Vérification OTP</h2>
        <InputField label="Code OTP" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
        <button type="submit" className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700">
          Vérifier
        </button>
      </form>
    </div>
  );
}

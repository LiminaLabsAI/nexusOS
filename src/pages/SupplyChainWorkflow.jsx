import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SupplyChainWorkflow() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/scenarios');
  }, [navigate]);
  return null;
}
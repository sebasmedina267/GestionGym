import { useFetch } from "../../hooks/useFetch";
import { useGym } from "../../hooks/useGym";
import { useAuth } from "../../hooks/useAuth";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function SelectGymPage() {
  const { admin } = useAuth();
  const { setGym } = useGym();
  const navigate = useNavigate();

  const { data: gyms, loading } = useFetch(admin ? `/gyms` : null);

  if (!admin) return <p>Cargando usuario...</p>;

  const handleSelect = (gym) => {
    setGym(gym);  
    navigate("/");
  };

  if (loading) return <p>Cargando gimnasios...</p>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {gyms?.map((gym) => (
        <Card key={gym.id}>
          <h2 className="text-xl font-bold">{gym.nombre}</h2>
          <p className="text-gray-600">{gym.direccion}</p>

          <Button className="mt-4" onClick={() => handleSelect(gym)}>
            Seleccionar
          </Button>
        </Card>
      ))}
    </div>
  );
}

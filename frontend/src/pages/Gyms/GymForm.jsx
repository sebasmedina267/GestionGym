import Input from "../../components/ui/Input";

export default function GymForm({ form, setForm, errors, setErrors }) {
  const update = (field) => (v) => { 
    setForm((f) => ({ ...f, [field]: v })); 
    setErrors({}); 
  };
  
  return (
    <div className="gym-form-grid">
      <Input 
        label="Nombre de la Sucursal" 
        value={form.nombre} 
        onChange={update("nombre")} 
        error={errors.nombre} 
        variant="kinetic"
        icon="location_city"
        placeholder="Ej: Onyx North District"
      />
      <Input 
        label="Dirección" 
        value={form.direccion} 
        onChange={update("direccion")} 
        error={errors.direccion} 
        variant="kinetic"
        icon="map"
        placeholder="Calle, número y colonia..."
      />
      <Input 
        label="Ciudad / Municipio" 
        value={form.ciudad} 
        onChange={update("ciudad")} 
        error={errors.ciudad} 
        variant="kinetic"
        icon="home_pin"
        placeholder="Ej: Ciudad de México"
      />
      <Input
        label="URL Foto del Gym"
        type="text"
        placeholder="Ej: /uploads/gyms/gym1.jpg"
        value={form.foto}
        onChange={update("foto")}
        error={errors.foto}
        variant="kinetic"
        icon="image"
      />
    </div>
  );
}

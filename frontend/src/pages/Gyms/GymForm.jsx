import Input from "../../components/ui/Input";

export default function GymForm({ form, setForm, errors, setErrors }) {
  const update = (field) => (v) => { setForm((f) => ({ ...f, [field]: v })); setErrors({}); };
  return (
    <>
      <Input label="Nombre *" value={form.nombre} onChange={update("nombre")} error={errors.nombre} />
      <Input label="Dirección *" value={form.direccion} onChange={update("direccion")} error={errors.direccion} />
      <Input label="Ciudad / Municipio *" value={form.ciudad} onChange={update("ciudad")} error={errors.ciudad} />
      <Input
        label="URL Foto del Gym"
        type="text"
        placeholder="Ej: /uploads/gyms/gym1.jpg o https://..."
        value={form.foto}
        onChange={update("foto")}
        error={errors.foto}
      />
    </>
  );
}

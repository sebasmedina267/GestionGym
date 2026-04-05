import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import GymForm from "./GymForm";

export default function GymsFormModal({
  open,
  onClose,
  title,
  form,
  setForm,
  errors,
  setErrors,
  onSubmit,
  saving,
  submitText
}) {
  return (
    <Modal open={open} onClose={() => { onClose(); setErrors({}); }} title={title}>
      <GymForm form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
      <Button variant="primary" loading={saving} onClick={onSubmit} style={{ width: "100%", marginTop: "8px" }}>
        {submitText}
      </Button>
    </Modal>
  );
}

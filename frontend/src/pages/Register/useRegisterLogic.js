import { useState } from "react";
import { validateForm } from "../../utils/validators";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const useRegisterLogic = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        confirmPassword: "",
        rol: "DUENO", // Ahora será DUENO o USUARIO
        gymNombre: "",
        gymDireccion: "",
        gymUrlWeb: "",
        gymFoto: null,
    });

    const isOwner = form.rol === "DUENO";

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const handleInputChange = (field, value) => {
        if (field === "rol") {
            setForm({
                ...form,
                rol: value,
                gymNombre: "",
                gymDireccion: "",
                gymUrlWeb: "",
                gymFoto: null,
            });
        } else {
            setForm({ ...form, [field]: value });
        }
    };

    const handleFileChange = (field, file) => {
        setForm({ ...form, [field]: file });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");

        const validation = validateForm({
            nombre: { value: form.nombre, required: true },
            apellido: { value: form.apellido, required: true },
            email: { value: form.email, required: true },
            password: { value: form.password, required: true, min: 8 },
            confirmPassword: {
                value: form.confirmPassword,
                required: true,
                min: 8,
            },
            ...(isOwner
                ? { gymNombre: { value: form.gymNombre, required: true } }
                : {}),
        });

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            validation.email = "Correo electrónico inválido";
        }

        if (!PASSWORD_REGEX.test(form.password)) {
            validation.password =
                "Debe tener 8 caracteres, 1 mayuscula, 1 numero y 1 simbolo";
        }

        if (form.password !== form.confirmPassword) {
            validation.confirmPassword = "Las contrasenas no coinciden";
        }

        setErrors(validation);

        if (Object.keys(validation).length > 0) return;

        try {
            setLoading(true);

            if (isOwner) {
                const formData = new FormData();
                formData.append("nombre", form.nombre);
                formData.append("apellido", form.apellido);
                formData.append("email", form.email);
                formData.append("password", form.password);
                formData.append("gymNombre", form.gymNombre);
                if (form.gymDireccion) formData.append("gymDireccion", form.gymDireccion);
                if (form.gymUrlWeb) formData.append("gymUrlWeb", form.gymUrlWeb);
                if (form.gymFoto) formData.append("gymFoto", form.gymFoto);

                await api.post("/auth/register-owner", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // Redirigir al pago Stripe con el email para activarlo luego
                navigate("/stripe-checkout", { state: { email: form.email } }); 
            } else {
                await api.post("/auth/user/register", {
                    nombre: form.nombre,
                    apellido: form.apellido,
                    email: form.email,
                    password: form.password,
                });

                setSuccess("Registro completado exitosamente. Puede iniciar sesión.");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }

        } catch (err) {
            setErrors({
                general:
                    err.response?.data?.message || err.response?.data?.error || err.message ||
                    "Error al registrar",
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        errors,
        loading,
        success,
        isOwner,
        handleInputChange,
        handleFileChange,
        handleSubmit,
    };
};


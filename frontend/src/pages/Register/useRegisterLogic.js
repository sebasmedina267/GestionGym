import { useMemo, useState } from "react";
import { validateForm } from "../../utils/validators";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const useRegisterLogic = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        password: "",
        confirmPassword: "",
        rol: "DUENO",
        gymNombre: "",
        gymDireccion: "",
        gymId: "",
    });

    const isOwner = form.rol === "DUENO";
    const { data: gyms, loading: gymsLoading } = useFetch(
        !isOwner ? "/gyms" : null
    );

    const gymsList = useMemo(() => {
        if (!Array.isArray(gyms)) return [];
        return gyms;
    }, [gyms]);

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const handleInputChange = (field, value) => {
        if (field === "rol") {
            setForm({
                ...form,
                rol: value,
                gymId: "",
                gymNombre: "",
                gymDireccion: "",
            });
        } else {
            setForm({ ...form, [field]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");

        const validation = validateForm({
            nombre: { value: form.nombre, required: true },
            apellido: { value: form.apellido, required: true },
            password: { value: form.password, required: true, min: 8 },
            confirmPassword: {
                value: form.confirmPassword,
                required: true,
                min: 8,
            },
            ...(isOwner
                ? { gymNombre: { value: form.gymNombre, required: true } }
                : { gymId: { value: form.gymId, required: true, number: true } }),
        });

        if (!PASSWORD_REGEX.test(form.password)) {
            validation.password =
                "Debe tener 8 caracteres, 1 mayuscula, 1 numero y 1 simbolo";
        }

        if (form.password !== form.confirmPassword) {
            validation.confirmPassword = "Las contrasenas no coinciden";
        }

        if (!isOwner && !localStorage.getItem("token")) {
            validation.general = "Debes iniciar sesion como dueno para registrar empleados";
        }

        setErrors(validation);

        if (Object.keys(validation).length > 0) return;

        try {
            setLoading(true);

            if (isOwner) {
                await api.post("/auth/register-owner", {
                    nombre: form.nombre,
                    apellido: form.apellido,
                    password: form.password,
                    gymNombre: form.gymNombre,
                    gymDireccion: form.gymDireccion || undefined,
                });

                navigate("/login");
                return;
            }

            await api.post("/auth/register-employee", {
                nombre: form.nombre,
                apellido: form.apellido,
                password: form.password,
                gymId: Number(form.gymId),
            });

            setSuccess("Empleado registrado correctamente");
            setForm({
                nombre: "",
                apellido: "",
                password: "",
                confirmPassword: "",
                rol: "TRABAJADOR",
                gymNombre: "",
                gymDireccion: "",
                gymId: "",
            });
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
        gymsLoading,
        gymsList,
        handleInputChange,
        handleSubmit,
    };
};

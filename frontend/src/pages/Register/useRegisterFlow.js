import { useState } from "react";
import { validateForm } from "../../utils/validators";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

/**
 * Password Security Requirements:
 * - At least 1 uppercase letter
 * - At least 1 digit
 * - At least 1 special character
 * - Minimum 8 characters long
 */
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

/**
 * useRegisterFlow Custom Hook
 * 
 * Orchestrates the multi-step registration logic for the platform.
 * Manages state for steps, user types, form data, and API interactions.
 * 
 * Flow:
 * Step 0: Role Selection (Owner or User)
 * Step 1: Personal Data (Name, Email, Password)
 * Step 2: Specific Data (Gyms for Owners, Additional profile info for Users)
 * Step 3: Payment (Owners only)
 */
export const useRegisterFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0); 
  const [userType, setUserType] = useState(null); // 'DUENO' (Owner) or 'USUARIO' (User)
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    // User-specific profile data
    fechaNacimiento: "",
    sexo: "",
    acceptTerms: false,
    // Owner-specific branch data (Array to support multiple locations)
    gyms: [
      {
        nombre: "",
        calle: "",
        numero: "",
        ciudad: "",
        provincia: "",
        municipio: "",
        foto: null,
      },
    ],
  });

  const [errors, setErrors] = useState({});

  /**
   * Step 0: Sets the user role and advances to personal data step.
   * @param {string} type - 'DUENO' or 'USUARIO'
   */
  const selectUserType = (type) => {
    setUserType(type);
    setCurrentStep(1);
    setError("");
    setErrors({});
  };

  /**
   * Step 1 Validation: Validates core account credentials.
   * @returns {boolean} - True if valid, false otherwise
   */
  const validatePersonalData = () => {
    const validation = validateForm({
      nombre: { value: formData.nombre, required: true },
      apellido: { value: formData.apellido, required: true },
      email: { value: formData.email, required: true },
      password: { value: formData.password, required: true, min: 8 },
      confirmPassword: {
        value: formData.confirmPassword,
        required: true,
        min: 8,
      },
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      validation.email = "Formato de correo inválido";
    }

    if (formData.password && !PASSWORD_REGEX.test(formData.password)) {
      validation.password =
        "Debe tener 8+ caracteres, mayúscula, número y símbolo";
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      validation.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(validation);
    return Object.keys(validation).length === 0;
  };

  /** Advances from Personal Data to Step 2 if valid. */
  const nextStepPersonal = () => {
    if (validatePersonalData()) {
      setCurrentStep(2);
      setError("");
    }
  };

  /**
   * Step 2 Validation: Validates business or profile details based on role.
   * @returns {boolean} - True if valid, false otherwise
   */
  const validateSpecificData = () => {
    const validation = {};

    if (userType === "DUENO") {
      // Owners must provide at least one gym with a name and location
      if (
        formData.gyms.length === 0 ||
        !formData.gyms[0].nombre.trim()
      ) {
        validation.gym = "Debes crear al menos un gimnasio con nombre";
      }
      
      const firstGym = formData.gyms[0];
      if (!firstGym.calle.trim()) validation.calle = "La dirección es obligatoria";
      if (!firstGym.ciudad.trim()) validation.ciudad = "La ciudad es obligatoria";
    } else if (userType === "USUARIO") {
      // Users must accept legal terms and provide birth date
      if (!formData.acceptTerms) {
        validation.acceptTerms = "Debes aceptar los términos y condiciones";
      }
      if (!formData.fechaNacimiento) {
        validation.fechaNacimiento = "La fecha de nacimiento es obligatoria";
      }
    }

    setErrors(validation);
    return Object.keys(validation).length === 0;
  };

  /** Advances from Step 2 to Step 3 (Payment) or Submits (User). */
  const nextStepSpecific = () => {
    if (validateSpecificData()) {
      if (userType === "DUENO") {
        setCurrentStep(3); // Proceed to payment review
      } else {
        submitUserRegistration(); // Directly submit for free user accounts
      }
      setError("");
    }
  };

  /**
   * Owner Flow: Pre-registers the owner (inactive) and redirects to Stripe Checkout.
   * Persistence: Saves pending data in sessionStorage for post-payment activation.
   */
  const processDuenoPayment = async () => {
    try {
      setLoading(true);
      setError("");

      const gymsForBackend = formData.gyms.map(gym => ({
        ...gym,
        direccion: gym.calle.trim(),
      }));

      // 1. Create the owner account in the backend (set as inactive until payment)
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('nombre', formData.nombre);
      formDataToSubmit.append('apellido', formData.apellido);
      formDataToSubmit.append('email', formData.email);
      formDataToSubmit.append('password', formData.password);
      formDataToSubmit.append('gymNombre', gymsForBackend[0].nombre);
      formDataToSubmit.append('gymDireccion', gymsForBackend[0].direccion);
      if (gymsForBackend[0].ciudad) {
        formDataToSubmit.append('gymCiudad', gymsForBackend[0].ciudad);
      }

      await api.post("/auth/register-owner", formDataToSubmit);

      // Store context for post-checkout processing
      sessionStorage.setItem("pendingRegistrationEmail", formData.email);
      sessionStorage.setItem(
        "pendingRegistrationData",
        JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          password: formData.password,
          gyms: gymsForBackend,
        })
      );

      // Redirect to the Stripe Checkout handler page
      navigate("/stripe-checkout", {
        state: {
          email: formData.email,
          nombre: formData.nombre,
          apellido: formData.apellido,
          gymNombre: formData.gyms[0]?.nombre,
        },
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al preparar el registro y el pago");
      setLoading(false);
    }
  };

  /**
   * User Flow: Submits the client registration to the backend immediately.
   */
  const submitUserRegistration = async () => {
    try {
      setLoading(true);
      setError("");

      await api.post("/auth/user/register", {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
        fechaNacimiento: formData.fechaNacimiento || null,
        sexo: formData.sexo || null,
      });

      setSuccess("¡Registro exitoso! Redirigiéndote al login...");
      setCurrentStep(2.5); // Displays success view
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error durante el registro");
    } finally {
      setLoading(false);
    }
  };

  /** Updates main form fields and clears related errors. */
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  /** Updates specific gym branch data within the gyms array. */
  const handleGymChange = (index, field, value) => {
    setFormData((prev) => {
      const newGyms = [...prev.gyms];
      newGyms[index] = { ...newGyms[index], [field]: value };
      return { ...prev, gyms: newGyms };
    });
    
    if (errors[field] || errors.gym) {
        setErrors(prev => ({ ...prev, [field]: "", gym: "" }));
    }
  };

  /** Adds an additional empty gym branch to the list (Max 5). */
  const addGym = () => {
    if (formData.gyms.length < 5) {
      setFormData((prev) => ({
        ...prev,
        gyms: [
          ...prev.gyms,
          {
            nombre: "",
            calle: "",
            numero: "",
            ciudad: "",
            provincia: "",
            municipio: "",
            foto: null,
          },
        ],
      }));
    }
  };

  /** Removes a gym branch from the list by its index. */
  const removeGym = (index) => {
    if (formData.gyms.length > 1) {
      setFormData((prev) => ({
        ...prev,
        gyms: prev.gyms.filter((_, i) => i !== index),
      }));
    }
  };

  /** Navigates back one step in the flow. */
  const goBack = () => {
    if (currentStep > 0) {
      if (currentStep === 2.5) return;
      setCurrentStep(currentStep - 1);
      setError("");
      setErrors({});
    }
  };

  return {
    currentStep,
    userType,
    formData,
    errors,
    loading,
    success,
    error,
    selectUserType,
    nextStepPersonal,
    nextStepSpecific,
    processDuenoPayment,
    handleInputChange,
    handleGymChange,
    addGym,
    removeGym,
    goBack,
  };
};

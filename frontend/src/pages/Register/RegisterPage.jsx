import React from "react";
import { useRegisterLogic } from "./useRegisterLogic";
import RegisterForm from "./RegisterForm";
import "./Styles/Register.css";

export default function RegisterPage() {
    const {
        form,
        errors,
        loading,
        success,
        isOwner,
        gymsLoading,
        gymsList,
        handleInputChange,
        handleSubmit,
    } = useRegisterLogic();

    return (
        <div className="register-page-container">
            {/* Atmospheric Background Elements */}
            <div className="register-ambient-glow-1"></div>
            <div className="register-ambient-glow-2"></div>
            <div className="register-texture-overlay"></div>

            {/* Registration Container */}
            <main className="register-main-content">
                {/* Glassmorphism Card */}
                <section className="register-glass-card">
                    <header className="register-brand-header">
                        <h1 className="register-brand-title">Crear Administrador</h1>
                        <p className="register-brand-subtitle">Configura tu centro de gestión y credenciales</p>
                    </header>

                    {/* Form Component */}
                    <RegisterForm
                        form={form}
                        errors={errors}
                        loading={loading}
                        success={success}
                        isOwner={isOwner}
                        gymsLoading={gymsLoading}
                        gymsList={gymsList}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                    />
                </section>
            </main>
        </div>
    );
}

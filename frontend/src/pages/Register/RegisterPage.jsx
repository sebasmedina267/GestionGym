import React from "react";
import { useRegisterLogic } from "./useRegisterLogic";
import RegisterForm from "./RegisterForm";
import "./Register.css";

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
        <div className="register-page-body flex items-center justify-center p-4 min-h-screen">
            {/* Atmospheric Background Elements */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-secondary/10 blur-[100px] rounded-full"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
            </div>

            {/* Registration Container */}
            <main className="relative z-10 w-full max-w-lg my-8">
                {/* Glassmorphism Card */}
                <section className="glass-panel rounded-3xl p-6 md:p-10 shadow-[0px_40px_80px_rgba(0,0,0,0.5)]">
                    <div className="mb-6 text-center">
                        <h3 className="text-2xl font-bold text-on-surface mb-1">Crear Administrador</h3>
                        <p className="text-on-surface-variant/80 text-xs">Configura tu centro de gestión y credenciales</p>
                    </div>

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

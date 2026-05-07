import React from "react";
import { useLoginLogic } from "./useLoginLogic";
import LoginForm from "./LoginForm";
import "./Styles/Login.css";

/**
 * LoginPage Component
 * 
 * The primary entry point for administrative and employee users.
 * Features a high-fidelity glassmorphism design with atmospheric background elements.
 */
export default function LoginPage() {
    // Orchestrate logic using a custom hook for separation of concerns
    const { form, loading, error, handleInputChange, handleSubmit } = useLoginLogic();

    return (
        <div className="login-page-container">
            {/* --- Atmospheric Background Decoration --- */}
            {/* Visual glow elements to create depth and focus */}
            <div className="login-ambient-glow-1"></div>
            <div className="login-ambient-glow-2"></div>
            
            {/* Subtle grain/noise texture overlay for a premium feel */}
            <div className="login-texture-overlay"></div>

            {/* --- Main Content Area --- */}
            <main className="login-main-content">
                {/* 
                  Glassmorphism Card: 
                  Utilizes backdrop-filter and semi-transparent borders for a modern look 
                */}
                <div className="login-glass-card">
                    
                    {/* Brand/Header: Displays application branding and context */}
                    <header className="login-brand-header">
                        <div className="login-brand-icon-wrapper">
                            <span className="material-symbols-outlined login-brand-icon">
                                fitness_center
                            </span>
                        </div>
                        <h1 className="login-brand-title">
                            Acceso al Sistema
                        </h1>
                        <p className="login-brand-subtitle">
                            Motor de Gestión FitFlow
                        </p>
                    </header>

                    {/* 
                      Form Component: 
                      Abstracted into a sub-component to keep this container clean 
                    */}
                    <LoginForm
                        form={form}
                        loading={loading}
                        error={error}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                    />

                    {/* Decorative Info Footer: Displays versioning and security indicators */}
                    <div className="login-decorative-footer">
                        <div className="login-version-tags">
                            <span className="login-version-tag">v2.4.0</span>
                            <span className="login-version-tag">Seguro de Extremo a Extremo</span>
                        </div>
                        <div className="login-footer-line"></div>
                    </div>
                </div>
            </main>
        </div>
    );
}

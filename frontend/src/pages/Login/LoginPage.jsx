import React from "react";
import { useLoginLogic } from "./useLoginLogic";
import LoginForm from "./LoginForm";
import "./Styles/Login.css";

export default function LoginPage() {
    const { form, loading, error, handleInputChange, handleSubmit } = useLoginLogic();

    return (
        <div className="login-page-container">
            {/* Atmospheric Background Decoration */}
            <div className="login-ambient-glow-1"></div>
            <div className="login-ambient-glow-2"></div>
            
            {/* Texture Layer */}
            <div className="login-texture-overlay"></div>

            {/* Main Content */}
            <main className="login-main-content">
                {/* Login Card */}
                <div className="login-glass-card">
                    {/* Brand/Header */}
                    <header className="login-brand-header">
                        <div className="login-brand-icon-wrapper">
                            <span className="material-symbols-outlined login-brand-icon">
                                fitness_center
                            </span>
                        </div>
                        <h1 className="login-brand-title">
                            Ingreso al sistema
                        </h1>
                        <p className="login-brand-subtitle">
                            Acceso FitFlow Pro
                        </p>
                    </header>

                    {/* Form Component */}
                    <LoginForm
                        form={form}
                        loading={loading}
                        error={error}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                    />

                    {/* Decorative Info Footer */}
                    <div className="login-decorative-footer">
                        <div className="login-version-tags">
                            <span className="login-version-tag">v2.4.0</span>
                            <span className="login-version-tag">Secure Access</span>
                        </div>
                        <div className="login-footer-line"></div>
                    </div>
                </div>
            </main>
        </div>
    );
}

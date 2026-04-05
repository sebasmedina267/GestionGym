import React from "react";
import { useLoginLogic } from "./useLoginLogic";
import LoginForm from "./LoginForm";
import "./Login.css";

export default function LoginPage() {
    const { form, loading, error, handleInputChange, handleSubmit } = useLoginLogic();

    return (
        <div className="login-page-body min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-surface">
            {/* Atmospheric Background Decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px] pointer-events-none"></div>
            
            {/* Texture Layer */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] carbon-texture"></div>

            {/* Main Content */}
            <main className="w-full max-w-md z-10 animate-fade-in">
                {/* Login Card */}
                <div className="glass-panel-login rounded-[2.5rem] p-8 md:p-12 shadow-[0px_40px_80px_rgba(0,0,0,0.4)] border border-outline-variant/15">
                    {/* Brand/Header */}
                    <header className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-surface-container-highest mb-6 shadow-inner ring-1 ring-white/5">
                            <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                fitness_center
                            </span>
                        </div>
                        <h1 className="text-on-surface text-3xl font-black tracking-tight font-headline uppercase mb-2">
                            Ingreso al sistema
                        </h1>
                        <p className="text-on-surface-variant text-xs font-label tracking-widest uppercase opacity-70">
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
                    <div className="mt-12 flex justify-between items-center opacity-30 px-2">
                        <div className="flex gap-4">
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">v2.4.0</span>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Secure Access</span>
                        </div>
                        <div className="w-12 h-px bg-outline-variant/30"></div>
                    </div>
                </div>
            </main>
        </div>
    );
}

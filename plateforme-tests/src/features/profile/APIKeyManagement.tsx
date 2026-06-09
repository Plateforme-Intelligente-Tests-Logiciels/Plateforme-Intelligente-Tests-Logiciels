"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useAPIKey } from "./api-key-hooks";

const renderMaskedKey = (maskedKey: string | null) => {
  if (!maskedKey) {
    return (
      <span className="flex items-center gap-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block"></span>
        ))}
      </span>
    );
  }

  // Extract trailing visible non-bullet characters
  const bullets = ["•", "*", ".", "·"];
  const visibleChars = maskedKey
    .split("")
    .filter((char) => !bullets.includes(char))
    .join("");

  return (
    <span className="flex items-center gap-2">
      {/* Sleek, fixed-size bullet sequence */}
      <span className="flex items-center gap-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block"></span>
        ))}
      </span>
      {/* High-contrast trailing suffix badge */}
      {visibleChars && (
        <span className="font-mono font-bold text-slate-750 dark:text-slate-200 bg-slate-105 dark:bg-slate-800/80 px-2 py-0.5 rounded text-xs border border-slate-200 dark:border-slate-700/80 shadow-sm leading-none tracking-wider select-all">
          {visibleChars}
        </span>
      )}
    </span>
  );
};

/**
 * Component for managing user's custom API key for AI services
 * 
 * Features:
 * - Save/update API key (encrypted in backend)
 * - View masked API key (last 4 chars only)
 * - Toggle between custom and platform API keys
 * - Delete API key
 * - View API usage quota and limits
 * - Display alerts when quota is exhausted
 */
export function APIKeyManagement() {
  const {
    apiKeyStatus,
    apiKeyQuota,
    isLoading,
    error,
    successMessage,
    fetchAPIKeyStatus,
    saveAPIKey,
    toggleAPIKeyUsage,
    deleteAPIKey,
    clearError,
    clearSuccess,
  } = useAPIKey();

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch API key status on component mount
  useEffect(() => {
    fetchAPIKeyStatus();
  }, [fetchAPIKeyStatus]);

  // Handle save API key
  const handleSaveAPIKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      return;
    }

    setIsSaving(true);
    const success = await saveAPIKey(apiKeyInput.trim());
    setIsSaving(false);

    if (success) {
      setApiKeyInput("");
      setShowApiKeyInput(false);
    }
  };

  // Handle toggle API key
  const handleToggleAPIKey = async (useCustom: boolean) => {
    await toggleAPIKeyUsage(useCustom);
  };

  // Handle delete API key
  const handleDeleteAPIKey = async () => {
    setIsDeleting(true);
    const success = await deleteAPIKey();
    setIsDeleting(false);
    setShowDeleteConfirm(false);

    if (success) {
      setApiKeyInput("");
    }
  };

  if (isLoading && !apiKeyStatus) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  // Calculate quota display
  const quotaPercentage = apiKeyQuota?.quota_percentage ?? 0;
  const quotaColor =
    quotaPercentage >= 100
      ? "bg-linear-to-r from-red-500 to-rose-600"
      : quotaPercentage >= 80
      ? "bg-linear-to-r from-amber-500 to-yellow-500"
      : "bg-linear-to-r from-emerald-500 to-teal-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0 transition-transform hover:scale-105 duration-200">
          <span className="material-symbols-outlined text-2xl font-bold">key</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Clé API Personnelle
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Configurez votre clé API personnalisée (OpenRouter) pour utiliser l'IA sans quota limité par la plateforme.
          </p>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 p-4 flex items-start gap-3 shadow-sm transition-all duration-300">
          <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">
            error
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">{error}</p>
            <button
              onClick={clearError}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline mt-1.5 flex items-center gap-1"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 p-4 flex items-start gap-3 shadow-sm transition-all duration-300">
          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 shrink-0">
            check_circle
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{successMessage}</p>
            <button
              onClick={clearSuccess}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline mt-1.5 flex items-center gap-1"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Quota Alert */}
      {apiKeyQuota?.quota_exhausted && !apiKeyStatus?.use_custom_api_key && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-250/50 dark:border-amber-900/30 p-4 flex items-start gap-3 shadow-sm animate-pulse">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 shrink-0">
            warning
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
              Votre quota gratuit est épuisé. Veuillez ajouter votre clé API personnalisée pour continuer.
            </p>
          </div>
        </div>
      )}

      {/* Current API Key Status Card */}
      <div className={`p-5 rounded-2xl border transition-all duration-300 ${
        apiKeyStatus?.use_custom_api_key
          ? "bg-linear-to-br from-indigo-50/50 via-blue-50/30 to-white dark:from-indigo-950/10 dark:via-blue-950/5 dark:to-surface-dark/20 border-blue-200/60 dark:border-blue-900/40 shadow-sm"
          : "bg-slate-50/80 dark:bg-[#151b22] border-slate-200 dark:border-slate-800"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
              apiKeyStatus?.use_custom_api_key
                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}>
              <span className="material-symbols-outlined text-[20px]">
                {apiKeyStatus?.use_custom_api_key ? "vpn_key" : "cloud"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Source Active
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {apiKeyStatus?.use_custom_api_key
                  ? "Votre clé API personnalisée"
                  : "Clé par défaut de la plateforme"}
              </p>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
            apiKeyStatus?.use_custom_api_key
              ? "bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-400/20"
              : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-1 ring-slate-400/10"
          }`}>
            <span className="relative flex h-2 w-2">
              {apiKeyStatus?.use_custom_api_key && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                apiKeyStatus?.use_custom_api_key ? "bg-blue-500" : "bg-slate-450"
              }`}></span>
            </span>
            {apiKeyStatus?.use_custom_api_key ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Timestamps */}
        {apiKeyStatus?.has_custom_key && (
          <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-850/80 text-xs">
            {apiKeyStatus.api_key_created_at && (
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 dark:text-slate-500">Date d'ajout</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {new Date(apiKeyStatus.api_key_created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
            {apiKeyStatus.api_key_last_used && (
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 dark:text-slate-500">Dernière utilisation</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {new Date(apiKeyStatus.api_key_last_used).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quota Information Card */}
      {apiKeyQuota && (
        <div className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-slate-400 dark:text-slate-500">
                analytics
              </span>
              <p className="text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
                Consommation du Quota Gratuit
              </p>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-250">
              {apiKeyQuota.quota_used} <span className="text-xs font-semibold text-slate-400">/ {apiKeyQuota.quota_limit_free} requêtes</span>
            </p>
          </div>

          <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-800/60 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${quotaColor}`}
              style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <span className={`w-2 h-2 rounded-full ${
                apiKeyQuota.quota_exhausted ? "bg-red-500" : "bg-emerald-500 animate-pulse"
              }`}></span>
              {apiKeyQuota.quota_remaining} requêtes disponibles
            </span>
            <span className="font-medium text-slate-450">
              Réinitialisation le {new Date(apiKeyQuota.next_reset_date || "").toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        </div>
      )}

      {/* Add/Edit API Key Section */}
      {!apiKeyStatus?.has_custom_key || showApiKeyInput ? (
        <form onSubmit={handleSaveAPIKey} className="space-y-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/10 space-y-4 shadow-sm">
            <Input
              label="Ajouter votre clé API"
              type="password"
              placeholder="Entrez votre clé API OpenRouter (sk-or-v3...)"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              leftIcon="key"
              hint="🔒 Votre clé API est chiffrée de bout en bout et n'est jamais exposée."
              error={apiKeyInput && apiKeyInput.length < 10 ? "La clé doit faire au moins 10 caractères" : undefined}
            />
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={!apiKeyInput.trim() || apiKeyInput.length < 10}
                isLoading={isSaving}
                className="flex-1 sm:flex-initial shadow-md"
              >
                <span className="material-symbols-outlined text-[18px] mr-1.5">save</span>
                Sauvegarder la clé
              </Button>
              {showApiKeyInput && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowApiKeyInput(false);
                    setApiKeyInput("");
                  }}
                  className="shadow-sm"
                >
                  Annuler
                </Button>
              )}
            </div>
          </div>
        </form>
      ) : (
        <>
          {/* Masked API Key Display Card */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark/50 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">vpn_key</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Clé API Sauvegardée
                </p>
                <div className="mt-1.5">
                  {renderMaskedKey(apiKeyStatus?.masked_key)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/25 px-2.5 py-1 rounded-full border border-emerald-500/10 flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                Chiffrée
              </span>
            </div>
          </div>

          {/* API Key Usage Toggle Options */}
          {apiKeyStatus?.has_custom_key && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
                Utilisation de la Clé API
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option Platform Key */}
                <button
                  type="button"
                  onClick={() => handleToggleAPIKey(false)}
                  className={`group flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all duration-300 ${
                    !apiKeyStatus.use_custom_api_key
                      ? "border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  }`}
                >
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200 ${
                    !apiKeyStatus.use_custom_api_key
                      ? "bg-primary/20 text-primary"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">cloud</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      Clé Plateforme
                      {!apiKeyStatus.use_custom_api_key && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block"></span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
                      Utilise le quota mensuel gratuit et partagé de la plateforme.
                    </p>
                  </div>
                </button>

                {/* Option Custom Key */}
                <button
                  type="button"
                  onClick={() => handleToggleAPIKey(true)}
                  className={`group flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all duration-300 ${
                    apiKeyStatus.use_custom_api_key
                      ? "border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  }`}
                >
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200 ${
                    apiKeyStatus.use_custom_api_key
                      ? "bg-primary/20 text-primary"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">vpn_key</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      Clé Personnelle
                      {apiKeyStatus.use_custom_api_key && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block"></span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
                      Requêtes illimitées et prioritaires via votre compte personnel.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Edit and Delete Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowApiKeyInput(true)}
              leftIcon="edit"
              className="flex-1 shadow-sm"
            >
              Modifier la clé API
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              leftIcon="delete"
              className="flex-1 shadow-sm"
            >
              Supprimer la clé API
            </Button>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full mx-4 p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-red-500 to-rose-600"></div>
            <div className="flex items-start gap-4 mt-2">
              <div className="h-11 w-11 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Supprimer la clé API ?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Après la suppression, vous réutiliserez le quota limité de la plateforme. Cette opération est irréversible.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 shadow-sm"
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAPIKey}
                isLoading={isDeleting}
                className="flex-1 shadow-md"
              >
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
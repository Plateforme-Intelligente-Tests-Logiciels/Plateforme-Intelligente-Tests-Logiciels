"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProjectSelectorCard } from "@/components/dashboard/ProjectSelectorCard";
import { Modal } from "@/components/Modal";
import { ROUTES } from "@/lib/constants";
import { getMyProjectsAsMember } from "@/features/projects/api";
import { getEpics } from "@/features/epics/api";
import {
  getUserStories,
  getUserStoryById,
  updateUserStory,
  changeUserStoryStatus,
  assignDeveloper,
  assignTester,
} from "@/features/userstories/api";
import { getProjectById } from "@/features/projects/api";
import { Project, Epic, UserStory, UserStorySummary, MemberSimple, PrioriteUS, StatutUS } from "@/types";

export default function UserStoriesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [allEpics, setAllEpics] = useState<Epic[]>([]);
  const [selectedEpic, setSelectedEpic] = useState<number | null>(null);
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [detailsUserStory, setDetailsUserStory] = useState<UserStory | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [editUserStory, setEditUserStory] = useState<UserStory | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editTitre, setEditTitre] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editAction, setEditAction] = useState("");
  const [editBenefice, setEditBenefice] = useState("");
  const [editPoints, setEditPoints] = useState<number | null>(null);
  const [editDureeEstimee, setEditDureeEstimee] = useState<number | null>(null);
  const [editPriorite, setEditPriorite] = useState<PrioriteUS>("must_have");
  const [editCriteresAcceptation, setEditCriteresAcceptation] = useState("");
  const [editReference, setEditReference] = useState("");
  const projectLoadVersion = useRef(0);
  const [epicsReady, setEpicsReady] = useState(false);
  
  const [projectMembers, setProjectMembers] = useState<MemberSimple[]>([]);
  const [developerLoading, setDeveloperLoading] = useState<number | null>(null);
  const [testerLoading, setTesterLoading] = useState<number | null>(null);

  const fibonacciPoints = [1, 2, 3, 5, 8, 13, 21];
  const priorites: { value: PrioriteUS; label: string; color: string }[] = [
    { value: "must_have", label: "Must Have", color: "text-red-400" },
    { value: "should_have", label: "Should Have", color: "text-orange-400" },
    { value: "could_have", label: "Could Have", color: "text-yellow-400" },
    { value: "wont_have", label: "Won't Have", color: "text-gray-400" },
  ];

  const [filters, setFilters] = useState({
    statut: "",
    priorite: "",
  });
  const selectedProjectData = projects.find((project) => project.id === selectedProject) ?? null;
  const getProjectMembersByRole = (roleCode: string) =>
    projectMembers.filter(
      (member) => member.actif && member.role?.code === roleCode
    );
  const developerMembers = getProjectMembersByRole("DEVELOPPEUR");
  const testerMembers = getProjectMembersByRole("TESTEUR_QA");

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedProject) {
      setEpicsReady(false);
      return;
    }

    const loadVersion = ++projectLoadVersion.current;

    const loadProjectContext = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedEpic(null);
      setEpics([]);
      setAllEpics([]);
      setUserStories([]);
      setEpicsReady(false);

      try {
        const [epicsData, project] = await Promise.all([
          getEpics(selectedProject, undefined, true),
          getProjectById(selectedProject),
        ]);

        if (projectLoadVersion.current !== loadVersion) {
          return;
        }

        setAllEpics(epicsData);
        setEpics(epicsData);
        setProjectMembers(project.membres || []);
        setEpicsReady(true);
      } catch (error: any) {
        if (projectLoadVersion.current !== loadVersion) {
          return;
        }

        console.error("Erreur chargement contexte projet:", error);
        setError(error.response?.data?.detail || "Impossible de charger les données du projet");
        setProjectMembers([]);
        setEpics([]);
        setAllEpics([]);
        setUserStories([]);
      } finally {
        if (projectLoadVersion.current === loadVersion) {
          setIsLoading(false);
        }
      }
    };

    loadProjectContext();
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject && epicsReady) {
      loadUserStories(selectedProject, selectedEpic);
    }
    // selectedProject intentionally omitted: project changes are handled by the effect above
    // which resets epicsReady to false then true, triggering this effect at the right time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEpic, filters, epicsReady]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const projectsData = await getMyProjectsAsMember();
      setProjects(projectsData);
      if (projectsData.length > 0) {
        setSelectedProject(projectsData[0].id);
      }
    } catch (error: any) {
      setError("Impossible de charger les projets");
    } finally {
      setIsLoading(false);
    }
  };

  const loadEpics = async (projectId: number) => {
    try {
      const epicsData = await getEpics(projectId, undefined, true);
      setAllEpics(epicsData);
      setEpics(epicsData);
      setSelectedEpic(null);
      return epicsData;
    } catch (error: any) {
      console.error("Erreur chargement epics:", error);
      setEpics([]);
      setAllEpics([]);
      setSelectedEpic(null);
      setUserStories([]);
      return [];
    }
  };

  const summaryToUserStory = (summary: UserStorySummary, epicId: number): UserStory => ({
    id: summary.id,
    reference: summary.reference,
    titre: summary.titre,
    statut: (summary.statut || "to_do") as StatutUS,
    priorite: (summary.priorite || "must_have") as PrioriteUS,
    points: summary.points,
    duree_estimee: summary.duree_estimee,
    epic_id: summary.epic_id ?? epicId,
    developer: summary.developpeur
      ? { id: summary.developpeur.id, nom: `${summary.developpeur.nom} ${summary.developpeur.prenom || ""}`.trim(), email: summary.developpeur.email }
      : undefined,
  });

  const loadUserStoriesForEpic = async (
    projectId: number,
    epic: Epic,
    statut?: StatutUS
  ): Promise<UserStory[]> => {
    try {
      return await getUserStories(projectId, epic.id, statut, true);
    } catch (err: any) {
      if (err?.response?.status === 404 && epic.userstories?.length) {
        return epic.userstories
          .filter((us) => !statut || us.statut === statut)
          .map((us) => summaryToUserStory(us, epic.id));
      }
      return [];
    }
  };

  const loadUserStories = async (
    projectId: number,
    epicId: number | null,
    epicsData: Epic[] = allEpics
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const statut = filters.statut as StatutUS | undefined;
      let usData: UserStory[] = [];

      if (epicId) {
        const epic = epicsData.find((e) => e.id === epicId);
        if (epic) {
          usData = await loadUserStoriesForEpic(projectId, epic, statut || undefined);
        } else {
          usData = await getUserStories(projectId, epicId, statut || undefined, true);
        }
      } else {
        if (epicsData.length === 0) {
          setUserStories([]);
          return;
        }
        const results = await Promise.all(
          epicsData.map((epic) => loadUserStoriesForEpic(projectId, epic, statut || undefined))
        );
        usData = results.flat();
      }

      if (filters.priorite) {
        usData = usData.filter((us) => us.priorite === filters.priorite);
      }

      usData.sort((a, b) => {
        const numA = parseInt(a.reference?.split("-").pop() || "0", 10);
        const numB = parseInt(b.reference?.split("-").pop() || "0", 10);
        return numA - numB;
      });

      setUserStories(usData);
    } catch (error: any) {
      setError("Impossible de charger les user stories");
      setUserStories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserStories = async () => {
    if (!selectedProject) return;
    const epicsData = await loadEpics(selectedProject);
    await loadUserStories(selectedProject, selectedEpic, epicsData);
  };

  const handleChangeStatus = async (
    usId: number,
    newStatus: "to_do" | "in_progress" | "ready_for_test" | "done",
    epicId?: number
  ) => {
    if (!selectedProject) return;
    const resolvedEpicId = epicId ?? selectedEpic;
    if (!resolvedEpicId) return;
    setActionLoading(usId);
    try {
      await changeUserStoryStatus(selectedProject, resolvedEpicId, usId, { statut: newStatus });
      await refreshUserStories();
    } catch (error: any) {
      alert("Erreur lors du changement de statut: " + (error.response?.data?.detail || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignDeveloper = async (usId: number, memberId: number, epicId?: number) => {
    if (!selectedProject) return;
    const resolvedEpicId = epicId ?? selectedEpic;
    if (!resolvedEpicId) return;
    setDeveloperLoading(usId);
    try {
      await assignDeveloper(selectedProject, resolvedEpicId, usId, { developeur_id: memberId });
      await refreshUserStories();
    } catch (error: any) {
      alert("Erreur lors de l'assignation du développeur: " + (error.response?.data?.detail || error.message));
    } finally {
      setDeveloperLoading(null);
    }
  };
  
  const handleAssignTester = async (usId: number, memberId: number, epicId?: number) => {
    if (!selectedProject) return;
    const resolvedEpicId = epicId ?? selectedEpic;
    if (!resolvedEpicId) return;
    setTesterLoading(usId);
    try {
      await assignTester(selectedProject, resolvedEpicId, usId, { testeur_id: memberId });
      await refreshUserStories();
    } catch (error: any) {
      alert("Erreur lors de l'assignation du testeur: " + (error.response?.data?.detail || error.message));
    } finally {
      setTesterLoading(null);
    }
  };

  const parseDescriptionParts = (description?: string) => {
    if (!description) return { role: "", action: "", benefice: "" };

    const regex = /En tant que\s+(.+?),\s*je veux\s+(.+?)(?:,\s*afin de\s+(.+))?\.?$/i;
    const match = description.match(regex);

    if (!match) {
      return { role: "", action: "", benefice: "" };
    }

    return {
      role: match[1] || "",
      action: match[2] || "",
      benefice: match[3] || "",
    };
  };

  const openDetailsModal = async (usId: number, epicId?: number) => {
    if (!selectedProject) return;
    const resolvedEpicId = epicId ?? selectedEpic;
    if (!resolvedEpicId) return;

    setDetailsError(null);
    setIsDetailsLoading(true);
    setDetailsUserStory(null);

    try {
      const userStory = await getUserStoryById(selectedProject, resolvedEpicId, usId);
      setDetailsUserStory(userStory);
    } catch (error: any) {
      setDetailsError(error.response?.data?.detail || "Impossible de charger les détails de la user story");
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const closeDetailsModal = () => {
    setDetailsUserStory(null);
    setDetailsError(null);
    setIsDetailsLoading(false);
  };

  const openEditModal = async (usId: number, epicId?: number) => {
    if (!selectedProject) return;
    const resolvedEpicId = epicId ?? selectedEpic;
    if (!resolvedEpicId) return;

    setEditError(null);
    setIsEditLoading(true);
    setEditUserStory(null);

    try {
      const userStory = await getUserStoryById(selectedProject, resolvedEpicId, usId);
      const parsed = parseDescriptionParts(userStory.description);

      setEditUserStory(userStory);
      setEditTitre(userStory.titre || "");
      setEditReference(userStory.reference || "");
      setEditRole(parsed.role);
      setEditAction(parsed.action);
      setEditBenefice(parsed.benefice);
      setEditPoints(userStory.points ?? null);
      setEditDureeEstimee(userStory.duree_estimee ?? null);
      setEditPriorite((userStory.priorite || "must_have") as PrioriteUS);
      setEditCriteresAcceptation(userStory.criteresAcceptation || "");
    } catch (error: any) {
      setEditError(error.response?.data?.detail || "Impossible de charger la user story pour modification");
    } finally {
      setIsEditLoading(false);
    }
  };

  const closeEditModal = () => {
    setEditUserStory(null);
    setIsEditLoading(false);
    setIsEditSubmitting(false);
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !editUserStory) return;
    const resolvedEpicId = selectedEpic ?? editUserStory.epic_id;
    if (!resolvedEpicId) return;

    if (!editTitre.trim() || !editRole.trim() || !editAction.trim()) {
      setEditError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsEditSubmitting(true);
    setEditError(null);

    try {
      await updateUserStory(selectedProject, resolvedEpicId, editUserStory.id, {
        titre: editTitre.trim(),
        role: editRole.trim(),
        action: editAction.trim(),
        benefice: editBenefice.trim() || undefined,
        points: editPoints || undefined,
        duree_estimee: editDureeEstimee || undefined,
        priorite: editPriorite,
        criteresAcceptation: editCriteresAcceptation.trim() || undefined,
      });

      await loadUserStories(selectedProject, selectedEpic);
      closeEditModal();
    } catch (error: any) {
      setEditError(error.response?.data?.detail || "Erreur lors de la modification de la user story");
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const sidebarLinks = [
    { href: ROUTES.SCRUM_MASTER, icon: "dashboard", label: "Dashboard" },
    { href: `${ROUTES.SCRUM_MASTER}/sprints`, icon: "calendar_month", label: "Sprints" },
    { href: `${ROUTES.SCRUM_MASTER}/backlog`, icon: "list", label: "Backlog" },
    { href: `${ROUTES.SCRUM_MASTER}/user-stories`, icon: "description", label: "User Stories" },
    { href: `${ROUTES.SCRUM_MASTER}/team`, icon: "groups", label: "Équipe" },
    { href: `${ROUTES.SCRUM_MASTER}/cahier-tests`, icon: "menu_book", label: "Cahier de Tests" },
    { href: `${ROUTES.SCRUM_MASTER}/rapports-qa`, icon: "assessment", label: "Rapports QA" },
    { href: `${ROUTES.SCRUM_MASTER}/profile`, icon: "account_circle", label: "Mon Profil" },
  ];

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "done":
        return "bg-[#0bda5b]/20 text-[#0bda5b]";
      case "in_progress":
        return "bg-primary/20 text-primary";
      case "ready_for_test":
        return "bg-amber-500/20 text-amber-400";
      case "to_do":
      default:
        return "bg-[#9dabb9]/20 text-[#9dabb9]";
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case "done":
        return "Terminée";
      case "in_progress":
        return "En cours";
      case "ready_for_test":
        return "Pret pour test";
      case "to_do":
      default:
        return "À faire";
    }
  };

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case "must_have":
        return "text-red-400";
      case "should_have":
        return "text-yellow-400";
      case "could_have":
        return "text-primary";
      case "wont_have":
      default:
        return "text-[#9dabb9]";
    }
  };

  const getPriorityLabel = (priorite: string) => {
    return priorite.replace("_", " ").toUpperCase();
  };

  return (
    <DashboardLayout
      sidebarContent={
        <Sidebar
          title="Scrum Master"
          subtitle="FlowPilot Platform"
          icon="groups"
          links={sidebarLinks}
        />
      }
      headerContent={
        <DashboardHeader
          title="Gestion des User Stories"
          subtitle="Décomposition des epics et affectation des tâches"
          actions={
            <Link
              href={`${ROUTES.SCRUM_MASTER}/user-stories/new${selectedProject ? `?project=${selectedProject}${selectedEpic ? `&epic=${selectedEpic}` : ""}` : ""}`}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="hidden md:inline">Nouvelle User Story</span>
            </Link>
          }
        />
      }
    >
      <div className="max-w-350 mx-auto flex flex-col gap-6">
        {/* Project Selector */}
        {projects.length > 0 ? (
          <ProjectSelectorCard
            projects={projects.map((project) => ({ id: project.id, nom: project.nom }))}
            selectedProjectId={selectedProject}
            selectedProjectName={selectedProjectData?.nom ?? null}
            onSelectProject={(projectId) => {
              setSelectedEpic(null);
              setFilters({ statut: "", priorite: "" });
              setUserStories([]);
              setSelectedProject(projectId);
            }}
            badgeText="Gestion des user stories"
            title="Projet"
            description="Sélectionnez un projet pour gérer ses user stories."
            placeholder="-- Sélectionnez un projet --"
          />
        ) : !isLoading && (
          <div className="bg-surface-dark border border-[#3b4754] rounded-xl p-4">
            <p className="text-red-400 text-sm">Aucun projet disponible. Vous devez être membre d'un projet.</p>
          </div>
        )}

        {/* Filters Bar */}
        {selectedProject && (
          <div className="bg-surface-dark border border-[#3b4754] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">filter_list</span>
                <h3 className="text-white text-sm font-bold">Filtres</h3>
              </div>
              {(selectedEpic || filters.statut || filters.priorite) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEpic(null);
                    setFilters({ statut: "", priorite: "" });
                  }}
                  className="flex items-center gap-1 text-xs text-[#9dabb9] hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                  Réinitialiser
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[#9dabb9] text-xs font-bold mb-1.5 block">Epic</label>
                <select
                  value={selectedEpic || ""}
                  onChange={(e) => setSelectedEpic(e.target.value ? Number(e.target.value) : null)}
                  disabled={epics.length === 0}
                  className="w-full bg-[#283039] border border-[#3b4754] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                >
                  <option value="">Tous les epics</option>
                  {epics.map((epic) => (
                    <option key={epic.id} value={epic.id}>{epic.titre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[#9dabb9] text-xs font-bold mb-1.5 block">Statut</label>
                <select
                  value={filters.statut}
                  onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                  className="w-full bg-[#283039] border border-[#3b4754] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Tous les statuts</option>
                  <option value="to_do">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="ready_for_test">Prêt pour test</option>
                  <option value="done">Terminée</option>
                </select>
              </div>
              <div>
                <label className="text-[#9dabb9] text-xs font-bold mb-1.5 block">Priorité</label>
                <select
                  value={filters.priorite}
                  onChange={(e) => setFilters({ ...filters, priorite: e.target.value })}
                  className="w-full bg-[#283039] border border-[#3b4754] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Toutes les priorités</option>
                  <option value="must_have">Must Have</option>
                  <option value="should_have">Should Have</option>
                  <option value="could_have">Could Have</option>
                  <option value="wont_have">Won't Have</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-red-400 text-xl">error</span>
            <div className="flex-1">
              <h3 className="text-red-400 font-semibold mb-1">Erreur</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* User Stories List */}
        {!isLoading && userStories.length === 0 && (
          <div className="bg-surface-dark border border-[#3b4754] rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-[#9dabb9] text-5xl mb-4">description</span>
            <h3 className="text-white text-lg font-bold mb-2">Aucune user story</h3>
            <p className="text-[#9dabb9] text-sm mb-4">
              Aucune user story ne correspond aux filtres ou à la sélection actuelle.
            </p>
            <Link
              href={`${ROUTES.SCRUM_MASTER}/user-stories/new${selectedProject ? `?project=${selectedProject}${selectedEpic ? `&epic=${selectedEpic}` : ""}` : ""}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Nouvelle User Story</span>
            </Link>
          </div>
        )}

        {!isLoading && userStories.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white text-xl font-bold">User Stories ({userStories.length})</h2>
              <Link
                href={`${ROUTES.SCRUM_MASTER}/user-stories/new${selectedProject ? `?project=${selectedProject}${selectedEpic ? `&epic=${selectedEpic}` : ""}` : ""}`}
                className="sm:hidden flex items-center gap-2 px-3 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Nouvelle</span>
              </Link>
            </div>
            <div className="space-y-4">
            {userStories.map((us) => (
              <div
                key={us.id}
                className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-[#3b4754] rounded-xl px-4 py-3 hover:border-primary/40 dark:hover:border-primary/50 transition-colors"
              >
                {/* Ligne 1 : référence + titre + badges + actions */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {us.reference && (
                        <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-mono font-bold rounded dark:bg-primary/20">
                          {us.reference}
                        </span>
                      )}
                      <h3 className="text-slate-900 dark:text-white text-sm font-bold truncate">{us.titre}</h3>
                    </div>
                    {us.description && (
                      <p className="text-slate-400 dark:text-[#9dabb9] text-xs mt-0.5 truncate">{us.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(us.statut)}`}>
                        {getStatusLabel(us.statut)}
                      </span>
                      <span className={`text-[10px] font-bold ${getPriorityColor(us.priorite)}`}>
                        {getPriorityLabel(us.priorite)}
                      </span>
                      {us.points != null && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 dark:bg-[#283039] rounded text-[10px] font-bold text-slate-600 dark:text-white">
                          <span className="material-symbols-outlined text-[11px]">speed</span>
                          {us.points}pts
                        </span>
                      )}
                      {us.duree_estimee != null && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 dark:bg-[#283039] rounded text-[10px] font-bold text-slate-600 dark:text-white">
                          <span className="material-symbols-outlined text-[11px]">schedule</span>
                          {us.duree_estimee}h
                        </span>
                      )}
                      {us.bug_ticket && us.statut === "a_corriger" && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 dark:bg-red-500/20 text-red-500 dark:text-red-300 rounded text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[11px]">confirmation_number</span>
                          {us.bug_ticket}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openDetailsModal(us.id, us.epic_id)}
                      className="p-1.5 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors"
                      title="Voir détails"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-primary text-[18px]">visibility</span>
                    </button>
                    <button
                      onClick={() => openEditModal(us.id, us.epic_id)}
                      className="p-1.5 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors"
                      title="Modifier"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-primary text-[18px]">edit</span>
                    </button>
                  </div>
                </div>

                {/* Ligne 2 : équipe + statut en une seule rangée */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#3b4754] flex items-center gap-2 flex-wrap">
                  {/* Développeur */}
                  <div className="flex items-center gap-1.5">
                    {us.developer ? (
                      <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <span className="text-primary text-[9px] font-bold">{us.developer.nom.charAt(0).toUpperCase()}</span>
                      </div>
                    ) : (
                      <span className="material-symbols-outlined text-slate-400 dark:text-[#9dabb9] text-[15px]">code</span>
                    )}
                    {developerMembers.length > 0 ? (
                      <select
                        value=""
                        disabled={developerLoading === us.id}
                        onChange={(e) => { const v = e.target.value; if (v) handleAssignDeveloper(us.id, Number(v), us.epic_id); }}
                        className="bg-slate-50 dark:bg-[#1a2230] border border-slate-200 dark:border-[#3b4754] rounded-md px-2 py-1 text-slate-600 dark:text-[#9dabb9] text-xs focus:outline-none focus:border-primary hover:border-primary/50 disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        <option value="">{us.developer ? us.developer.nom : "Développeur"}</option>
                        {developerMembers.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
                      </select>
                    ) : (
                      <span className="text-slate-400 dark:text-[#9dabb9] text-xs">{us.developer?.nom ?? "—"}</span>
                    )}
                  </div>

                  {/* Testeur QA */}
                  <div className="flex items-center gap-1.5">
                    {us.tester ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <span className="text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">{us.tester.nom.charAt(0).toUpperCase()}</span>
                      </div>
                    ) : (
                      <span className="material-symbols-outlined text-slate-400 dark:text-[#9dabb9] text-[15px]">bug_report</span>
                    )}
                    {testerMembers.length > 0 ? (
                      <select
                        value=""
                        disabled={testerLoading === us.id}
                        onChange={(e) => { const v = e.target.value; if (v) handleAssignTester(us.id, Number(v), us.epic_id); }}
                        className="bg-slate-50 dark:bg-[#1a2230] border border-slate-200 dark:border-[#3b4754] rounded-md px-2 py-1 text-slate-600 dark:text-[#9dabb9] text-xs focus:outline-none focus:border-emerald-500 hover:border-emerald-500/50 disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        <option value="">{us.tester ? us.tester.nom : "Testeur QA"}</option>
                        {testerMembers.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
                      </select>
                    ) : (
                      <span className="text-slate-400 dark:text-[#9dabb9] text-xs">{us.tester?.nom ?? "—"}</span>
                    )}
                  </div>

                  {/* Séparateur */}
                  <div className="h-4 w-px bg-slate-200 dark:bg-[#3b4754] mx-1 hidden sm:block" />

                  {/* Statut */}
                  {([
                    { value: "to_do",          label: "À faire",        base: "bg-slate-100 text-slate-500 hover:bg-slate-200 border-slate-200 dark:bg-[#9dabb9]/10 dark:text-[#9dabb9] dark:hover:bg-[#9dabb9]/20 dark:border-[#9dabb9]/20", active: "bg-slate-200 text-slate-700 border-slate-300 dark:bg-[#9dabb9]/25 dark:text-[#9dabb9] dark:border-[#9dabb9]/50" },
                    { value: "in_progress",    label: "En cours",       base: "bg-blue-50 text-blue-500 hover:bg-blue-100 border-blue-100 dark:bg-primary/10 dark:text-primary dark:hover:bg-primary/20 dark:border-primary/20",           active: "bg-blue-100 text-blue-600 border-blue-300 dark:bg-primary/25 dark:text-primary dark:border-primary/50" },
                    { value: "ready_for_test", label: "Prêt pour test", base: "bg-amber-50 text-amber-500 hover:bg-amber-100 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 dark:border-amber-500/20", active: "bg-amber-100 text-amber-600 border-amber-300 dark:bg-amber-500/25 dark:text-amber-400 dark:border-amber-500/50" },
                    { value: "done",           label: "Terminée",       base: "bg-green-50 text-green-500 hover:bg-green-100 border-green-100 dark:bg-[#0bda5b]/10 dark:text-[#0bda5b] dark:hover:bg-[#0bda5b]/20 dark:border-[#0bda5b]/20", active: "bg-green-100 text-green-600 border-green-300 dark:bg-[#0bda5b]/25 dark:text-[#0bda5b] dark:border-[#0bda5b]/50" },
                  ] as const).map((s) => (
                    <button
                      key={s.value}
                      onClick={() => handleChangeStatus(us.id, s.value, us.epic_id)}
                      disabled={actionLoading === us.id || us.statut === s.value}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-all disabled:cursor-not-allowed ${us.statut === s.value ? s.active : s.base}`}
                    >
                      {us.statut === s.value && <span className="material-symbols-outlined text-[11px]">check</span>}
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={Boolean(detailsUserStory) || isDetailsLoading || Boolean(detailsError)}
        onClose={closeDetailsModal}
        title={detailsUserStory ? `Détails - ${detailsUserStory.titre}` : "Détails de la User Story"}
        size="lg"
      >
        {isDetailsLoading && (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        )}

        {detailsError && !isDetailsLoading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">{detailsError}</p>
          </div>
        )}

        {!isDetailsLoading && !detailsError && detailsUserStory && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-[#283039] border border-slate-200 dark:border-[#3b4754] rounded-lg p-4">
                <p className="text-slate-500 dark:text-[#9dabb9] text-xs font-bold uppercase mb-2">Référence</p>
                <p className="text-slate-900 dark:text-white text-lg font-mono font-bold">
                  {detailsUserStory.reference || "Non définie"}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-[#283039] border border-slate-200 dark:border-[#3b4754] rounded-lg p-4">
                <p className="text-slate-500 dark:text-[#9dabb9] text-xs font-bold uppercase mb-2">Statut</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(detailsUserStory.statut || "to_do")}`}>
                  {getStatusLabel(detailsUserStory.statut || "to_do")}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#283039] border border-slate-200 dark:border-[#3b4754] rounded-lg p-4">
                <p className="text-slate-500 dark:text-[#9dabb9] text-xs font-bold uppercase mb-2">Points</p>
                <p className="text-slate-900 dark:text-white text-xl font-bold">
                  {detailsUserStory.points !== null && detailsUserStory.points !== undefined ? detailsUserStory.points : "-"}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-[#283039] border border-slate-200 dark:border-[#3b4754] rounded-lg p-4">
                <p className="text-slate-500 dark:text-[#9dabb9] text-xs font-bold uppercase mb-2">Durée Estimée</p>
                <p className="text-slate-900 dark:text-white text-xl font-bold">
                  {detailsUserStory.duree_estimee !== null && detailsUserStory.duree_estimee !== undefined
                    ? `${detailsUserStory.duree_estimee}h`
                    : "-"}
                </p>
              </div>
            </div>

            {detailsUserStory.priorite && (
              <div className="bg-slate-50 dark:bg-[#283039] border border-slate-200 dark:border-[#3b4754] rounded-lg p-4">
                <p className="text-slate-500 dark:text-[#9dabb9] text-xs font-bold uppercase mb-2">Priorité</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(detailsUserStory.priorite)}`}>
                  {getPriorityLabel(detailsUserStory.priorite)}
                </span>
              </div>
            )}

            {detailsUserStory.description && (
              <div className="bg-slate-50 dark:bg-[#283039] border border-slate-200 dark:border-[#3b4754] rounded-lg p-4">
                <p className="text-slate-500 dark:text-[#9dabb9] text-xs font-bold uppercase mb-2">Description</p>
                <p className="text-slate-800 dark:text-white text-sm whitespace-pre-wrap">{detailsUserStory.description}</p>
              </div>
            )}

            {detailsUserStory.criteresAcceptation && (
              <div className="bg-slate-50 dark:bg-[#283039] border border-slate-200 dark:border-[#3b4754] rounded-lg p-4">
                <p className="text-slate-500 dark:text-[#9dabb9] text-xs font-bold uppercase mb-2">Critères d'acceptation</p>
                <p className="text-slate-800 dark:text-white text-sm whitespace-pre-wrap">{detailsUserStory.criteresAcceptation}</p>
              </div>
            )}

            {detailsUserStory.bug_ticket && detailsUserStory.statut === "a_corriger" && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 text-xs font-bold uppercase mb-2">Ticket Bug</p>
                <p className="text-white font-semibold">{detailsUserStory.bug_ticket}</p>
                {detailsUserStory.bug_titre_correction && (
                  <p className="text-red-200 text-sm mt-2">{detailsUserStory.bug_titre_correction}</p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(editUserStory) || isEditLoading}
        onClose={closeEditModal}
        title={editUserStory ? `Modifier - ${editUserStory.titre}` : "Modifier la User Story"}
        size="lg"
      >
        {isEditLoading && (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        )}

        {!isEditLoading && editUserStory && (
          <form onSubmit={handleEditSubmit} className="space-y-6">
            {editError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">{editError}</p>
              </div>
            )}

            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-[#3b4754] rounded-xl p-6 space-y-4">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">Définition de la User Story</h3>
              <div className="bg-slate-50 dark:bg-[#283039] border border-slate-200 dark:border-[#3b4754] rounded-lg p-3">
                <p className="text-slate-600 dark:text-[#9dabb9] text-sm">
                  Format: <span className="text-slate-900 dark:text-white font-medium">En tant que [RÔLE], je veux [ACTION] afin de [BÉNÉFICE]</span>
                </p>
              </div>
              <div>
                <label className="text-slate-600 dark:text-[#9dabb9] text-sm font-bold mb-2 block">Titre *</label>
                <input
                  type="text"
                  value={editTitre}
                  onChange={(e) => setEditTitre(e.target.value)}
                  className="w-full bg-white dark:bg-[#283039] border border-slate-300 dark:border-[#3b4754] rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-slate-600 dark:text-[#9dabb9] text-sm font-bold mb-2 block">Référence</label>
                <input
                  type="text"
                  value={editReference}
                  onChange={(e) => setEditReference(e.target.value)}
                  disabled
                  className="w-full bg-slate-100 dark:bg-[#1f2730] border border-slate-300 dark:border-[#3b4754] rounded-lg px-4 py-2.5 text-slate-500 dark:text-[#9dabb9]"
                />
              </div>
              <div>
                <label className="text-slate-600 dark:text-[#9dabb9] text-sm font-bold mb-2 block">Rôle (En tant que...) *</label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-white dark:bg-[#283039] border border-slate-300 dark:border-[#3b4754] rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-slate-600 dark:text-[#9dabb9] text-sm font-bold mb-2 block">Action (Je veux...) *</label>
                <input
                  type="text"
                  value={editAction}
                  onChange={(e) => setEditAction(e.target.value)}
                  className="w-full bg-white dark:bg-[#283039] border border-slate-300 dark:border-[#3b4754] rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-slate-600 dark:text-[#9dabb9] text-sm font-bold mb-2 block">Bénéfice (Afin de...)</label>
                <input
                  type="text"
                  value={editBenefice}
                  onChange={(e) => setEditBenefice(e.target.value)}
                  className="w-full bg-white dark:bg-[#283039] border border-slate-300 dark:border-[#3b4754] rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-[#3b4754] rounded-xl p-6 space-y-4">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">Détails</h3>
              <div>
                <label className="text-slate-600 dark:text-[#9dabb9] text-sm font-bold mb-2 block">Points d'Effort (Fibonacci)</label>
                <div className="grid grid-cols-7 gap-2">
                  {fibonacciPoints.map((point) => (
                    <button
                      key={point}
                      type="button"
                      onClick={() => setEditPoints(point)}
                      className={`py-2 rounded-lg text-sm font-bold transition-all ${
                        editPoints === point
                          ? "bg-primary text-white"
                          : "bg-slate-100 dark:bg-[#283039] text-slate-600 dark:text-[#9dabb9] hover:bg-slate-200 dark:hover:bg-[#3b4754]"
                      }`}
                    >
                      {point}
                    </button>
                  ))}
                </div>
                {editPoints && (
                  <button
                    type="button"
                    onClick={() => setEditPoints(null)}
                    className="mt-2 text-xs text-red-400 hover:text-red-300"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>

              <div>
                <label className="text-slate-600 dark:text-[#9dabb9] text-sm font-bold mb-2 block">Durée Estimée (heures)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={editDureeEstimee || ""}
                  onChange={(e) => setEditDureeEstimee(e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full bg-white dark:bg-[#283039] border border-slate-300 dark:border-[#3b4754] rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-[#9dabb9] text-sm font-bold mb-2 block">Priorité (MoSCoW) *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {priorites.map((prio) => (
                    <button
                      key={prio.value}
                      type="button"
                      onClick={() => setEditPriorite(prio.value)}
                      className={`py-3 px-4 rounded-lg text-sm font-bold transition-all border ${
                        editPriorite === prio.value
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-slate-100 dark:bg-[#283039] border-slate-300 dark:border-[#3b4754] hover:bg-slate-200 dark:hover:bg-[#3b4754]"
                      }`}
                    >
                      <span className={editPriorite === prio.value ? "text-primary" : prio.color}>{prio.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-[#9dabb9] text-sm font-bold mb-2 block">Critères d'Acceptation</label>
                <textarea
                  value={editCriteresAcceptation}
                  onChange={(e) => setEditCriteresAcceptation(e.target.value)}
                  rows={5}
                  className="w-full bg-white dark:bg-[#283039] border border-slate-300 dark:border-[#3b4754] rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-[#9dabb9] hover:bg-slate-100 dark:hover:bg-[#283039] rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isEditSubmitting}
                className="px-4 py-2 text-sm font-bold bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isEditSubmitting ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}

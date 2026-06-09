import axiosInstance from "@/lib/axios";
import {
  UserStory,
  CreateUserStoryPayload,
  UpdateUserStoryPayload,
  ChangerStatutUSPayload,
  AssignerDeveloppeurPayload,
  AssignerTesteurPayload,
  AssignerAssigneePayload,
  AssignerScrumMasterPayload,
  ValiderUserStoryPayload,
  StatutUS,
} from "@/types";

/**
 * Créer une nouvelle user story
 */
export const createUserStory = async (
  projectId: number,
  epicId: number,
  payload: CreateUserStoryPayload
): Promise<UserStory> => {
  const response = await axiosInstance.post<UserStory>(
    `/projets/${projectId}/epics/${epicId}/userstories`,
    payload
  );
  return response.data;
};

/**
 * Obtenir toutes les user stories d'un epic
 */
export const getUserStories = async (
  projectId: number,
  epicId: number,
  statut?: StatutUS,
  suppressErrorLog?: boolean
): Promise<UserStory[]> => {
  const params = statut ? { statut } : {};
  const response = await axiosInstance.get<UserStory[]>(
    `/projets/${projectId}/epics/${epicId}/userstories`,
    { params, suppressErrorLog }
  );
  return response.data;
};

/**
 * Obtenir le backlog des user stories (non assignées à un sprint)
 */
export const getUserStoriesBacklog = async (
  projectId: number,
  epicId: number
): Promise<UserStory[]> => {
  const response = await axiosInstance.get<UserStory[]>(
    `/projets/${projectId}/epics/${epicId}/userstories/backlog`
  );
  return response.data;
};

/**
 * Obtenir une user story par ID
 */
export const getUserStoryById = async (
  projectId: number,
  epicId: number,
  userStoryId: number
): Promise<UserStory> => {
  const response = await axiosInstance.get<UserStory>(
    `/projets/${projectId}/epics/${epicId}/userstories/${userStoryId}`
  );
  return response.data;
};

/**
 * Modifier une user story
 */
export const updateUserStory = async (
  projectId: number,
  epicId: number,
  userStoryId: number,
  payload: UpdateUserStoryPayload
): Promise<UserStory> => {
  const response = await axiosInstance.put<UserStory>(
    `/projets/${projectId}/epics/${epicId}/userstories/${userStoryId}`,
    payload
  );
  return response.data;
};

/**
 * Supprimer une user story
 */
export const deleteUserStory = async (
  projectId: number,
  epicId: number,
  userStoryId: number
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/projets/${projectId}/epics/${epicId}/userstories/${userStoryId}`
  );
  return response.data;
};

/**
 * Changer le statut d'une user story
 */
export const changeUserStoryStatus = async (
  projectId: number,
  epicId: number,
  userStoryId: number,
  payload: ChangerStatutUSPayload
): Promise<UserStory> => {
  const response = await axiosInstance.patch<UserStory>(
    `/projets/${projectId}/epics/${epicId}/userstories/${userStoryId}/statut`,
    payload
  );
  return response.data;
};

/**
 * Assigner un développeur à une user story
 */
export const assignDeveloper = async (
  projectId: number,
  epicId: number,
  userStoryId: number,
  payload: AssignerDeveloppeurPayload
): Promise<UserStory> => {
  const response = await axiosInstance.patch<UserStory>(
    `/projets/${projectId}/epics/${epicId}/userstories/${userStoryId}/assigner`,
    payload
  );
  return response.data;
};

/**
 * Assigner un testeur QA à une user story
 */
export const assignTester = async (
  projectId: number,
  epicId: number,
  userStoryId: number,
  payload: AssignerTesteurPayload
): Promise<UserStory> => {
  const response = await axiosInstance.patch<UserStory>(
    `/projets/${projectId}/epics/${epicId}/userstories/${userStoryId}/assigner-testeur`,
    payload
  );
  return response.data;
};

/**
 * Assigner un scrum master à une user story
 */
export const assignScrumMaster = async (
  projectId: number,
  epicId: number,
  userStoryId: number,
  payload: AssignerScrumMasterPayload
): Promise<UserStory> => {
  const response = await axiosInstance.patch<UserStory>(
    `/projets/${projectId}/epics/${epicId}/userstories/${userStoryId}/assigner-scrum-master`,
    payload
  );
  return response.data;
};

/**
 * Valider une user story
 */
export const validateUserStory = async (
  projectId: number,
  epicId: number,
  userStoryId: number,
  payload: ValiderUserStoryPayload
): Promise<UserStory> => {
  const response = await axiosInstance.patch<UserStory>(
    `/projets/${projectId}/epics/${epicId}/userstories/${userStoryId}/valider`,
    payload
  );
  return response.data;
};

/**
 * Assigner un assignee (responsable) à une user story
 */
export const assignAssignee = async (
  projectId: number,
  epicId: number,
  userStoryId: number,
  payload: AssignerAssigneePayload
): Promise<UserStory> => {
  const response = await axiosInstance.patch<UserStory>(
    `/projets/${projectId}/epics/${epicId}/userstories/${userStoryId}/assigner-assignee`,
    payload
  );
  return response.data;
};

/**
 * Retirer l'assignee d'une user story
 */
export const removeAssignee = async (
  projectId: number,
  epicId: number,
  userStoryId: number
): Promise<UserStory> => {
  const response = await axiosInstance.delete<UserStory>(
    `/projets/${projectId}/epics/${epicId}/userstories/${userStoryId}/assigner-assignee`
  );
  return response.data;
};





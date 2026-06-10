import axiosInstance from "@/lib/axios";
import {
  AIGeneration,
  AIGenerationDetail,
  GenererRapportQAPayload,
  RapportQA,
  UpdateRapportQAPayload,
} from "@/types";

const getRapportBase = (projectId: number, cahierId: number) =>
  `/projets/${projectId}/rapports/cahier/${cahierId}`;

export const getRapportQA = async (
  projectId: number,
  cahierId: number
): Promise<RapportQA> => {
  const response = await axiosInstance.get<RapportQA>(
    getRapportBase(projectId, cahierId),
    { suppressErrorLog: true }
  );
  return response.data;
};

export const genererRapportQA = async (
  projectId: number,
  cahierId: number,
  payload: GenererRapportQAPayload
): Promise<RapportQA> => {
  const response = await axiosInstance.post<RapportQA>(
    `${getRapportBase(projectId, cahierId)}/generate`,
    payload
  );
  return response.data;
};

export const startRapportQAGeneration = async (
  projectId: number,
  cahierId: number,
  payload: GenererRapportQAPayload
): Promise<AIGeneration> => {
  const response = await axiosInstance.post<AIGeneration>(
    `${getRapportBase(projectId, cahierId)}/generate/ai`,
    payload
  );
  return response.data;
};

export const listRapportQAGenerations = async (
  projectId: number,
  cahierId: number
): Promise<AIGeneration[]> => {
  const response = await axiosInstance.get<AIGeneration[]>(
    `${getRapportBase(projectId, cahierId)}/generations`,
    { suppressErrorLog: true }
  );
  return response.data;
};

export const getRapportQAGeneration = async (
  projectId: number,
  cahierId: number,
  generationId: number
): Promise<AIGenerationDetail> => {
  const response = await axiosInstance.get<AIGenerationDetail>(
    `${getRapportBase(projectId, cahierId)}/generations/${generationId}`,
    { suppressErrorLog: true }
  );
  return response.data;
};

export const cancelRapportQAGeneration = async (
  projectId: number,
  cahierId: number,
  generationId: number
): Promise<{ generation_id: number; status: string }> => {
  const response = await axiosInstance.post<{ generation_id: number; status: string }>(
    `${getRapportBase(projectId, cahierId)}/generations/${generationId}/cancel`
  );
  return response.data;
};

export const updateRapportQA = async (
  projectId: number,
  cahierId: number,
  payload: UpdateRapportQAPayload
): Promise<RapportQA> => {
  const response = await axiosInstance.patch<RapportQA>(
    getRapportBase(projectId, cahierId),
    payload
  );
  return response.data;
};

export const affinerRecommandations = async (
  projectId: number,
  cahierId: number,
  feedback: string
): Promise<RapportQA> => {
  const response = await axiosInstance.post<RapportQA>(
    `${getRapportBase(projectId, cahierId)}/affiner-recommandations`,
    { feedback }
  );
  return response.data;
};

export const exporterRapportQAPdf = async (
  projectId: number,
  cahierId: number
): Promise<Blob> => {
  const response = await axiosInstance.get(
    `${getRapportBase(projectId, cahierId)}/export/pdf`,
    { responseType: "blob" }
  );
  return response.data;
};

export const exporterRapportQAWord = async (
  projectId: number,
  cahierId: number
): Promise<Blob> => {
  const response = await axiosInstance.get(
    `${getRapportBase(projectId, cahierId)}/export/word`,
    { responseType: "blob" }
  );
  return response.data;
};

import axios from 'axios';

export interface Idea {
  id: string;
  userId: string;
  content: string;
  detail?: string | null;
  score?: string | null;
  isPublic: boolean;
  user?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ScoreResponse {
  idea: Idea;
  aiResponse: string;
  score: string;
}

export const ideaService = {
  async list(): Promise<Idea[]> {
    const response = await axios.get('/ideas');
    return response.data?.ideas || [];
  },

  async listPublic(): Promise<Idea[]> {
    const response = await axios.get('/ideas/public/list');
    return response.data?.ideas || [];
  },

  async get(id: string): Promise<Idea> {
    const response = await axios.get(`/ideas/${id}`);
    return response.data?.idea;
  },

  async create(content: string, isPublic: boolean): Promise<Idea> {
    const response = await axios.post('/ideas', { content, isPublic });
    return response.data?.idea;
  },

  async update(id: string, content: string, isPublic: boolean): Promise<Idea> {
    const response = await axios.put(`/ideas/${id}`, { content, isPublic });
    return response.data?.idea;
  },

  async remove(id: string): Promise<void> {
    await axios.delete(`/ideas/${id}`);
  },

  async score(id: string): Promise<ScoreResponse> {
    const response = await axios.post(`/ideas/${id}/score`);
    return response.data;
  }
};

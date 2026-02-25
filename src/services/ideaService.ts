import axios from 'axios';

export interface Idea {
  id: string;
  userId: string;
  content: string;
  detail?: string | null;
  score?: string | null;
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

  async get(id: string): Promise<Idea> {
    const response = await axios.get(`/ideas/${id}`);
    return response.data?.idea;
  },

  async create(content: string): Promise<Idea> {
    const response = await axios.post('/ideas', { content });
    return response.data?.idea;
  },

  async update(id: string, content: string): Promise<Idea> {
    const response = await axios.put(`/ideas/${id}`, { content });
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

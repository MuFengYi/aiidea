import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Button, Input, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';

import { ideaService, Idea } from '../../services/ideaService';

interface IdeaGroup {
  title: string;
  items: Idea[];
}

const formatIdeaDate = (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm:ss');

const groupIdeas = (ideas: Idea[]): IdeaGroup[] => {
  const now = dayjs();
  const groups: Record<string, Idea[]> = {};

  ideas.forEach((idea) => {
    const ideaDate = dayjs(idea.createdAt);
    let key = '';

    if (ideaDate.isSame(now, 'day')) {
      key = 'Today';
    } else if (ideaDate.isAfter(now.subtract(7, 'day'))) {
      key = 'Last 7 Days';
    } else if (ideaDate.isAfter(now.subtract(30, 'day'))) {
      key = 'Last 30 Days';
    } else {
      key = ideaDate.format('MMMM YYYY');
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(idea);
  });

  const orderedKeys: string[] = [];
  if (groups['Today']) orderedKeys.push('Today');
  if (groups['Last 7 Days']) orderedKeys.push('Last 7 Days');
  if (groups['Last 30 Days']) orderedKeys.push('Last 30 Days');

  const monthKeys = Object.keys(groups).filter(
    (key) => !['Today', 'Last 7 Days', 'Last 30 Days'].includes(key)
  );
  monthKeys.sort((a, b) => dayjs(b, 'MMMM YYYY').valueOf() - dayjs(a, 'MMMM YYYY').valueOf());
  orderedKeys.push(...monthKeys);

  return orderedKeys.map((key) => ({
    title: key,
    items: groups[key]
  }));
};

const IdeasPage: React.FC = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);

  const loadIdeas = async () => {
    setLoading(true);
    try {
      const list = await ideaService.list();
      setIdeas(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdeas();
  }, []);

  const filteredIdeas = useMemo(() => {
    if (!search.trim()) return ideas;
    return ideas.filter((idea) => idea.content.toLowerCase().includes(search.toLowerCase()));
  }, [ideas, search]);

  const groups = useMemo(() => groupIdeas(filteredIdeas), [filteredIdeas]);

  const handleAskAi = async (idea: Idea) => {
    if (idea.detail) {
      setSelectedIdea(idea);
      return;
    }

    try {
      setAiLoadingId(idea.id);
      const result = await ideaService.score(idea.id);
      setIdeas((prev) => prev.map((item) => (item.id === idea.id ? result.idea : item)));
      setSelectedIdea(result.idea);
    } finally {
      setAiLoadingId(null);
    }
  };

  const handleDelete = async (ideaId: string) => {
    await ideaService.remove(ideaId);
    setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
  };

  return (
    <div className="aiidea-page">
      <div className="aiidea-search">
        <Input
          placeholder="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="aiidea-loading">
          <Spin />
        </div>
      ) : (
        <div className="aiidea-list">
          {groups.map((group) => (
            <div key={group.title} className="aiidea-section">
              <div className="aiidea-section-title">{group.title}</div>
              <div className="aiidea-section-items">
                {group.items.map((idea) => (
                  <div key={idea.id} className="aiidea-row">
                    <div
                      className="aiidea-row-main"
                      onClick={() => navigate(`/idea/${idea.id}`)}
                    >
                      <div className="aiidea-row-title">{idea.content}</div>
                      <div className="aiidea-row-date">{formatIdeaDate(idea.createdAt)}</div>
                    </div>
                    <div className="aiidea-row-score">{idea.score || ''}</div>
                    <Button
                      type="text"
                      className="aiidea-row-ai"
                      loading={aiLoadingId === idea.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAskAi(idea);
                      }}
                    >
                      AI
                    </Button>
                    <Button
                      type="text"
                      className="aiidea-row-delete"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(idea.id);
                      }}
                    >
                      删除
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="aiidea-bottom-bar">
        <div className="aiidea-count">{ideas.length} ideas</div>
        <Button
          type="primary"
          shape="circle"
          icon={<EditOutlined />}
          className="aiidea-add-btn"
          onClick={() => navigate('/idea/new')}
        />
      </div>

      {selectedIdea && (
        <div className="aiidea-modal" onClick={() => setSelectedIdea(null)}>
          <div className="aiidea-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="aiidea-modal-title">AI Response</div>
            <div className="aiidea-modal-score">Score: {selectedIdea.score || '100'}</div>
            <div className="aiidea-modal-content">
              {selectedIdea.detail || 'No response yet.'}
            </div>
            <Button type="primary" onClick={() => setSelectedIdea(null)}>
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeasPage;

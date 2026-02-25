import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, Spin } from 'antd';

import { ideaService, Idea } from '../../services/ideaService';

const { TextArea } = Input;

const IdeaEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id || id === 'new';

  const [idea, setIdea] = useState<Idea | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) {
      setContent('');
      return;
    }

    const loadIdea = async () => {
      setLoading(true);
      try {
        const data = await ideaService.get(id as string);
        setIdea(data);
        setContent(data?.content || '');
      } finally {
        setLoading(false);
      }
    };

    loadIdea();
  }, [id, isNew]);

  const handleSave = async () => {
    if (!content.trim()) {
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await ideaService.create(content.trim());
      } else if (id) {
        await ideaService.update(id, content.trim());
      }
      navigate('/');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="aiidea-loading">
        <Spin />
      </div>
    );
  }

  return (
    <div className="aiidea-editor">
      <div className="aiidea-editor-bar">
        <Button type="text" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button type="primary" loading={saving} onClick={handleSave}>
          Done
        </Button>
      </div>

      <TextArea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write your idea..."
        autoSize={{ minRows: 10 }}
        className="aiidea-editor-textarea"
      />

      {!isNew && idea && (
        <div className="aiidea-editor-meta">
          <div>Last updated: {new Date(idea.updatedAt).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
};

export default IdeaEditorPage;

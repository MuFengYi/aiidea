import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Checkbox, Input, Spin } from 'antd';

import { ideaService, Idea } from '../../services/ideaService';

const { TextArea } = Input;

const IdeaEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id || id === 'new';

  const [idea, setIdea] = useState<Idea | null>(null);
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) {
      setContent('');
      setIsPublic(false);
      return;
    }

    const loadIdea = async () => {
      setLoading(true);
      try {
        const data = await ideaService.get(id as string);
        setIdea(data);
        setContent(data?.content || '');
        setIsPublic(!!data?.isPublic);
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
        await ideaService.create(content.trim(), isPublic);
      } else if (id) {
        await ideaService.update(id, content.trim(), isPublic);
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

      <Checkbox checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)}>
        公开给网友看到
      </Checkbox>

      {!isNew && idea && (
        <div className="aiidea-editor-meta">
          <div>Last updated: {new Date(idea.updatedAt).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
};

export default IdeaEditorPage;

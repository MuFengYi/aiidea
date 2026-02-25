import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Rate,
  Space,
  Tag,
  Avatar,
  Divider,
  Upload,
  message,
  Row,
  Col,
  Popconfirm,
  Empty,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CalendarOutlined,
  PaperClipOutlined,
  SmileOutlined,
  MehOutlined,
  FrownOutlined,
  UploadOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';
import { apiService, ReviewNote } from '../../services/api';



const { TextArea } = Input;

const ReviewNotesPage: React.FC = () => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<ReviewNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<ReviewNote | null>(null);
  const [form] = Form.useForm();
  const [filterMood, setFilterMood] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  // Load notes from API
  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getReviewNotes();
      setNotes(response.notes || []);
    } catch (error) {
      console.error('Failed to load notes:', error);
      message.error(t('notes.loadNotesFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleAdd = () => {
    setEditingNote(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (note: ReviewNote) => {
    setEditingNote(note);
    form.setFieldsValue({
      ...note,
      reviewDate: dayjs(note.reviewDate || note.date)
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await apiService.deleteReviewNote(id);
      await loadNotes(); // Reload notes
      message.success(t('notes.noteDeleted'));
    } catch (error) {
      console.error('Failed to delete note:', error);
      message.error(t('notes.deleteFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const formData = {
        tradeId: values.tradeId,
        stockSymbol: values.stockSymbol || '',
        title: values.title,
        content: values.content,
        mood: values.mood,
        rating: values.rating,
        tags: values.tags || [],
        attachments: [], // File upload handling can be added later
        marketCondition: values.marketCondition || '',
        lessonsLearned: values.lessonsLearned || '',
        actionItems: values.actionItems || [],
        isPublic: values.isPublic || false,
        date: values.date ? values.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      };

      if (editingNote) {
        await apiService.updateReviewNote(editingNote.id, formData);
        message.success(t('notes.noteUpdated'));
      } else {
        await apiService.createReviewNote(formData);
        message.success(t('notes.noteAdded'));
      }

      await loadNotes(); // Reload notes
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to save note:', error);
      message.error(t('notes.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'positive':
        return <SmileOutlined style={{ color: '#52c41a' }} />;
      case 'negative':
        return <FrownOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <MehOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive':
        return 'green';
      case 'negative':
        return 'red';
      default:
        return 'orange';
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesMood = filterMood === 'all' || (note.mood || 'neutral') === filterMood;
    const matchesSearch = !searchText ||
      note.title.toLowerCase().includes(searchText.toLowerCase()) ||
      note.content.toLowerCase().includes(searchText.toLowerCase()) ||
      (note.stockSymbol && note.stockSymbol.toLowerCase().includes(searchText.toLowerCase()));
    return matchesMood && matchesSearch;
  });

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    beforeUpload: () => {
      message.info('文件上传功能开发中...');
      return false;
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('nav.notes')}</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          {t('notes.writeReviewNote')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col>
            <span className="font-medium">{t('notes.filter')}：</span>
          </Col>
          <Col>
            <Select
              value={filterMood}
              onChange={setFilterMood}
              style={{ width: 120 }}
            >
              <Select.Option value="all">{t('notes.allMoods')}</Select.Option>
              <Select.Option value="positive">{t('notes.positive')}</Select.Option>
              <Select.Option value="neutral">{t('notes.neutral')}</Select.Option>
              <Select.Option value="negative">{t('notes.negative')}</Select.Option>
            </Select>
          </Col>
          <Col flex={1}>
            <Input.Search
              placeholder={t('notes.searchPlaceholder')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: 400 }}
            />
          </Col>
        </Row>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <Card>
            <Empty
              description={t('notes.noNotes')}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                {t('notes.writeFirstNote')}
              </Button>
            </Empty>
          </Card>
        ) : (
          filteredNotes.map(note => (
            <Card
              key={note.id}
              className="hover:shadow-md transition-shadow"
              actions={[
                <Button
                  key="edit"
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(note)}
                >
                  {t('notes.edit')}
                </Button>,
                <Popconfirm
                  key="delete"
                  title={t('notes.confirmDelete')}
                  onConfirm={() => handleDelete(note.id)}
                  okText={t('notes.confirm')}
                  cancelText={t('notes.cancel')}
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    {t('notes.delete')}
                  </Button>
                </Popconfirm>
              ]}
            >
              <Card.Meta
                avatar={
                  <Avatar size={48} style={{ backgroundColor: '#1890ff' }}>
                    <FileTextOutlined />
                  </Avatar>
                }
                title={
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{note.title}</span>
                    <div className="flex items-center space-x-2">
                      {note.stockSymbol && (
                        <Tag color="blue">{note.stockSymbol}</Tag>
                      )}
                      {note.isPublic && (
                        <Badge status="success" text={t('notes.public')} />
                      )}
                    </div>
                  </div>
                }
                description={
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        <CalendarOutlined /> {dayjs(note.reviewDate || note.date).format('YYYY-MM-DD')}
                      </span>
                      <span>
                        {getMoodIcon(note.mood || 'neutral')} {(note.mood || 'neutral') === 'positive' ? t('notes.positive') : (note.mood || 'neutral') === 'negative' ? t('notes.negative') : t('notes.neutral')}
                      </span>
                      <Rate disabled value={note.rating} />
                    </div>

                    <div className="text-gray-700 whitespace-pre-line">
                      {note.content.length > 200 ?
                        `${note.content.substring(0, 200)}...` :
                        note.content
                      }
                    </div>

                    {note.tags.length > 0 && (
                      <div>
                        {note.tags.map(tag => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </div>
                    )}

                    {(note.attachments && note.attachments.length > 0) && (
                      <div className="text-sm text-gray-500">
                        <PaperClipOutlined /> {note.attachments.length} {t('notes.attachments')}
                      </div>
                    )}

                    {note.lessonsLearned && (
                      <div className="bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                        <span className="font-medium text-yellow-800">{t('notes.lessonsLearned')}：</span>
                        <span className="text-yellow-700">{note.lessonsLearned}</span>
                      </div>
                    )}
                  </div>
                }
              />
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={editingNote ? t('notes.editReviewNote') : t('notes.writeReviewNote')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            mood: 'neutral',
            rating: 3,
            isPublic: false
          }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="title"
                label={t('notes.title')}
                rules={[{ required: true, message: t('notes.enterTitle') }]}
              >
                <Input placeholder={t('notes.titlePlaceholder')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="stockSymbol"
                label={t('notes.stockSymbol')}
              >
                <Input placeholder={t('trades.stockSymbolPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="content"
            label={t('notes.reviewContent')}
            rules={[{ required: true, message: t('notes.enterReviewContent') }]}
          >
            <TextArea
              rows={8}
              placeholder={t('notes.contentPlaceholder')}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="reviewDate"
                label={t('notes.reviewDate')}
                rules={[{ required: true, message: t('notes.selectReviewDate') }]}
                initialValue={dayjs()}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="mood"
                label={t('notes.mood')}
                rules={[{ required: true, message: t('notes.selectMood') }]}
              >
                <Select>
                  <Select.Option value="positive">
                    <SmileOutlined style={{ color: '#52c41a' }} /> {t('notes.positive')}
                  </Select.Option>
                  <Select.Option value="neutral">
                    <MehOutlined style={{ color: '#faad14' }} /> {t('notes.neutral')}
                  </Select.Option>
                  <Select.Option value="negative">
                    <FrownOutlined style={{ color: '#ff4d4f' }} /> {t('notes.negative')}
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="rating"
                label={t('notes.rating')}
                rules={[{ required: true, message: t('notes.pleaseRate') }]}
              >
                <Rate />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="marketCondition"
                label={t('notes.marketCondition')}
              >
                <Select placeholder={t('notes.selectMarketCondition')}>
                  <Select.Option value="牛市">{t('notes.bullMarket')}</Select.Option>
                  <Select.Option value="熊市">{t('notes.bearMarket')}</Select.Option>
                  <Select.Option value="震荡">{t('notes.sideways')}</Select.Option>
                  <Select.Option value="调整">{t('notes.correction')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isPublic"
                label={t('notes.isPublic')}
                valuePropName="checked"
              >
                <Select>
                  <Select.Option value={false}>{t('notes.privateNote')}</Select.Option>
                  <Select.Option value={true}>{t('notes.publicShare')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="tags"
            label={t('trades.tags')}
          >
            <Select
              mode="tags"
              placeholder={t('notes.addTags')}
              style={{ width: '100%' }}
            >
              <Select.Option value="成功案例">{t('notes.successCase')}</Select.Option>
              <Select.Option value="失误总结">{t('notes.mistakeSummary')}</Select.Option>
              <Select.Option value="技术分析">{t('notes.technicalAnalysis')}</Select.Option>
              <Select.Option value="基本面">{t('notes.fundamentals')}</Select.Option>
              <Select.Option value="市场观察">{t('notes.marketObservation')}</Select.Option>
              <Select.Option value="情绪控制">{t('notes.emotionControl')}</Select.Option>
              <Select.Option value="风险管理">{t('notes.riskManagement')}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="lessonsLearned"
            label={t('notes.experienceSummary')}
          >
            <TextArea
              rows={3}
              placeholder={t('notes.lessonsPlaceholder')}
            />
          </Form.Item>

          <Form.Item
            name="actionItems"
            label={t('notes.actionPlan')}
          >
            <Select
              mode="tags"
              placeholder={t('notes.whatToDoNext')}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label={t('notes.attachments')}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>{t('notes.uploadFiles')}</Button>
            </Upload>
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingNote ? t('notes.updateNote') : t('notes.saveNote')}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewNotesPage;
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Space,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  message,
  Upload,
  Divider,
  Alert
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  LoginOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { apiService, Position, Transaction } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';



const TradingRecordsPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, login, token } = useAuthStore();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [closePositionModalVisible, setClosePositionModalVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [transactionForm] = Form.useForm();
  const [closePositionForm] = Form.useForm();

  // Debug authentication state
  useEffect(() => {
    console.log('TradingRecordsPage - Auth state:', {
      isAuthenticated,
      hasToken: !!token,
      tokenPreview: token?.substring(0, 20) + '...'
    });
  }, [isAuthenticated, token]);

  // Demo login function
  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      console.log('Attempting demo login...');
      await login('test@example.com', 'TestPassword123!');
      message.success('Demo login successful!');
      console.log('Demo login completed, authentication state should be updated');
    } catch (error) {
      console.error('Demo login error:', error);
      message.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  // Load positions from API
  const loadPositions = async () => {
    try {
      setLoading(true);
      console.log('Loading positions, isAuthenticated:', isAuthenticated);
      const response = await apiService.getPositions();
      setPositions(response.positions || []);
    } catch (error) {
      console.error('Failed to load positions:', error);
      message.error('加载仓位数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPositions();
    } else {
      setLoading(false); // Stop loading if not authenticated
    }
  }, [isAuthenticated]);

  const handleNewPosition = () => {
    if (!isAuthenticated) {
      message.warning('请先登录后再开新仓位');
      return;
    }
    setSelectedPosition(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleAddTransaction = (position: Position) => {
    if (!isAuthenticated) {
      message.warning('请先登录后再添加交易');
      return;
    }
    setSelectedPosition(position);
    transactionForm.resetFields();
    setTransactionModalVisible(true);
  };

  const handleClosePosition = (position: Position) => {
    if (!isAuthenticated) {
      message.warning('请先登录后再清仓');
      return;
    }
    setSelectedPosition(position);
    closePositionForm.resetFields();
    setClosePositionModalVisible(true);
  };

  const handleSubmitClosePosition = async (values: any) => {
    if (!selectedPosition) return;

    try {
      setLoading(true);
      const closeData = {
        price: values.price,
        commission: values.commission || 0,
        date: values.date.format('YYYY-MM-DD'),
        notes: values.notes || '清仓'
      };

      await apiService.closePosition(selectedPosition.id, closeData);
      await loadPositions(); // Reload positions
      setClosePositionModalVisible(false);
      closePositionForm.resetFields();
      message.success('仓位已清仓');
    } catch (error) {
      console.error('Failed to close position:', error);
      message.error('清仓失败');
    } finally {
      setLoading(false);
    }
  };



  const handleSubmitNewPosition = async (values: any) => {
    try {
      setLoading(true);
      const positionData = {
        stockSymbol: values.stockSymbol,
        stockName: values.stockName,
        direction: values.direction,
        price: values.price,
        quantity: values.quantity,
        date: values.date.format('YYYY-MM-DD'),
        notes: values.notes,
        commission: values.commission || 0,
        tags: values.tags || []
      };

      await apiService.createPosition(positionData);
      await loadPositions(); // Reload positions
      setModalVisible(false);
      form.resetFields();
      message.success('新仓位已创建');
    } catch (error) {
      console.error('Failed to create position:', error);
      message.error('创建仓位失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTransaction = async (values: any) => {
    if (!selectedPosition) return;

    try {
      setLoading(true);
      const transactionData = {
        type: values.type,
        quantity: values.quantity,
        price: values.price,
        commission: values.commission || 0,
        date: values.date.format('YYYY-MM-DD'),
        notes: values.notes
      };

      await apiService.addTransaction(selectedPosition.id, transactionData);
      await loadPositions(); // Reload positions
      setTransactionModalVisible(false);
      transactionForm.resetFields();
      message.success('交易已添加');
    } catch (error) {
      console.error('Failed to add transaction:', error);
      message.error('添加交易失败');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Position> = [
    {
      title: t('trades.stockCode'),
      dataIndex: 'stockSymbol',
      key: 'stockSymbol',
      width: 100,
      render: (text, record) => (
        <div>
          <Tag color="blue">{text}</Tag>
          <div className="text-xs text-gray-500">{record.stockName}</div>
        </div>
      )
    },
    {
      title: t('trades.status'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'gray'}>
          {status === 'active' ? t('trades.holding') : t('trades.closed')}
        </Tag>
      )
    },
    {
      title: t('trades.direction'),
      dataIndex: 'direction',
      key: 'direction',
      width: 80,
      render: (direction) => (
        <Tag color={direction === 'long' ? 'green' : 'red'}>
          {direction === 'long' ? t('trades.long') : t('trades.short')}
        </Tag>
      )
    },
    {
      title: t('trades.currentHolding'),
      dataIndex: 'currentQuantity',
      key: 'currentQuantity',
      width: 100,
      render: (qty) => qty.toLocaleString()
    },
    {
      title: t('trades.averageCost'),
      dataIndex: 'averageBuyPrice',
      key: 'averageBuyPrice',
      width: 100,
      render: (price) => `$${price.toFixed(2)}`
    },
    {
      title: t('trades.totalInvestment'),
      dataIndex: 'totalInvested',
      key: 'totalInvested',
      width: 120,
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      title: t('trades.realizedPnL'),
      dataIndex: 'realizedPnL',
      key: 'realizedPnL',
      width: 120,
      render: (pnl) => {
        if (pnl === undefined) return '-';
        const color = pnl >= 0 ? 'green' : 'red';
        const icon = pnl >= 0 ? <RiseOutlined /> : <FallOutlined />;
        return (
          <span style={{ color }}>
            {icon} ${Math.abs(pnl).toFixed(2)}
          </span>
        );
      }
    },
    {
      title: t('trades.openDate'),
      dataIndex: 'openDate',
      key: 'openDate',
      width: 120,
      render: (date) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: t('trades.tags'),
      dataIndex: 'tags',
      key: 'tags',
      width: 120,
      render: (tags) => (
        <>
          {tags?.map((tag: string) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </>
      )
    },
    {
      title: t('trades.operations'),
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'active' && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => handleAddTransaction(record)}
              >
                {t('trades.addTransaction')}
              </Button>
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleClosePosition(record)}
              >
                {t('trades.closePosition')}
              </Button>
            </>
          )}
          {record.status === 'closed' && (
            <Tag color="gray">{t('trades.ended')}</Tag>
          )}
        </Space>
      )
    }
  ];

  const totalInvestment = positions.reduce((sum, pos) => sum + pos.totalInvested, 0);
  const totalRealizedPnL = positions.reduce((sum, pos) => sum + (pos.realizedPnL || 0), 0);
  const totalPositions = positions.length;
  const activePositions = positions.filter(pos => pos.status === 'active').length;
  const averageHoldingTime = positions.reduce((sum, pos) => {
    if (pos.status === 'closed') {
      const duration = dayjs(pos.closeDate).diff(dayjs(pos.openDate), 'day');
      return sum + duration;
    }
    return sum;
  }, 0);

  const expandedRowRender = (position: Position) => {
    const transactionColumns = [
      {
        title: t('trades.type'),
        dataIndex: 'type',
        key: 'type',
        render: (type: string) => (
          <Tag color={type === 'buy' ? 'green' : 'red'}>
            {type === 'buy' ? t('trades.buy') : t('trades.sell')}
          </Tag>
        )
      },
      {
        title: t('trades.quantity'),
        dataIndex: 'quantity',
        key: 'quantity'
      },
      {
        title: t('trades.price'),
        dataIndex: 'price',
        key: 'price',
        render: (price: number) => `$${price.toFixed(2)}`
      },
      {
        title: t('trades.commission'),
        dataIndex: 'commission',
        key: 'commission',
        render: (commission: number) => `$${commission.toFixed(2)}`
      },
      {
        title: t('trades.date'),
        dataIndex: 'date',
        key: 'date',
        render: (date: string) => dayjs(date).format('YYYY-MM-DD')
      },
      {
        title: t('trades.notes'),
        dataIndex: 'notes',
        key: 'notes'
      }
    ];

    return (
      <div className="p-4 bg-gray-50">
        <h4 className="mb-3 font-semibold">{t('trades.transactionDetails')}</h4>
        <Table
          columns={transactionColumns}
          dataSource={position.transactions}
          pagination={false}
          size="small"
          rowKey="id"
        />
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('trades.positionManagement')}</h1>
        <Space>
          {!isAuthenticated ? (
            <Button
              type="primary"
              onClick={handleDemoLogin}
              loading={loading}
            >
              {t('trades.demoLoginToAccess')}
            </Button>
          ) : (
            <>
              {/* <Button icon={<DownloadOutlined />}>{t('trades.exportData')}</Button> */}
              <Button type="primary" icon={<PlusOutlined />} onClick={handleNewPosition}>
                {t('trades.newPosition')}
              </Button>
            </>
          )}
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title={t('overview.totalInvestment')}
              value={totalInvestment}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('trades.realizedPnL')}
              value={totalRealizedPnL}
              precision={2}
              valueStyle={{ color: totalRealizedPnL >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={totalRealizedPnL >= 0 ? <RiseOutlined /> : <FallOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('overview.currentPositions')}
              value={activePositions}
              suffix={`/ ${totalPositions}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('trades.averageHoldingTime')}
              value={(averageHoldingTime / totalPositions).toFixed(1)}
              suffix={t('common.days')}
            />
          </Card>
        </Col>
      </Row>

      {/* Position Records Table */}
      {!isAuthenticated ? (
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('trades.needLoginToView')}</h3>
            <p className="text-gray-500 mb-6">{t('trades.clickDemoLogin')}</p>
            <Button type="primary" onClick={handleDemoLogin} loading={loading}>
              Demo Login
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <Table
            columns={columns}
            dataSource={positions}
            loading={loading}
            rowKey="id"
            expandable={{
              expandedRowRender,
              expandRowByClick: true,
              expandedRowKeys: expandedRows,
              onExpand: (expanded, record) => {
                setExpandedRows(
                  expanded
                    ? [...expandedRows, record.id]
                    : expandedRows.filter(key => key !== record.id)
                );
              }
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `${t('trades.totalPositions', { total })}`
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      )}

      {/* New Position Modal */}
      <Modal
        title={t('trades.newPosition')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitNewPosition}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="stockSymbol"
                label={t('trades.stockCode')}
                rules={[{ required: true, message: t('trades.enterStockCode') }]}
              >
                <Input placeholder={t('trades.stockSymbolPlaceholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="stockName"
                label={t('trades.stockName')}
                rules={[{ required: true, message: t('trades.enterStockName') }]}
              >
                <Input placeholder={t('trades.stockNamePlaceholder')} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="direction"
            label={t('trades.tradingDirection')}
            rules={[{ required: true, message: t('trades.selectTradingDirection') }]}
          >
            <Select placeholder={t('trades.selectLongOrShort')}>
              <Select.Option value="long">{t('trades.long')} (Long)</Select.Option>
              <Select.Option value="short">{t('trades.short')} (Short)</Select.Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label={t('trades.openPrice')}
                rules={[{ required: true, message: t('trades.enterPrice') }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  precision={2}
                  min={0}
                  placeholder="0.00"
                  prefix="$"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label={t('trades.openQuantity')}
                rules={[{ required: true, message: t('trades.enterQuantity') }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="100"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="commission"
                label={t('trades.commission')}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  precision={2}
                  min={0}
                  placeholder="0.00"
                  prefix="$"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="date"
            label={t('trades.date')}
            rules={[{ required: true, message: '请选择交易日期' }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="tags" label={t('trades.tags')}>
            <Select mode="tags" placeholder={t('trades.addTags')} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="notes" label={t('trades.notes')}>
            <Input.TextArea rows={3} placeholder={t('trades.tradingNotes')} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">{t('trades.open')}</Button>
              <Button onClick={() => setModalVisible(false)}>{t('common.cancel')}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Transaction Modal */}
      <Modal
        title={`${t('trades.addTransaction')} ${selectedPosition?.stockSymbol}`}
        open={transactionModalVisible}
        onCancel={() => setTransactionModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={transactionForm}
          layout="vertical"
          onFinish={handleSubmitTransaction}
        >
          <Alert
            message={t('trades.currentPositionInfo')}
            description={selectedPosition ? `${t('trades.currentHolding')}：${selectedPosition.currentQuantity} ${t('common.shares')}，${t('trades.direction')}：${selectedPosition.direction === 'long' ? t('trades.long') : t('trades.short')}，${t('trades.averageCost')}：$${selectedPosition.averageBuyPrice.toFixed(2)}` : ''}
            type="info"
            className="mb-4"
          />

          <Form.Item
            name="type"
            label={t('trades.tradingType')}
            rules={[{ required: true, message: t('trades.selectTradingType') }]}
          >
            <Select>
              {selectedPosition?.direction === 'long' ? (
                <>
                  <Select.Option value="buy">{t('trades.addPosition')}（{t('trades.buy')}）</Select.Option>
                  <Select.Option value="sell">{t('trades.reducePosition')}（{t('trades.sell')}）</Select.Option>
                </>
              ) : (
                <>
                  <Select.Option value="sell">{t('trades.addPosition')}（{t('trades.sell')}）</Select.Option>
                  <Select.Option value="buy">{t('trades.reducePosition')}（{t('trades.buy')}）</Select.Option>
                </>
              )}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label={t('trades.tradingPrice')}
                rules={[{ required: true, message: t('trades.enterPrice') }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  precision={2}
                  min={0}
                  placeholder="0.00"
                  prefix="$"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label={t('trades.tradingQuantity')}
                rules={[{ required: true, message: t('trades.enterQuantity') }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={selectedPosition?.currentQuantity}
                  placeholder="100"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="commission"
                label={t('trades.commission')}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  precision={2}
                  min={0}
                  placeholder="0.00"
                  prefix="$"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="date"
            label={t('trades.tradingDate')}
            rules={[{ required: true, message: '请选择交易日期' }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="notes" label={t('trades.notes')}>
            <Input.TextArea rows={3} placeholder={t('trades.tradingNotes')} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">{t('trades.addTransaction')}</Button>
              <Button onClick={() => setTransactionModalVisible(false)}>{t('common.cancel')}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Close Position Modal */}
      <Modal
        title={`${t('trades.closePosition')} ${selectedPosition?.stockSymbol}`}
        open={closePositionModalVisible}
        onCancel={() => setClosePositionModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={closePositionForm}
          layout="vertical"
          onFinish={handleSubmitClosePosition}
        >
          <Alert
            message={t('trades.positionClosure')}
            description={selectedPosition ?
              `${t('trades.currentHolding')}：${selectedPosition.currentQuantity} ${t('common.shares')}，${t('trades.direction')}：${selectedPosition.direction === 'long' ? t('trades.long') : t('trades.short')}，${t('trades.willCloseAll')}` : ''
            }
            type="warning"
            className="mb-4"
          />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label={t('trades.closePrice')}
                rules={[{ required: true, message: t('trades.enterClosePrice') }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  precision={2}
                  min={0}
                  placeholder="0.00"
                  prefix="$"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="commission"
                label={t('trades.commission')}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  precision={2}
                  min={0}
                  placeholder="0.00"
                  prefix="$"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="date"
            label={t('trades.closeDate')}
            rules={[{ required: true, message: t('trades.selectCloseDate') }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="notes" label={t('trades.notes')}>
            <Input.TextArea rows={2} placeholder={t('trades.closeNotes')} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" danger>{t('trades.confirmClose')}</Button>
              <Button onClick={() => setClosePositionModalVisible(false)}>{t('common.cancel')}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TradingRecordsPage;
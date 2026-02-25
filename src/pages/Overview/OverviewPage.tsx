import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Spin, message } from 'antd';
import { 
  DollarOutlined, 
  SwapOutlined, 
  TrophyOutlined, 
  FallOutlined,
  PlusOutlined,
  EditOutlined,
  LoginOutlined 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';



const OverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  // Demo login function
  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      await login('test@example.com', 'TestPassword123!');
      message.success('Demo login successful!');
    } catch (error) {
      message.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  // Load analytics data from API
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [analytics] = await Promise.all([
        apiService.getOverviewAnalytics(),
      ]);
      
      setAnalyticsData(analytics);
      // Transform performance data for chart
      const chartData = analytics.monthlyProfit?.map((item: any) => ({
        date: item.date,
        profit: item.profit
      })) || [];
      setPerformanceData(chartData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalyticsData();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('nav.overview')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('app.subtitle')}
          </p>
        </div>
        
        <Space>
          {!isAuthenticated ? (
            <Button 
              type="primary" 
              icon={<LoginOutlined />}
              onClick={handleDemoLogin}
              loading={loading}
            >
              Demo Login
            </Button>
          ) : (
            <>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/trades')}
              >
                {t('trades.addTrade')}
              </Button>
              <Button 
                icon={<EditOutlined />}
                onClick={() => navigate('/notes')}
              >
                {t('notes.addNote')}
              </Button>
            </>
          )}
        </Space>
      </div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('overview.totalProfitLoss')}
              value={analyticsData?.totalProfitLoss || 0}
              precision={2}
              valueStyle={{ color: (analyticsData?.totalProfitLoss || 0) >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
            <div className="text-xs text-gray-500 mt-2">
              {(analyticsData?.totalProfitLoss/analyticsData?.totalInvestment*100).toFixed(2) || '0.00'}%
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('overview.totalTrades')}
              value={analyticsData?.totalTrades || 0}
              prefix={<SwapOutlined />}
            />
            <div className="text-xs text-gray-500 mt-2">
              {t('overview.positions')}: {analyticsData?.totalPositions || 0}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('overview.winRate')}
              value={analyticsData?.winRate || 0}
              precision={1}
              valueStyle={{ color: (analyticsData?.winRate || 0) >= 50 ? '#3f8600' : '#cf1322' }}
              prefix={<TrophyOutlined />}
              suffix="%"
            />
            <div className="text-xs text-gray-500 mt-2">
              {analyticsData?.winningTrades || 0}{t('overview.wins')}/{analyticsData?.losingTrades || 0}{t('overview.losses')}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('overview.currentPositions')}
              value={analyticsData?.activePositions || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SwapOutlined />}
              suffix={t('common.total')}
            />
            <div className="text-xs text-gray-500 mt-2">
              {t('overview.totalInvestment')}: ${analyticsData?.totalInvestment?.toFixed(2) || '0.00'}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Profit Trend Chart */}
      <Card title={t('overview.profitTrend')}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`$${value}`, 'Profit']}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#007AFF" 
              strokeWidth={2}
              dot={{ fill: '#007AFF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Stock Performance */}
      <Card 
        title={t('overview.stockPerformance')}
        // extra={
        //   <Button 
        //     type="link" 
        //     onClick={() => navigate('/statistics')}
        //   >
        //     {t('overview.viewDetails')}
        //   </Button>
        // }
      >
        <div className="space-y-3">
          {analyticsData?.stockPerformance?.slice(0, 5).map((stock: any, index: number) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <SwapOutlined className="text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">{stock.symbol}</div>
                  <div className="text-sm text-gray-500">
                    {t('overview.performanceRank')} #{index + 1}
                  </div>
                </div>
              </div>
              <div className={`font-semibold ${stock.performance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock.performance > 0 ? '+' : ''}${stock.performance.toFixed(2)}
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-500 py-8">
              {t('overview.noData')}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OverviewPage;
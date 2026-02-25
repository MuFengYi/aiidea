import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Table,
  Tag,
  Progress,
  Space,
  Alert,
  Divider,
  Spin
} from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  PercentageOutlined,
  CalendarOutlined,
  LineChartOutlined,
  PieChartOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { apiService } from '../../services/api';

const { RangePicker } = DatePicker;

interface StockPerformance {
  stockSymbol: string;
  stockName: string;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  trades: number;
  winRate: number;
}

interface MonthlyData {
  month: string;
  profit: number;
  loss: number;
  netProfit: number;
  trades: number;
}

interface SectorData {
  name: string;
  value: number;
  color: string;
}

const StatisticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [timeFrame, setTimeFrame] = useState('all');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [positionStats, setPositionStats] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [stockPerformance, setStockPerformance] = useState<any[]>([]);

  // Load statistics data from API
  const loadStatisticsData = async () => {
    try {
      setLoading(true);
      const [analytics, positions, performance] = await Promise.all([
        apiService.getOverviewAnalytics(),
        apiService.getPositionStatistics(),
        apiService.getPerformanceAnalytics(timeFrame as any)
      ]);
      
      setAnalyticsData(analytics);
      setPositionStats(positions);
      // Transform performance data for charts
      const chartData = performance.performance?.map((item: any) => ({
        date: item.period,
        month: item.period.substring(5) || item.period, // Extract month part
        profit: Math.max(item.realizedPnL || item.netAmount || 0, 0),
        loss: Math.abs(Math.min(item.realizedPnL || item.netAmount || 0, 0)),
        netProfit: item.realizedPnL || item.netAmount || 0,
        trades: item.tradeCount || 0
      })) || [];
      setPerformanceData(chartData);
      setStockPerformance(analytics.stockPerformance || []);
    } catch (error) {
      console.error('Failed to load statistics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatisticsData();
  }, [timeFrame]);

  // Calculate overall stats from real data
  const overallStats = {
    totalInvestment: positionStats?.totalInvestment || 0,
    currentValue: (positionStats?.totalInvestment || 0) + (analyticsData?.totalProfitLoss || 0),
    totalProfit: analyticsData?.totalProfitLoss || 0,
    profitPercentage: positionStats?.totalInvestment ? 
      ((analyticsData?.totalProfitLoss || 0) / positionStats.totalInvestment * 100) : 0,
    totalTrades: analyticsData?.totalTrades || 0,
    winningTrades: analyticsData?.winningTrades || 0,
    winRate: analyticsData?.winRate || 0,
    avgProfitPerTrade: analyticsData?.totalTrades ? 
      (analyticsData.totalProfitLoss / analyticsData.totalTrades) : 0,
    maxDrawdown: 0, // This would need additional calculation
    sharpeRatio: 0 // This would need additional calculation
  };

  const profitLossData = performanceData.map((item: any) => ({
    month: item.month,
    [t('statistics.profit')]: item.profit,
    [t('statistics.loss')]: item.loss,
    [t('statistics.netProfit')]: item.netProfit
  }));

  const sectorData = [
    { name: t('statistics.technology'), value: 45, color: '#1890ff' },
    { name: t('statistics.finance'), value: 25, color: '#52c41a' },
    { name: t('statistics.healthcare'), value: 15, color: '#faad14' },
    { name: t('statistics.energy'), value: 10, color: '#f5222d' },
    { name: t('statistics.others'), value: 5, color: '#722ed1' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  const performanceColumns: ColumnsType<any> = [
    {
      title: t('statistics.stock'),
      dataIndex: 'symbol',
      key: 'symbol',
      render: (symbol: string, record: any) => (
        <div>
          <Tag color="blue">{symbol}</Tag>
          <div className="text-xs text-gray-500">{t('statistics.stock')}</div>
        </div>
      )
    },
    {
      title: t('statistics.performance'),
      dataIndex: 'performance',
      key: 'performance',
      render: (value: number) => {
        const color = value >= 0 ? 'green' : 'red';
        const icon = value >= 0 ? <RiseOutlined /> : <FallOutlined />;
        return (
          <span style={{ color }}>
            {icon} ${Math.abs(value).toFixed(2)}
          </span>
        );
      }
    }
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('nav.statistics')}</h1>
        <Space>
          {/* <Select
            value={timeFrame}
            onChange={setTimeFrame}
            style={{ width: 120 }}
          >
            <Select.Option value="all">{t('statistics.all')}</Select.Option>
            <Select.Option value="ytd">{t('statistics.ytd')}</Select.Option>
            <Select.Option value="6m">{t('statistics.last6Months')}</Select.Option>
            <Select.Option value="3m">{t('statistics.last3Months')}</Select.Option>
          </Select>
          <RangePicker 
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            format="YYYY-MM-DD"
          /> */}
        </Space>
      </div>

      {/* Overall Statistics */}
      <Alert
        message={t('statistics.overallPerformance')}
        description={t('statistics.performanceDescription')}
        type="info"
        showIcon
        className="mb-6"
      />
      
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('statistics.totalInvestment')}
              value={overallStats.totalInvestment}
              precision={0}
              prefix={<DollarOutlined />}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('statistics.currentValue')}
              value={overallStats.currentValue}
              precision={0}
              prefix={<DollarOutlined />}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('statistics.totalProfitLoss')}
              value={overallStats.totalProfit}
              precision={0}
              valueStyle={{ color: overallStats.totalProfit >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={overallStats.totalProfit >= 0 ? <RiseOutlined /> : <FallOutlined />}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
              suffix={`(${overallStats.profitPercentage.toFixed(2)}%)`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('statistics.winRate')}
              value={overallStats.winRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: overallStats.winRate >= 50 ? '#3f8600' : '#cf1322' }}
              prefix={<PercentageOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('statistics.totalTrades')}
              value={overallStats.totalTrades}
              suffix={t('common.times')}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('statistics.averageProfit')}
              value={overallStats.avgProfitPerTrade}
              prefix={<DollarOutlined />}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('statistics.maxDrawdown')}
              value={Math.abs(overallStats.maxDrawdown)}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
              prefix={<FallOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('statistics.sharpeRatio')}
              value={overallStats.sharpeRatio}
              precision={2}
              valueStyle={{ color: overallStats.sharpeRatio >= 1 ? '#3f8600' : '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card title={
            <div className="flex items-center">
              <LineChartOutlined className="mr-2" />
              {t('statistics.monthlyProfitTrend')}
            </div>
          }>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={profitLossData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`$${value}`, name]} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey={t('statistics.netProfit')} 
                  stackId="1" 
                  stroke="#1890ff" 
                  fill="#1890ff" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={
            <div className="flex items-center">
              <PieChartOutlined className="mr-2" />
              {t('statistics.sectorDistribution')}
            </div>
          }>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card title={
            <div className="flex items-center">
              <BarChartOutlined className="mr-2" />
              {t('statistics.monthlyProfitBreakdown')}
            </div>
          }>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitLossData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`$${value}`, name]} />
                <Legend />
                <Bar dataKey={t('statistics.profit')} fill="#52c41a" />
                <Bar dataKey={t('statistics.loss')} fill="#ff4d4f" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Stock Performance Table */}
      <Card 
        title={t('statistics.stockPerformanceAnalysis')} 
        className="mb-6"
        extra={
          <Select defaultValue="profitLoss" style={{ width: 120 }}>
            <Select.Option value="profitLoss">{t('statistics.sortByProfitLoss')}</Select.Option>
            <Select.Option value="winRate">{t('statistics.sortByWinRate')}</Select.Option>
            <Select.Option value="trades">{t('statistics.sortByTrades')}</Select.Option>
          </Select>
        }
      >
        <Table
          columns={performanceColumns}
          dataSource={stockPerformance}
          rowKey="stockSymbol"
          pagination={false}
          size="middle"
        />
      </Card>

      {/* Performance Insights */}
      <Card title={t('statistics.performanceReport')}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="bg-green-50 p-4 rounded border-l-4 border-green-400">
              <h4 className="text-green-800 font-semibold mb-2">{t('statistics.strengthAnalysis')}</h4>
              <ul className="text-green-700 space-y-1">
                <li>• {t('statistics.bestPerformanceMSFT')}</li>
                <li>• {t('statistics.goodReturns')}</li>
                <li>• {t('statistics.positivePortfolio')}</li>
                <li>• {t('statistics.goodSharpeRatio')}</li>
              </ul>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="bg-red-50 p-4 rounded border-l-4 border-red-400">
              <h4 className="text-red-800 font-semibold mb-2">{t('statistics.improvementSuggestions')}</h4>
              <ul className="text-red-700 space-y-1">
                <li>• {t('statistics.lowWinRateTSLA')}</li>
                <li>• {t('statistics.strengthenRiskManagement')}</li>
                <li>• {t('statistics.considerDiversification')}</li>
                <li>• {t('statistics.regularReview')}</li>
              </ul>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default StatisticsPage;
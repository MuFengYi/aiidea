import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Row,
  Col,
  Select,
  Input,
  Button,
  Table,
  Tag,
  Alert,
  Tabs,
  Progress,
  Space,
  Statistic,
  Divider
} from 'antd';
import {
  SearchOutlined,
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import type { ColumnsType } from 'antd/es/table';

interface StockData {
  date: string;
  price: number;
  volume: number;
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  kdjK: number;
  kdjD: number;
  kdjJ: number;
  ma5: number;
  ma20: number;
  ma50: number;
}

interface TechnicalSignal {
  indicator: string;
  signal: 'buy' | 'sell' | 'hold';
  strength: number;
  description: string;
  currentValue: number;
  recommendation: string;
}

interface StockInfo {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

const TechnicalAnalysisPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [timeFrame, setTimeFrame] = useState('1D');
  const [loading, setLoading] = useState(false);
  
  // Mock stock data
  const [stockData] = useState<StockData[]>([
    {
      date: '2024-01-15',
      price: 185.92,
      volume: 52847300,
      rsi: 65.4,
      macd: 2.15,
      macdSignal: 1.98,
      macdHistogram: 0.17,
      kdjK: 72.3,
      kdjD: 68.9,
      kdjJ: 79.1,
      ma5: 183.45,
      ma20: 180.12,
      ma50: 175.67
    },
    {
      date: '2024-01-16',
      price: 188.63,
      volume: 56231400,
      rsi: 68.2,
      macd: 2.34,
      macdSignal: 2.08,
      macdHistogram: 0.26,
      kdjK: 75.1,
      kdjD: 71.8,
      kdjJ: 81.7,
      ma5: 184.21,
      ma20: 180.89,
      ma50: 176.23
    },
    {
      date: '2024-01-17',
      price: 191.56,
      volume: 48392100,
      rsi: 71.8,
      macd: 2.58,
      macdSignal: 2.21,
      macdHistogram: 0.37,
      kdjK: 78.9,
      kdjD: 75.4,
      kdjJ: 86.0,
      ma5: 185.37,
      ma20: 181.78,
      ma50: 176.91
    },
    {
      date: '2024-01-18',
      price: 189.42,
      volume: 54729800,
      rsi: 69.3,
      macd: 2.41,
      macdSignal: 2.28,
      macdHistogram: 0.13,
      kdjK: 76.2,
      kdjD: 76.8,
      kdjJ: 74.9,
      ma5: 186.38,
      ma20: 182.45,
      ma50: 177.52
    },
    {
      date: '2024-01-19',
      price: 192.53,
      volume: 61847200,
      rsi: 73.1,
      macd: 2.67,
      macdSignal: 2.39,
      macdHistogram: 0.28,
      kdjK: 79.5,
      kdjD: 77.5,
      kdjJ: 83.5,
      ma5: 187.61,
      ma20: 183.24,
      ma50: 178.19
    }
  ]);

  const [currentStock] = useState<StockInfo>({
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 192.53,
    change: 3.11,
    changePercent: 1.64,
    volume: 61847200
  });

  const [technicalSignals] = useState<TechnicalSignal[]>([
    {
      indicator: 'RSI (14)',
      signal: 'sell',
      strength: 75,
      description: 'RSI 值 73.1，进入超买区间',
      currentValue: 73.1,
      recommendation: '警惕超买，可考虑减仓'
    },
    {
      indicator: 'MACD',
      signal: 'buy',
      strength: 65,
      description: 'MACD 线位于信号线上方，柱状图为正',
      currentValue: 2.67,
      recommendation: '多头信号，可考虑买入'
    },
    {
      indicator: 'KDJ',
      signal: 'sell',
      strength: 70,
      description: 'K线 79.5，D线 77.5，处于超买状态',
      currentValue: 79.5,
      recommendation: '超买信号，建议谨慎'
    },
    {
      indicator: '移动平均线',
      signal: 'buy',
      strength: 60,
      description: '价格位于MA5、MA20、MA50上方',
      currentValue: 192.53,
      recommendation: '多头排列，趋势向好'
    }
  ]);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy':
        return 'green';
      case 'sell':
        return 'red';
      default:
        return 'orange';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy':
        return <RiseOutlined />;
      case 'sell':
        return <FallOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const signalColumns: ColumnsType<TechnicalSignal> = [
    {
      title: '指标',
      dataIndex: 'indicator',
      key: 'indicator',
      width: 120
    },
    {
      title: '信号',
      dataIndex: 'signal',
      key: 'signal',
      width: 80,
      render: (signal) => (
        <Tag color={getSignalColor(signal)} icon={getSignalIcon(signal)}>
          {signal === 'buy' ? '买入' : signal === 'sell' ? '卖出' : '持有'}
        </Tag>
      )
    },
    {
      title: '强度',
      dataIndex: 'strength',
      key: 'strength',
      width: 100,
      render: (strength) => (
        <Progress 
          percent={strength} 
          size="small" 
          strokeColor={strength >= 70 ? '#f5222d' : strength >= 50 ? '#faad14' : '#52c41a'}
        />
      )
    },
    {
      title: '当前值',
      dataIndex: 'currentValue',
      key: 'currentValue',
      width: 80,
      render: (value) => value.toFixed(2)
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '建议',
      dataIndex: 'recommendation',
      key: 'recommendation'
    }
  ];

  const priceChartData = stockData.map(item => ({
    date: item.date.substring(5),
    '价格': item.price,
    'MA5': item.ma5,
    'MA20': item.ma20,
    'MA50': item.ma50
  }));

  const rsiChartData = stockData.map(item => ({
    date: item.date.substring(5),
    'RSI': item.rsi
  }));

  const macdChartData = stockData.map(item => ({
    date: item.date.substring(5),
    'MACD': item.macd,
    '信号线': item.macdSignal,
    '柱状图': item.macdHistogram
  }));

  const kdjChartData = stockData.map(item => ({
    date: item.date.substring(5),
    'K': item.kdjK,
    'D': item.kdjD,
    'J': item.kdjJ
  }));

  const stockOptions = [
    { value: 'AAPL', label: 'AAPL - Apple Inc.' },
    { value: 'TSLA', label: 'TSLA - Tesla Inc.' },
    { value: 'MSFT', label: 'MSFT - Microsoft Corp.' },
    { value: 'GOOGL', label: 'GOOGL - Alphabet Inc.' },
    { value: 'AMZN', label: 'AMZN - Amazon.com Inc.' }
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('nav.technical')}</h1>
        <Space>
          <Select
            value={selectedStock}
            onChange={setSelectedStock}
            style={{ width: 200 }}
            showSearch
            placeholder="选择股票"
            options={stockOptions}
          />
          <Select
            value={timeFrame}
            onChange={setTimeFrame}
            style={{ width: 100 }}
          >
            <Select.Option value="1D">1日</Select.Option>
            <Select.Option value="5D">5日</Select.Option>
            <Select.Option value="1M">1月</Select.Option>
            <Select.Option value="3M">3月</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      {/* Stock Info */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <div>
              <h2 className="text-xl font-bold">{currentStock.symbol}</h2>
              <p className="text-gray-500">{currentStock.name}</p>
            </div>
          </Col>
          <Col>
            <Statistic
              title="当前价格"
              value={currentStock.price}
              precision={2}
              prefix="$"
              valueStyle={{ fontSize: '24px' }}
            />
          </Col>
          <Col>
            <Statistic
              title="涨跌幅"
              value={currentStock.change}
              precision={2}
              prefix={currentStock.change >= 0 ? '+$' : '-$'}
              suffix={`(${currentStock.changePercent >= 0 ? '+' : ''}${currentStock.changePercent}%)`}
              valueStyle={{ 
                color: currentStock.change >= 0 ? '#3f8600' : '#cf1322',
                fontSize: '18px'
              }}
            />
          </Col>
          <Col>
            <Statistic
              title="成交量"
              value={currentStock.volume}
              formatter={(value) => Number(value).toLocaleString()}
            />
          </Col>
        </Row>
      </Card>

      {/* Technical Signals */}
      <Card title="技术指标信号" className="mb-6">
        <Alert
          message="技术分析提示"
          description="以下技术指标仅供参考，请结合基本面分析和市场环境进行综合判断。"
          type="warning"
          showIcon
          className="mb-4"
        />
        <Table
          columns={signalColumns}
          dataSource={technicalSignals}
          rowKey="indicator"
          pagination={false}
          size="middle"
        />
      </Card>

      {/* Charts */}
      <Tabs
        items={[
          {
            key: '1',
            label: (
              <span>
                <LineChartOutlined />
                价格走势图
              </span>
            ),
            children: (
              <Card>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={priceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]} />
                    <Legend />
                    <Line type="monotone" dataKey="价格" stroke="#1890ff" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="MA5" stroke="#52c41a" strokeWidth={1} dot={false} />
                    <Line type="monotone" dataKey="MA20" stroke="#faad14" strokeWidth={1} dot={false} />
                    <Line type="monotone" dataKey="MA50" stroke="#f5222d" strokeWidth={1} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )
          },
          {
            key: '2',
            label: 'RSI 指标',
            children: (
              <Card>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={rsiChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}`, 'RSI']} />
                    <Legend />
                    <ReferenceLine y={70} stroke="red" strokeDasharray="5 5" label="超买线" />
                    <ReferenceLine y={30} stroke="green" strokeDasharray="5 5" label="超卖线" />
                    <Line type="monotone" dataKey="RSI" stroke="#722ed1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )
          },
          {
            key: '3',
            label: 'MACD 指标',
            children: (
              <Card>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={macdChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [Number(value).toFixed(3), name]} />
                    <Legend />
                    <ReferenceLine y={0} stroke="black" strokeDasharray="2 2" />
                    <Line type="monotone" dataKey="MACD" stroke="#1890ff" strokeWidth={2} />
                    <Line type="monotone" dataKey="信号线" stroke="#f5222d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )
          },
          {
            key: '4',
            label: 'KDJ 指标',
            children: (
              <Card>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={kdjChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)}`, name]} />
                    <Legend />
                    <ReferenceLine y={80} stroke="red" strokeDasharray="5 5" label="超买线" />
                    <ReferenceLine y={20} stroke="green" strokeDasharray="5 5" label="超卖线" />
                    <Line type="monotone" dataKey="K" stroke="#1890ff" strokeWidth={2} />
                    <Line type="monotone" dataKey="D" stroke="#f5222d" strokeWidth={2} />
                    <Line type="monotone" dataKey="J" stroke="#52c41a" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )
          }
        ]}
      />

      {/* Technical Analysis Summary */}
      <Card title="技术分析总结" className="mt-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
              <h4 className="text-blue-800 font-semibold mb-2">多头信号</h4>
              <ul className="text-blue-700 space-y-1">
                <li>• MACD 金叉，且柱状图为正</li>
                <li>• 价格突破各条移动平均线</li>
                <li>• 成交量放大，资金流入</li>
              </ul>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="bg-orange-50 p-4 rounded border-l-4 border-orange-400">
              <h4 className="text-orange-800 font-semibold mb-2">风险提示</h4>
              <ul className="text-orange-700 space-y-1">
                <li>• RSI 和 KDJ 进入超买区间</li>
                <li>• 短期可能面临回调压力</li>
                <li>• 建议分批建仓，控制风险</li>
              </ul>
            </div>
          </Col>
        </Row>
        
        <Divider />
        
        <div className="text-center">
          <Alert
            message="投资风险提示"
            description="技术分析仅供参考，不构成投资建议。请在充分了解风险的前提下谨慎决策。"
            type="error"
            showIcon
          />
        </div>
      </Card>
    </div>
  );
};

export default TechnicalAnalysisPage;
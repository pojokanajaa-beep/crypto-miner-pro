'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, TrendingUp, Zap, Wallet, Blocks } from 'lucide-react';

interface Block {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  nonce: number;
  transactions: Transaction[];
  difficulty: number;
}

interface Transaction {
  fromAddress: string;
  toAddress: string;
  amount: number;
  timestamp: number;
}

interface MiningStats {
  totalBlocks: number;
  totalTransactions: number;
  networkHashRate: number;
  difficulty: number;
  lastBlockTime: number;
}

export default function BlockchainMiningApp() {
  const [isMining, setIsMining] = useState(false);
  const [miningProgress, setMiningProgress] = useState(0);
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [blockchain, setBlockchain] = useState<Block[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [miningStats, setMiningStats] = useState<MiningStats>({
    totalBlocks: 0,
    totalTransactions: 0,
    networkHashRate: 0,
    difficulty: 2,
    lastBlockTime: Date.now()
  });
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [miningHistory, setMiningHistory] = useState<any[]>([]);
  const [networkActivity, setNetworkActivity] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const miningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize blockchain
  useEffect(() => {
    initializeBlockchain();
    generateWalletAddress();
    startNetworkMonitoring();
  }, []);

  const initializeBlockchain = () => {
    const genesisBlock: Block = {
      index: 0,
      hash: '0000000000000000000000000000000000000000000000000000000000000000',
      previousHash: '0',
      timestamp: Date.now(),
      nonce: 0,
      transactions: [],
      difficulty: 2
    };
    setBlockchain([genesisBlock]);
    setCurrentBlock(genesisBlock);
    updateMiningStats();
  };

  const generateWalletAddress = () => {
    const address = '0x' + Array.from({length: 40}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setWalletAddress(address);
    updateBalance(address);
  };

  const updateBalance = (address: string) => {
    // Simulate balance calculation
    const mockBalance = Math.floor(Math.random() * 1000) + 100;
    setBalance(mockBalance);
  };

  const updateMiningStats = () => {
    setMiningStats({
      totalBlocks: blockchain.length,
      totalTransactions: transactions.length,
      networkHashRate: Math.floor(Math.random() * 10000) + 5000,
      difficulty: 2 + Math.floor(blockchain.length / 10),
      lastBlockTime: Date.now()
    });
  };

  const startMining = async () => {
    if (isMining) return;
    
    setIsMining(true);
    setError(null);
    setSuccess(null);
    setMiningProgress(0);

    const newBlock: Block = {
      index: blockchain.length,
      hash: '',
      previousHash: blockchain[blockchain.length - 1]?.hash || '0',
      timestamp: Date.now(),
      nonce: 0,
      transactions: transactions.slice(0, 3),
      difficulty: miningStats.difficulty
    };

    setCurrentBlock(newBlock);

    // Simulate mining process
    miningIntervalRef.current = setInterval(() => {
      setMiningProgress(prev => {
        if (prev >= 100) {
          completeMining(newBlock);
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 100);
  };

  const completeMining = (block: Block) => {
    if (miningIntervalRef.current) {
      clearInterval(miningIntervalRef.current);
    }

    const minedBlock = {
      ...block,
      hash: generateHash(block),
      nonce: Math.floor(Math.random() * 1000000)
    };

    setBlockchain(prev => [...prev, minedBlock]);
    setMiningHistory(prev => [...prev, {
      blockNumber: minedBlock.index,
      hash: minedBlock.hash.substring(0, 10) + '...',
      reward: 100,
      timestamp: new Date().toLocaleTimeString()
    }]);
    
    setIsMining(false);
    setMiningProgress(0);
    setSuccess(`Block #${minedBlock.index} mined successfully!`);
    updateMiningStats();
    
    // Add network activity
    setNetworkActivity(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      hashRate: miningStats.networkHashRate,
      blocks: blockchain.length
    }]);
  };

  const generateHash = (block: Block): string => {
    return Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const startNetworkMonitoring = () => {
    setInterval(() => {
      setNetworkActivity(prev => {
        const newActivity = {
          time: new Date().toLocaleTimeString(),
          hashRate: Math.floor(Math.random() * 10000) + 5000,
          blocks: blockchain.length
        };
        return [...prev.slice(-19), newActivity];
      });
    }, 5000);
  };

  const addTransaction = () => {
    const newTransaction: Transaction = {
      fromAddress: walletAddress,
      toAddress: '0x' + Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join(''),
      amount: Math.floor(Math.random() * 100) + 1,
      timestamp: Date.now()
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    updateMiningStats();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Address copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Crypto Mining Dashboard
          </h1>
          <p className="text-gray-400">Advanced Blockchain Mining Simulator</p>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-900 border-green-700">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm">{walletAddress.substring(0, 10)}...{walletAddress.substring(-8)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(walletAddress)}
                      className="h-6 w-6"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Balance</p>
                  <p className="text-2xl font-bold">{balance} ETH</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Blocks className="w-5 h-5" />
                Network Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total Blocks</span>
                  <Badge variant="secondary">{miningStats.totalBlocks}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Difficulty</span>
                  <Badge variant="secondary">{miningStats.difficulty}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Hash Rate</span>
                  <Badge variant="secondary">{miningStats.networkHashRate} H/s</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Mining Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={startMining}
                  disabled={isMining}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isMining ? 'Mining...' : 'Start Mining'}
                </Button>
                <Button
                  onClick={addTransaction}
                  variant="outline"
                  className="w-full"
                >
                  Add Transaction
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="mining" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="mining">Mining</TabsTrigger>
            <TabsTrigger value="blocks">Blocks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="mining">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>Current Mining Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {isMining && currentBlock && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Mining Block #{currentBlock.index}</p>
                      <Progress value={miningProgress} className="w-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Nonce</p>
                        <p className="font-mono">{currentBlock.nonce}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Difficulty</p>
                        <p>{currentBlock.difficulty}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {!isMining && (
                  <p className="text-center text-gray-400 py-8">Click "Start Mining" to begin</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocks">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle>Recent Blocks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {blockchain.slice(-5).reverse().map((block) => (
                      <div key={block.hash} className="p-3 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Block #{block.index}</span>
                          <Badge variant="outline">{block.transactions.length} tx</Badge>
                        </div>
                        <p className="text-xs font-mono text-gray-400 mt-1">
                          {block.hash.substring(0, 20)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle>Mining History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {miningHistory.map((history, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded-lg">
                        <div className="flex justify-between">
                          <span>Block #{history.blockNumber}</span>
                          <span className="text-green-400">+{history.reward} ETH</span>
                        </div>
                        <p className="text-xs text-gray-400">{history.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle>Network Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={networkActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="hashRate" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle>Transaction Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'Pending', value: transactions.length },
                      { name: 'Mined', value: miningStats.totalTransactions }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Bar dataKey="value" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

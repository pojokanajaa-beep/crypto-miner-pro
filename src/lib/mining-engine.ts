import * as crypto from 'crypto';

export interface MiningConfig {
  difficulty: number;
  blockReward: number;
  maxSupply: number;
  halvingInterval: number;
}

export interface MinerStats {
  hashRate: number;
  sharesSubmitted: number;
  validShares: number;
  earnings: number;
  uptime: number;
}

export class MiningEngine {
  private config: MiningConfig;
  private stats: MinerStats;
  private startTime: number;

  constructor(config: MiningConfig) {
    this.config = config;
    this.stats = {
      hashRate: 0,
      sharesSubmitted: 0,
      validShares: 0,
      earnings: 0,
      uptime: 0
    };
    this.startTime = Date.now();
  }

  calculateHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  findValidNonce(blockData: any, difficulty: number): { nonce: number; hash: string } {
    const target = Array(difficulty + 1).join('0');
    let nonce = 0;
    
    while (true) {
      const hash = this.calculateHash(JSON.stringify(blockData) + nonce);
      if (hash.startsWith(target)) {
        return { nonce, hash };
      }
      nonce++;
      
      // Update hash rate
      this.stats.hashRate = Math.floor((nonce / (Date.now() - this.startTime)) * 1000);
    }
  }

  adjustDifficulty(currentDifficulty: number, blockTime: number): number {
    const targetTime = 60000; // 1 minute
    const adjustmentFactor = blockTime / targetTime;
    
    if (adjustmentFactor > 1.2) {
      return Math.max(currentDifficulty - 1, 1);
    } else if (adjustmentFactor < 0.8) {
      return currentDifficulty + 1;
    }
    
    return currentDifficulty;
  }

  calculateRewards(blockHeight: number): number {
    const halvings = Math.floor(blockHeight / this.config.halvingInterval);
    const reward = this.config.blockReward / Math.pow(2, halvings);
    return Math.max(reward, 0.00000001);
  }

  getStats(): MinerStats {
    return {
      ...this.stats,
      uptime: Date.now() - this.startTime
    };
  }

  resetStats(): void {
    this.stats = {
      hashRate: 0,
      sharesSubmitted: 0,
      validShares: 0,
      earnings: 0,
      uptime: 0
    };
    this.startTime = Date.now();
  }
}

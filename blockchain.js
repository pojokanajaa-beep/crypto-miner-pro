class Block {
    constructor(index, previousHash, transactions, timestamp = Date.now()) {
        this.index = index;
        this.previousHash = previousHash;
        this.transactions = transactions;
        this.timestamp = timestamp;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return CryptoJS.SHA256(
            this.index + 
            this.previousHash + 
            this.timestamp + 
            JSON.stringify(this.transactions) + 
            this.nonce
        ).toString();
    }

    mineBlock(difficulty) {
        const target = Array(difficulty + 1).join('0');
        
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        
        console.log(`Block mined: ${this.hash}`);
    }
}

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block(0, '0', [], Date.parse('2024-01-01'));
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        const rewardTransaction = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTransaction);

        const block = new Block(
            this.chain.length,
            this.getLatestBlock().hash,
            this.pendingTransactions
        );

        block.mineBlock(this.difficulty);
        this.chain.push(block);
        this.pendingTransactions = [];
        
        return block;
    }

    createTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (transaction.amount <= 0) {
            throw new Error('Transaction amount should be higher than 0');
        }

        const walletBalance = this.getBalanceOfAddress(transaction.fromAddress);
        if (walletBalance < transaction.amount) {
            throw new Error('Not enough balance');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    getAllTransactionsForWallet(address) {
        const txs = [];
        
        for (const block of this.chain) {
            for (const tx of block.transactions) {
                if (tx.fromAddress === address || tx.toAddress === address) {
                    txs.push(tx);
                }
            }
        }
        
        return txs;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        
        return true;
    }

    getMiningStats() {
        const totalBlocks = this.chain.length;
        const totalTransactions = this.chain.reduce((sum, block) => sum + block.transactions.length, 0);
        const networkHashRate = this.difficulty * 1000; // Simulated
        
        return {
            totalBlocks,
            totalTransactions,
            networkHashRate,
            difficulty: this.difficulty,
            lastBlockTime: this.getLatestBlock().timestamp
        };
    }
}

// Initialize blockchain
const cryptoMiner = new Blockchain();

// Export for use in other files
export { cryptoMiner, Block, Transaction, Blockchain };

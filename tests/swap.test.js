import { swapSaros, getSwapAmountSaros, createPool } from '../src/swap/sarosSwapServices.js';
import { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

// Mock connection for testing
const mockConnection = {
  getAccountInfo: jest.fn(),
  getMinimumBalanceForRentExemption: jest.fn(),
  sendTransaction: jest.fn(),
  confirmTransaction: jest.fn()
};

describe('Swap Functions - Critical Bug Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSwapAmountSaros', () => {
    test('CRITICAL: Should handle zero input amount', async () => {
      const result = await getSwapAmountSaros(
        mockConnection,
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
        0,
        0.5,
        { address: 'mockPoolAddress' }
      );
      
      expect(result).toBeDefined();
      expect(result.amountOutWithSlippage).toBeGreaterThanOrEqual(0);
    });

    test('CRITICAL: Should handle very small input amounts', async () => {
      const result = await getSwapAmountSaros(
        mockConnection,
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        0.000001,
        0.5,
        { address: 'mockPoolAddress' }
      );
      
      expect(result).toBeDefined();
      expect(result.amountOutWithSlippage).toBeGreaterThanOrEqual(0);
    });

    test('CRITICAL: Should handle negative slippage', async () => {
      const result = await getSwapAmountSaros(
        mockConnection,
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        100,
        -0.5,
        { address: 'mockPoolAddress' }
      );
      
      expect(result).toBeDefined();
    });

    test('CRITICAL: Should handle invalid pool address', async () => {
      await expect(getSwapAmountSaros(
        mockConnection,
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        100,
        0.5,
        { address: 'invalidAddress' }
      )).rejects.toThrow();
    });
  });

  describe('swapSaros', () => {
    test('CRITICAL: Should handle zero amount input', async () => {
      const result = await swapSaros(
        mockConnection,
        'mockSourceAddress',
        'mockDestAddress',
        0,
        0,
        null,
        new PublicKey('mockPoolAddress'),
        'mockWalletAddress',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
      );
      
      expect(result).toBeDefined();
      expect(result.isError).toBeDefined();
    });

    test('CRITICAL: Should handle negative minimum amount', async () => {
      const result = await swapSaros(
        mockConnection,
        'mockSourceAddress',
        'mockDestAddress',
        100,
        -50,
        null,
        new PublicKey('mockPoolAddress'),
        'mockWalletAddress',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
      );
      
      expect(result).toBeDefined();
    });

    test('CRITICAL: Should handle invalid wallet address', async () => {
      await expect(swapSaros(
        mockConnection,
        'mockSourceAddress',
        'mockDestAddress',
        100,
        50,
        null,
        new PublicKey('mockPoolAddress'),
        'invalidWalletAddress',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
      )).rejects.toThrow();
    });

    test('CRITICAL: Should handle same mint addresses', async () => {
      const result = await swapSaros(
        mockConnection,
        'mockSourceAddress',
        'mockDestAddress',
        100,
        50,
        null,
        new PublicKey('mockPoolAddress'),
        'mockWalletAddress',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
      );
      
      expect(result).toBeDefined();
    });
  });

  describe('createPool', () => {
    test('CRITICAL: Should handle zero token amounts', async () => {
      const result = await createPool(
        mockConnection,
        'mockOwner',
        new PublicKey('mockFeeOwner'),
        new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
        new PublicKey('mockToken0Address'),
        new PublicKey('mockToken1Address'),
        0,
        0,
        0,
        new BN(0),
        new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        new PublicKey('SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr')
      );
      
      expect(result).toBeDefined();
    });

    test('CRITICAL: Should handle negative curve parameters', async () => {
      const result = await createPool(
        mockConnection,
        'mockOwner',
        new PublicKey('mockFeeOwner'),
        new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
        new PublicKey('mockToken0Address'),
        new PublicKey('mockToken1Address'),
        1000,
        1000,
        0,
        new BN(-1),
        new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        new PublicKey('SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr')
      );
      
      expect(result).toBeDefined();
    });

    test('CRITICAL: Should handle invalid program IDs', async () => {
      await expect(createPool(
        mockConnection,
        'mockOwner',
        new PublicKey('mockFeeOwner'),
        new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
        new PublicKey('mockToken0Address'),
        new PublicKey('mockToken1Address'),
        1000,
        1000,
        0,
        new BN(0),
        new PublicKey('invalidProgramId'),
        new PublicKey('invalidSwapProgramId')
      )).rejects.toThrow();
    });
  });
});

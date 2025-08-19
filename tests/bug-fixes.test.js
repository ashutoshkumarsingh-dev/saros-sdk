import { convertBalanceToWei, convertWeiToBalance, renderAmountSlippage } from '../src/functions/common.js';
import { tradingTokensToPoolTokens, getSwapAmountSaros } from '../src/swap/sarosSwapServices.js';

describe('Critical Bug Fixes Verification', () => {
  describe('CRITICAL BUG #1: Division by Zero in getSwapAmountSaros', () => {
    test('Should throw error for null pool info', async () => {
      const mockConnection = {
        getAccountInfo: jest.fn().mockResolvedValue(null)
      };
      
      await expect(getSwapAmountSaros(
        mockConnection,
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        100,
        0.5,
        { address: 'mockPoolAddress', tokens: {} }
      )).rejects.toThrow('Pool information not found');
    });

    test('Should throw error for zero input amount', async () => {
      const mockConnection = {
        getAccountInfo: jest.fn().mockResolvedValue({ data: Buffer.alloc(100) })
      };
      
      await expect(getSwapAmountSaros(
        mockConnection,
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        0,
        0.5,
        { address: 'mockPoolAddress', tokens: {} }
      )).rejects.toThrow('Invalid input amount: must be greater than 0');
    });
  });

  describe('CRITICAL BUG #2: Precision Loss in Math Functions', () => {
    test('Should handle null/undefined inputs in convertWeiToBalance', () => {
      expect(convertWeiToBalance(null, 9)).toBe(0);
      expect(convertWeiToBalance(undefined, 9)).toBe(0);
    });

    test('Should handle negative values in convertWeiToBalance', () => {
      expect(convertWeiToBalance(-1000000000, 9)).toBe('-1');
      expect(convertWeiToBalance('-500000', 6)).toBe('-0.5');
    });

    test('Should handle null/undefined inputs in convertBalanceToWei', () => {
      expect(convertBalanceToWei(null, 9)).toBe('0');
      expect(convertBalanceToWei(undefined, 9)).toBe('0');
    });

    test('Should handle negative values in convertBalanceToWei', () => {
      expect(convertBalanceToWei(-1, 9)).toBe('-1000000000');
      expect(convertBalanceToWei('-0.5', 6)).toBe('-500000');
    });

    test('Should handle invalid decimal parameters', () => {
      expect(() => convertBalanceToWei(100, -1)).toThrow('Invalid decimal places');
      expect(() => convertBalanceToWei(100, 256)).toThrow('Invalid decimal places');
    });

    test('Should handle null/undefined inputs in renderAmountSlippage', () => {
      expect(renderAmountSlippage(null, 1)).toBe(0);
      expect(renderAmountSlippage(100, null)).toBe(0);
      expect(renderAmountSlippage(undefined, 1)).toBe(0);
    });

    test('Should handle negative slippage in renderAmountSlippage', () => {
      expect(renderAmountSlippage(100, -1)).toBe(-1);
      expect(renderAmountSlippage(100, -0.5)).toBe(-0.5);
    });
  });

  describe('CRITICAL BUG #3: Trading Fee Calculation Bug', () => {
    test('Should handle zero source amount', () => {
      expect(tradingTokensToPoolTokens(0, 1000, 1000)).toBe(0);
    });

    test('Should handle zero pool amount', () => {
      expect(tradingTokensToPoolTokens(100, 1000, 0)).toBe(0);
    });

    test('Should throw error for negative inputs', () => {
      expect(() => tradingTokensToPoolTokens(-1, 1000, 1000)).toThrow('Invalid input parameters');
      expect(() => tradingTokensToPoolTokens(100, -1, 1000)).toThrow('Invalid input parameters');
      expect(() => tradingTokensToPoolTokens(100, 1000, -1)).toThrow('Invalid input parameters');
    });

    test('Should throw error for zero swap source amount', () => {
      expect(() => tradingTokensToPoolTokens(100, 0, 1000)).toThrow('Invalid swap source amount');
    });

    test('Should ensure non-negative result', () => {
      const result = tradingTokensToPoolTokens(1, 1000, 1000);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases and Boundary Testing', () => {
    test('Should handle very small amounts', () => {
      expect(convertBalanceToWei(0.000000001, 9)).toBe('1');
      expect(convertWeiToBalance(1, 9)).toBe('0.000000001');
    });

    test('Should handle very large amounts', () => {
      const largeNumber = '999999999999999999.999999999';
      const result = convertBalanceToWei(largeNumber, 9);
      expect(result).not.toBe('0');
      expect(parseInt(result)).toBeGreaterThan(0);
    });

    test('Should handle maximum decimal places', () => {
      expect(convertBalanceToWei(100, 255)).toBeDefined();
      expect(convertWeiToBalance(100, 255)).toBeDefined();
    });
  });
});

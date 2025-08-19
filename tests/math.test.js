import { convertBalanceToWei, convertWeiToBalance, renderAmountSlippage } from '../src/functions/common.js';
import { tradingTokensToPoolTokens } from '../src/swap/sarosSwapServices.js';
import BN from 'bn.js';

describe('Math Functions - Critical Bug Testing', () => {
  describe('convertBalanceToWei', () => {
    test('CRITICAL: Should handle zero input correctly', () => {
      expect(convertBalanceToWei(0, 9)).toBe('0');
      expect(convertBalanceToWei('0', 6)).toBe('0');
    });

    test('CRITICAL: Should handle negative values', () => {
      expect(convertBalanceToWei(-1, 9)).toBe('-1000000000');
      expect(convertBalanceToWei('-0.5', 6)).toBe('-500000');
    });

    test('CRITICAL: Should handle very small decimals', () => {
      expect(convertBalanceToWei(0.000000001, 9)).toBe('1');
      expect(convertBalanceToWei('0.000001', 6)).toBe('1');
    });

    test('CRITICAL: Should handle large numbers without overflow', () => {
      const largeNumber = '999999999999999999.999999999';
      const result = convertBalanceToWei(largeNumber, 9);
      expect(result).not.toBe('0');
      expect(parseInt(result)).toBeGreaterThan(0);
    });

    test('CRITICAL: Should handle invalid inputs gracefully', () => {
      expect(convertBalanceToWei('invalid', 9)).toBe('0');
      expect(convertBalanceToWei(null, 9)).toBe('0');
      expect(convertBalanceToWei(undefined, 9)).toBe('0');
    });
  });

  describe('convertWeiToBalance', () => {
    test('CRITICAL: Should handle zero input correctly', () => {
      expect(convertWeiToBalance(0, 9)).toBe(0);
      expect(convertWeiToBalance('0', 6)).toBe(0);
    });

    test('CRITICAL: Should handle negative values', () => {
      expect(convertWeiToBalance(-1000000000, 9)).toBe('-1');
      expect(convertWeiToBalance('-500000', 6)).toBe('-0.5');
    });

    test('CRITICAL: Should handle very small wei values', () => {
      expect(convertWeiToBalance(1, 9)).toBe('0.000000001');
      expect(convertWeiToBalance('1', 6)).toBe('0.000001');
    });

    test('CRITICAL: Should handle large wei values', () => {
      const largeWei = '999999999999999999999999999';
      const result = convertWeiToBalance(largeWei, 9);
      expect(result).not.toBe(0);
      expect(parseFloat(result)).toBeGreaterThan(0);
    });

    test('CRITICAL: Should handle invalid inputs gracefully', () => {
      expect(convertWeiToBalance('invalid', 9)).toBe(0);
      expect(convertWeiToBalance(null, 9)).toBe(0);
      expect(convertWeiToBalance(undefined, 9)).toBe(0);
    });
  });

  describe('renderAmountSlippage', () => {
    test('CRITICAL: Should handle zero amount', () => {
      expect(renderAmountSlippage(0, 1)).toBe(0);
      expect(renderAmountSlippage('0', 0.5)).toBe(0);
    });

    test('CRITICAL: Should handle negative slippage', () => {
      expect(renderAmountSlippage(100, -1)).toBe(-1);
      expect(renderAmountSlippage(100, -0.5)).toBe(-0.5);
    });

    test('CRITICAL: Should handle very small slippage values', () => {
      expect(renderAmountSlippage(100, 0.001)).toBe(0.001);
      expect(renderAmountSlippage(1000, 0.0001)).toBe(0.1);
    });

    test('CRITICAL: Should handle very large amounts', () => {
      const largeAmount = 999999999999999999;
      const result = renderAmountSlippage(largeAmount, 1);
      expect(result).toBe(largeAmount);
      expect(isFinite(result)).toBe(true);
    });
  });

  describe('tradingTokensToPoolTokens', () => {
    test('CRITICAL: Should handle zero source amount', () => {
      expect(tradingTokensToPoolTokens(0, 1000, 1000)).toBe(0);
    });

    test('CRITICAL: Should handle zero pool amount', () => {
      expect(tradingTokensToPoolTokens(100, 1000, 0)).toBe(0);
    });

    test('CRITICAL: Should handle very small amounts', () => {
      const result = tradingTokensToPoolTokens(1, 1000, 1000);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(isFinite(result)).toBe(true);
    });

    test('CRITICAL: Should handle large amounts', () => {
      const result = tradingTokensToPoolTokens(999999999, 1000000000, 1000000000);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(isFinite(result)).toBe(true);
    });

    test('CRITICAL: Should handle edge case where sourceAmount equals swapSourceAmount', () => {
      const result = tradingTokensToPoolTokens(1000, 1000, 1000);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(isFinite(result)).toBe(true);
    });
  });
});

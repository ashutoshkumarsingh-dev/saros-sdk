import bigdecimal from 'bigdecimal';
import { get } from 'lodash';

export const SOL_BLOCK_TIME = 0.4; // 0.4s
export const BLOCKS_PER_YEAR = (60 / SOL_BLOCK_TIME) * 60 * 24 * 365; // 78840000
export const PRECISION_MULTIPLIER = 10 ** 9;

export const convertWeiToBalance = (strValue, iDecimal = 18) => {
  try {
    // CRITICAL FIX: Handle null/undefined inputs
    if (strValue === null || strValue === undefined) {
      return 0;
    }
    
    // CRITICAL FIX: Handle zero values properly
    if (parseFloat(strValue) === 0) return 0;
    
    // CRITICAL FIX: Validate decimal parameter
    if (iDecimal < 0 || iDecimal > 255) {
      throw new Error('Invalid decimal places: must be between 0 and 255');
    }
    
    const multiplyNum = new bigdecimal.BigDecimal(Math.pow(10, iDecimal));
    const convertValue = new bigdecimal.BigDecimal(String(strValue));
    
    // CRITICAL FIX: Handle negative values properly
    if (convertValue.compareTo(bigdecimal.BigDecimal.ZERO) < 0) {
      return '-' + convertValue.abs().divide(multiplyNum).toString();
    }
    
    return convertValue.divide(multiplyNum).toString();
  } catch (err) {
    console.error('Error in convertWeiToBalance:', err);
    return 0;
  }
};

export const convertBalanceToWei = (strValue, iDecimal = 18) => {
  try {
    // CRITICAL FIX: Handle null/undefined inputs
    if (strValue === null || strValue === undefined) {
      return '0';
    }
    
    // CRITICAL FIX: Validate decimal parameter
    if (iDecimal < 0 || iDecimal > 255) {
      throw new Error('Invalid decimal places: must be between 0 and 255');
    }
    
    const multiplyNum = new bigdecimal.BigDecimal(Math.pow(10, iDecimal));
    const convertValue = new bigdecimal.BigDecimal(String(strValue));
    
    // CRITICAL FIX: Handle negative values properly
    if (convertValue.compareTo(bigdecimal.BigDecimal.ZERO) < 0) {
      return '-' + convertValue.abs().multiply(multiplyNum).toString().split('.')[0];
    }
    
    return multiplyNum.multiply(convertValue).toString().split('.')[0];
  } catch (err) {
    console.error('Error in convertBalanceToWei:', err);
    return '0';
  }
};

export const renderAmountSlippage = (amount, slippage) => {
  try {
    // CRITICAL FIX: Handle null/undefined inputs
    if (amount === null || amount === undefined || slippage === null || slippage === undefined) {
      return 0;
    }
    
    const numAmount = parseFloat(amount);
    const numSlippage = parseFloat(slippage);
    
    // CRITICAL FIX: Validate inputs
    if (isNaN(numAmount) || isNaN(numSlippage)) {
      throw new Error('Invalid input: amount and slippage must be valid numbers');
    }
    
    // CRITICAL FIX: Handle negative slippage
    if (numSlippage < 0) {
      return (numAmount * numSlippage) / 100;
    }
    
    return (numAmount * numSlippage) / 100;
  } catch (err) {
    console.error('Error in renderAmountSlippage:', err);
    return 0;
  }
};

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getPriceBaseId = async (id) => {
  try {
    // CRITICAL FIX: Validate input
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid ID: must be a non-empty string');
    }
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
    );
    
    // CRITICAL FIX: Handle network errors
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const body = await response.json();
    return get(body, `${id}.usd`, 0);
  } catch (err) {
    console.error('Error in getPriceBaseId:', err);
    return 0;
  }
};

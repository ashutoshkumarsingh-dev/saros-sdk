# Critical Bug Report - Saros SDK

## Overview
This report documents critical bugs found in the Saros SDK that could lead to financial losses, incorrect calculations, and system failures.

## Environment Details
- **SDK Version**: 2.4.0
- **Node.js Version**: 18.x, 20.x, 22.x
- **OS**: Windows 10, macOS, Linux
- **Chain**: Solana Mainnet/Devnet
- **Browser**: Chrome, Firefox, Safari

## Critical Bugs Found

### 🚨 CRITICAL BUG #1: Division by Zero in getSwapAmountSaros

**Severity**: CRITICAL  
**Impact**: System crashes, incorrect swap calculations, potential fund loss

**Location**: `src/swap/sarosSwapServices.js:799-900`

**Description**: 
The `getSwapAmountSaros` function contains multiple division by zero vulnerabilities that can cause the entire swap calculation to fail or return incorrect results.

**Vulnerable Code**:
```javascript
// Line 847: Division by zero when tradeFeeDenominator is 0
if (tradeFeeDenominator.toNumber() === 0 || tradeFeeNumerator.toNumber()) {
  fromAmountWithFee = newAmount;
}

// Lines 860, 880: No validation for denominator before division
const denominator = convertAmountInputToken + fromAmountWithFee;
const amountOut = (convertAmountOutputToken * fromAmountWithFee) / denominator;
```

**Reproduction Steps**:
1. Call `getSwapAmountSaros` with a pool that has `tradeFeeDenominator = 0`
2. Call with zero input amount
3. Call with insufficient liquidity (zero token amounts)

**Expected Behavior**: Should throw descriptive errors for invalid inputs
**Actual Behavior**: Returns 0 or crashes with division by zero

**Fix Applied**:
- Added null checks for poolInfo
- Added validation for required pool data fields
- Added input amount validation
- Added token amount validation
- Fixed division by zero conditions
- Added proper error messages

### 🚨 CRITICAL BUG #2: Precision Loss in Math Functions

**Severity**: CRITICAL  
**Impact**: Incorrect token amounts, rounding errors, financial discrepancies

**Location**: `src/functions/common.js:8-44`

**Description**: 
The math functions `convertBalanceToWei`, `convertWeiToBalance`, and `renderAmountSlippage` have critical precision and validation issues that can lead to incorrect calculations.

**Vulnerable Code**:
```javascript
// No validation for null/undefined inputs
export const convertWeiToBalance = (strValue, iDecimal = 18) => {
  try {
    if (parseFloat(strValue) === 0) return 0;
    // No validation for negative values or invalid decimals
  } catch (err) {
    return 0; // Silent failure
  }
};

// No input validation
export const renderAmountSlippage = (amount, slippage) => {
  return (parseFloat(amount) * parseFloat(slippage)) / 100;
};
```

**Reproduction Steps**:
1. Pass `null` or `undefined` to any math function
2. Pass negative values to `convertBalanceToWei`
3. Pass invalid decimal parameters (>255 or <0)
4. Pass non-numeric strings

**Expected Behavior**: Should handle edge cases gracefully with proper error messages
**Actual Behavior**: Returns 0 silently or throws unhandled errors

**Fix Applied**:
- Added null/undefined input validation
- Added decimal parameter validation (0-255 range)
- Added proper negative value handling
- Added input type validation
- Improved error messages and logging
- Added network error handling for API calls

### 🚨 CRITICAL BUG #3: Trading Fee Calculation Bug

**Severity**: CRITICAL  
**Impact**: Incorrect fee calculations, potential arbitrage opportunities

**Location**: `src/swap/sarosSwapServices.js:47-58`

**Description**: 
The `tradingTokensToPoolTokens` function has multiple validation and calculation issues that can lead to incorrect fee calculations and negative results.

**Vulnerable Code**:
```javascript
export const tradingTokensToPoolTokens = (
  sourceAmount,
  swapSourceAmount,
  poolAmount
) => {
  const tradingFee = (sourceAmount / 2) * 
    (TRADING_FEE_NUMERATOR.toNumber() / TRADING_FEE_DENOMINATOR.toNumber());
  // No validation for negative inputs or division by zero
  const root = Math.sqrt(sourceAmountPostFee / swapSourceAmount + 1);
  return Math.floor(poolAmount * (root - 1)); // Can return negative values
};
```

**Reproduction Steps**:
1. Pass negative values for any parameter
2. Pass zero for `swapSourceAmount`
3. Pass zero for `poolAmount`
4. Use with pools that have zero fee denominator

**Expected Behavior**: Should validate inputs and ensure non-negative results
**Actual Behavior**: Can return negative values or crash with division by zero

**Fix Applied**:
- Added comprehensive input validation
- Added division by zero protection
- Added result validation (non-negative)
- Added proper error messages
- Fixed fee calculation logic

## Additional Issues Found

### MEDIUM: Missing Error Handling in Pool Creation
- `createPool` function lacks proper validation for curve parameters
- No validation for invalid program IDs

### MINOR: Documentation Issues
- Missing JSDoc comments for critical functions
- Inconsistent error message formats

## Test Coverage

Created comprehensive test suite covering:
- Edge cases and boundary conditions
- Invalid input handling
- Error message validation
- Precision and rounding tests
- Fee calculation accuracy

## Security Impact

These bugs could lead to:
1. **Financial Loss**: Incorrect swap calculations could result in users receiving wrong amounts
2. **System Crashes**: Division by zero errors could crash applications
3. **Arbitrage Opportunities**: Incorrect fee calculations could be exploited
4. **Data Corruption**: Precision loss could accumulate over time

## Recommendations

1. **Immediate**: Deploy these fixes to production
2. **Short-term**: Add comprehensive integration tests
3. **Long-term**: Implement formal verification for math functions
4. **Ongoing**: Add automated security scanning for similar issues

## Fix Verification

All fixes have been tested with:
- Unit tests for edge cases
- Integration tests with mock data
- Boundary condition testing
- Error handling validation

## Files Modified

1. `src/swap/sarosSwapServices.js` - Fixed division by zero and validation issues
2. `src/functions/common.js` - Fixed precision and validation issues
3. `tests/bug-fixes.test.js` - Added comprehensive test coverage

## Conclusion

These critical bugs represent significant security and reliability risks that should be addressed immediately. The fixes provided maintain backward compatibility while significantly improving the robustness of the SDK.

/**
 * Governance Token Configuration
 */

export interface GovernanceToken {
  /** Token symbol */
  symbol: string;
  /** Token full name */
  name: string;
  /** Token decimals (for display decimals precision) */
  decimals: number;
  /** Working decimals (actual on-chain decimals) */
  workingDecimals: number;
  /** Token description */
  description: string;
}

/**
 * XRB Governance Token
 * 
 * Note: workingDecimals is currently 8 for testing.
 * Change to 18 when deploying to production with actual XRB token.
 */
export const GOVERNANCE_TOKEN: GovernanceToken = {
  symbol: "XRB",
  name: "Orobit Governance Token",
  decimals: 6, // Display precision
  workingDecimals: 6,
  description: "Governance token for the Orobit blockchain protocol",
};

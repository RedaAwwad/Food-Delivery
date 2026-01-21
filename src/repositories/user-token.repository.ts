import { prisma } from "../config/prisma.config";
import { TokenType } from "../generated/prisma";
import { v7 as uuidv7 } from "uuid";
import crypto from "crypto";
import { CreateTokenData } from "../types/token";

class UserTokenRepository {
  // Generate a cryptographically secure random token
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  // Create a new token for a user
  async createToken(data: CreateTokenData) {
    const token = data.token || this.generateSecureToken();

    return prisma.userToken.create({
      data: {
        userTokenId: uuidv7(),
        userId: data.userId,
        token,
        tokenType: data.tokenType,
        expiresAt: data.expiresAt,
      },
    });
  }

  // Find a valid token by token string and type
  async findValidToken(token: string, tokenType: TokenType) {
    const now = new Date();

    return prisma.userToken.findFirst({
      where: {
        token,
        tokenType,
        expiresAt: { gte: now },
      },
    });
  }

  // Find any token by token string (regardless of validity)
  async findTokenByToken(token: string) {
    return prisma.userToken.findFirst({
      where: { token },
    });
  }

  // Revoke a specific token
  async revokeToken(token: string) {
    return prisma.userToken.delete({
      where: { token },
    });
  }

  // Revoke all tokens of a specific type for a user
  async revokeAllUserTokensByType(userId: string, tokenType: TokenType) {
    return prisma.userToken.deleteMany({
      where: {
        userId,
        tokenType,
      },
    });
  }

  // Revoke all tokens for a user (all types)
  async revokeAllUserTokens(userId: string) {
    return prisma.userToken.deleteMany({
      where: {
        userId,
      },
    });
  }

  // Check if a token is valid
  async isValid(token: string, tokenType?: TokenType): Promise<boolean> {
    const where: any = { token };
    if (tokenType) {
      where.tokenType = tokenType;
    }

    const tokenData = await prisma.userToken.findFirst({ where });

    if (!tokenData) return false;
    if (tokenData.expiresAt < new Date()) return false;

    return true;
  }

  // Delete expired tokens (cleanup)
  async deleteExpiredTokens() {
    return prisma.userToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }

  // Delete old revoked tokens (cleanup)
  async deleteOldRevokedTokens(daysOld: number = 30) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    return prisma.userToken.deleteMany({
      where: {
        // isRevoked: true,
        revokedAt: { lt: cutoffDate },
      },
    });
  }

  // Get count of active tokens by type for a user
  async getActiveTokenCount(userId: string, tokenType: TokenType): Promise<number> {
    const now = new Date();

    return prisma.userToken.count({
      where: {
        userId,
        tokenType,
        // isRevoked: false,
        expiresAt: { gte: now },
      },
    });
  }

  async findRecentVerificationTokens(userId: string, timeFrameInHours: number = 1): Promise<any[]> {
    const oneHourAgo = new Date(Date.now() - timeFrameInHours * 60 * 60 * 1000);

    return await prisma.userToken.findMany({
      where: {
        userId,
        tokenType: TokenType.VERIFICATION,
        revokedAt: null,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });
  }

  async deleteRefreshTokensByUserId(userId: string) {
    return prisma.userToken.deleteMany({
      where: {
        userId,
        tokenType: TokenType.REFRESH,
      },
    });
  }
}

export const userTokenRepository = new UserTokenRepository();

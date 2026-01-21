import { TokenType } from "../generated/prisma";
import { userTokenRepository } from "../repositories/user-token.repository";
import { CreateTokenData } from "../types/token";

class UserTokenService {
  createToken(data: CreateTokenData) {
    return userTokenRepository.createToken(data);
  }

  findValidToken(token: string, tokenType: TokenType) {
    return userTokenRepository.findValidToken(token, tokenType);
  }

  async findTokenByToken(token: string) {
    return userTokenRepository.findTokenByToken(token);
  }

  async revokeToken(token: string) {
    return userTokenRepository.revokeToken(token);
  }

  async revokeAllUserTokensByType(userId: string, tokenType: TokenType) {
    return userTokenRepository.revokeAllUserTokensByType(userId, tokenType);
  }

  async revokeAllUserTokens(userId: string) {
    return userTokenRepository.revokeAllUserTokens(userId);
  }

  async isValid(token: string, tokenType?: TokenType): Promise<boolean> {
    return userTokenRepository.isValid(token, tokenType);
  }

  async deleteExpiredTokens() {
    return userTokenRepository.deleteExpiredTokens();
  }

  async deleteOldRevokedTokens(daysOld: number = 30) {
    return userTokenRepository.deleteOldRevokedTokens(daysOld);
  }

  async getActiveTokenCount(userId: string, tokenType: TokenType): Promise<number> {
    return userTokenRepository.getActiveTokenCount(userId, tokenType);
  }

  async deleteRefreshTokensByUserId(userId: string) {
    return userTokenRepository.deleteRefreshTokensByUserId(userId);
  }
}

export const userTokenService = new UserTokenService();

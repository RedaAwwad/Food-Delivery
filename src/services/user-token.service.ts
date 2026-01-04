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

    async findByUserIdAndType(userId: string, tokenType: TokenType, onlyValid: boolean = false) {
        return userTokenRepository.findByUserIdAndType(userId, tokenType, onlyValid);
    }

    async revokeToken(token: string, reason?: string) {
        return userTokenRepository.revokeToken(token, reason);
    }

    async revokeAllUserTokensByType(userId: string, tokenType: TokenType, reason?: string) {
        return userTokenRepository.revokeAllUserTokensByType(userId, tokenType, reason);
    }

    async revokeAllUserTokens(userId: string, reason?: string) {
        return userTokenRepository.revokeAllUserTokens(userId, reason);
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
}

export const userTokenService = new UserTokenService();
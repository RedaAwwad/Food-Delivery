import { prisma } from "../config/prisma.config";
import { CreateRefreshTokenData, RefreshTokenFilter } from "../types/token";
import { v7 as uuidv7 } from 'uuid';
import { Request } from "express";
import { TokenType } from "../generated/prisma";


class RefreshTokenRepository {
    async createRefreshToken(data: CreateRefreshTokenData) {
        return prisma.userToken.create({
            data: {
                userTokenId: uuidv7(),
                userId: data.userId,
                token: data.token,
                expiresAt: data.expiresAt,
                tokenType: TokenType.REFRESH,
            }
        });
    }

    async findByToken(token: string) {
        return prisma.userToken.findFirst({
            where: { token },
            include: {
                user: {
                    select: { userId: true, userName: true, userEmail: true }
                }
            }
        });
    }

    async findByUserId(userId: string, filters?: RefreshTokenFilter) {
        const where: any = { userId };

        if (filters?.isRevoked !== undefined) {
            where.isRevoked = filters.isRevoked;
        }

        if (filters?.expired !== undefined) {
            const now = new Date();
            if (filters.expired) {
                where.expiresAt = { lt: now };
            } else {
                where.expiresAt = { gte: now };
            }
        }

        return prisma.userToken.findMany({
            where
        });
    }

    async revokeToken(token: string, reason?: string) {
        return prisma.userToken.update({
            where: { token },
            data: {
                isRevoked: true,
                revokedAt: new Date(),
                revokedReason: reason || 'manual_revocation'
            }
        });
    }

    async revokeAllUserTokens(userId: string, reason?: string) {
        return prisma.userToken.updateMany({
            where: {
                userId,
                isRevoked: false
            },
            data: {
                isRevoked: true,
                revokedAt: new Date(),
                revokedReason: reason || 'logout_all'
            }
        });
    }

    async revokeAllExceptCurrent(userId: string, currentToken: string, reason?: string) {
        return prisma.userToken.updateMany({
            where: {
                userId,
                token: { not: currentToken },
                isRevoked: false
            },
            data: {
                isRevoked: true,
                revokedAt: new Date(),
                revokedReason: reason || 'new_login'
            }
        });
    }

    async deleteExpiredTokens() {
        return prisma.userToken.deleteMany({
            where: {
                expiresAt: { lt: new Date() }
            }
        });
    }

    async deleteRevokedTokens() {
        return prisma.userToken.deleteMany({
            where: {
                isRevoked: true,
                revokedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 days ago
            }
        });
    }

    async isValid(token: string): Promise<boolean> {
        const tokenData = await this.findByToken(token);

        if (!tokenData) return false;
        if (tokenData.isRevoked) return false;
        if (tokenData.expiresAt < new Date()) return false;

        return true;
    }

    async getActiveSessionCount(userId: string): Promise<number> {
        const now = new Date();

        return prisma.userToken.count({
            where: {
                userId,
                isRevoked: false,
                expiresAt: { gte: now }
            }
        });
    }

}

export const refreshTokenRepository = new RefreshTokenRepository();

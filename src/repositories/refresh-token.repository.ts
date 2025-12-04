import { prisma } from "../config/prisma.config";
import { CreateRefreshTokenData, RefreshTokenFilter } from "../types/token";
import { v7 as uuidv7 } from 'uuid';
import { Request } from "express";


class RefreshTokenRepository {
    async createRefreshToken(data: CreateRefreshTokenData) {
        return prisma.refreshToken.create({
            data: {
                refreshTokenId: uuidv7(),
                userId: data.userId,
                token: data.token,
                expiresAt: data.expiresAt,
                userAgent: data.userAgent ?? null,
                ipAddress: data.ipAddress ?? null,
                deviceType: data.deviceType ?? null,
                lastUsedAt: new Date(),
            }
        });
    }

    async findByToken(token: string) {
        return prisma.refreshToken.findFirst({
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

        return prisma.refreshToken.findMany({
            where,
            orderBy: { lastUsedAt: 'desc' }
        });
    }

    async updateLastUsed(token: string) {
        return prisma.refreshToken.update({
            where: { token },
            data: { lastUsedAt: new Date() }
        }).catch(() => {
            // Silent fail if token doesn't exist
        });
    }

    async revokeToken(token: string, reason?: string) {
        return prisma.refreshToken.update({
            where: { token },
            data: {
                isRevoked: true,
                revokedAt: new Date(),
                revokedReason: reason || 'manual_revocation'
            }
        });
    }

    async revokeAllUserTokens(userId: string, reason?: string) {
        return prisma.refreshToken.updateMany({
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
        return prisma.refreshToken.updateMany({
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
        return prisma.refreshToken.deleteMany({
            where: {
                expiresAt: { lt: new Date() }
            }
        });
    }

    async deleteRevokedTokens() {
        return prisma.refreshToken.deleteMany({
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

        return prisma.refreshToken.count({
            where: {
                userId,
                isRevoked: false,
                expiresAt: { gte: now }
            }
        });
    }

    extractDeviceInfo(req: Request): { userAgent?: string | null; ipAddress?: string | null; deviceType?: string | null } {
        return {
            userAgent: req.headers['user-agent'] || null,
            ipAddress: req.ip || req.socket.remoteAddress || null,
            deviceType: this.detectDeviceType(req.headers['user-agent'] || '')
        };
    }

    private detectDeviceType(userAgent: string): string {
        const ua = userAgent.toLowerCase();

        if (/mobile|android|iphone|ipad|ipod/.test(ua)) return 'mobile';
        if (/tablet|ipad/.test(ua)) return 'tablet';
        if (/smart-tv|smarttv|googletv|appletv/.test(ua)) return 'tv';

        return 'desktop';
    }

    //     extractDeviceInfo(req: Request): { userAgent?: string | null; ipAddress?: string | null; deviceType?: string | null } {
    //     const ua = (req.headers['user-agent'] as string) || null;
    //     const ip = (req.ip as string) || (req.socket.remoteAddress as string) || null;

    //     return {
    //         userAgent: ua,
    //         ipAddress: ip,
    //         deviceType: ua ? this.detectDeviceType(ua) : null,
    //     };
    // }

    // private detectDeviceType(userAgent: string): string {
    //     const ua = userAgent.toLowerCase();

    //     if (/mobile|android|iphone|ipad|ipod/.test(ua)) return 'mobile';
    //     if (/tablet|ipad/.test(ua)) return 'tablet';
    //     if (/smart-tv|smarttv|googletv|appletv/.test(ua)) return 'tv';

    //     return 'desktop';
    // }
}

export const refreshTokenRepository = new RefreshTokenRepository();

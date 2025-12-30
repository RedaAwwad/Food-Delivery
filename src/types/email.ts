export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export interface PasswordResetEmailData {
    userName: string;
    resetLink: string;
    expiryHours: number;
}

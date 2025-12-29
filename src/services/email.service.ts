import nodemailer, { Transporter } from 'nodemailer';
import { EmailOptions, PasswordResetEmailData } from '../types/email';
import { CustomError } from '../utils/errors/custom-error';
import { StatusCodes } from 'http-status-codes';

class EmailService {
    private transporter: Transporter | null = null;
    private isConfigured: boolean = false;

    constructor() {
        this.initializeTransporter();
    }

    private initializeTransporter(): void {
        const emailHost = process.env.EMAIL_HOST;
        const emailPort = process.env.EMAIL_PORT;
        const emailUser = process.env.EMAIL_USER;
        const emailPassword = process.env.EMAIL_PASSWORD;

        // Check if email is configured
        if (!emailHost || !emailPort || !emailUser || !emailPassword) {
            console.warn('⚠️  Email service not configured. Password reset emails will be logged to console.');
            this.isConfigured = false;
            return;
        }

        try {
            this.transporter = nodemailer.createTransport({
                host: emailHost,
                port: parseInt(emailPort, 10),
                secure: parseInt(emailPort, 10) === 465, // true for 465, false for other ports
                auth: {
                    user: emailUser,
                    pass: emailPassword,
                },
            });

            this.isConfigured = true;
            console.log('✅ Email service configured successfully');
        } catch (error) {
            console.error('❌ Failed to configure email service:', error);
            this.isConfigured = false;
        }
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        // If not configured, log to console for development
        if (!this.isConfigured || !this.transporter) {
            console.log('\n📧 ===== EMAIL (Development Mode) =====');
            console.log(`To: ${options.to}`);
            console.log(`Subject: ${options.subject}`);
            console.log(`Content:\n${options.text || options.html}`);
            console.log('=====================================\n');
            return true;
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email sent successfully to ${options.to}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to send email:', error);
            throw new CustomError({
                message: 'Failed to send email',
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    }

    async sendPasswordResetEmail(email: string, data: PasswordResetEmailData): Promise<boolean> {
        const subject = 'Password Reset Request';

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background-color: #4CAF50;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }
                    .content {
                        background-color: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 5px 5px;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background-color: #4CAF50;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .footer {
                        margin-top: 20px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        font-size: 12px;
                        color: #666;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 10px;
                        margin: 15px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${data.userName},</p>
                        
                        <p>We received a request to reset your password. Click the button below to create a new password:</p>
                        
                        <div style="text-align: center;">
                            <a href="${data.resetLink}" class="button">Reset Password</a>
                        </div>
                        
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #4CAF50;">${data.resetLink}</p>
                        
                        <div class="warning">
                            <strong>⚠️ Important:</strong>
                            <ul>
                                <li>This link will expire in <strong>${data.expiryHours} hour(s)</strong></li>
                                <li>This link can only be used once</li>
                                <li>If you didn't request this, please ignore this email</li>
                            </ul>
                        </div>
                        
                        <div class="footer">
                            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                            <p>For security reasons, this link will expire after ${data.expiryHours} hour(s).</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Hello ${data.userName},

We received a request to reset your password.

Reset your password by clicking this link:
${data.resetLink}

⚠️ Important:
- This link will expire in ${data.expiryHours} hour(s)
- This link can only be used once
- If you didn't request this, please ignore this email

If you didn't request a password reset, you can safely ignore this email.
        `.trim();

        return this.sendEmail({
            to: email,
            subject,
            html,
            text,
        });
    }

    async sendVerificationEmail(email: string, verificationLink: string, userName: string): Promise<boolean> {
        const subject = 'Verify Your Email Address';

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background-color: #2196F3;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }
                    .content {
                        background-color: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 5px 5px;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background-color: #2196F3;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome!</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${userName},</p>
                        
                        <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
                        
                        <div style="text-align: center;">
                            <a href="${verificationLink}" class="button">Verify Email</a>
                        </div>
                        
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #2196F3;">${verificationLink}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Hello ${userName},

Thank you for signing up! Please verify your email address by clicking this link:
${verificationLink}
        `.trim();

        return this.sendEmail({
            to: email,
            subject,
            html,
            text,
        });
    }
}

export const emailService = new EmailService();

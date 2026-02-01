import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

export async function sendOTPEmail(email, otp, name) {
    const mailOptions = {
        from: `"BikinLiga" <${process.env.MAIL_FROM_ADDRESS}>`,
        to: email,
        subject: 'Kode Verifikasi BikinLiga',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 20px; }
                    .container { max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; }
                    .logo { text-align: center; margin-bottom: 30px; }
                    .logo span { font-size: 28px; font-weight: bold; }
                    .logo .pink { color: #ff6b9d; }
                    h1 { color: #ffffff; margin: 0 0 20px 0; font-size: 24px; }
                    .otp-box { background: rgba(0, 255, 135, 0.1); border: 2px solid #00ff87; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0; }
                    .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #00ff87; margin: 0; }
                    .info { color: #888888; font-size: 14px; line-height: 1.6; }
                    .footer { margin-top: 40px; text-align: center; color: #666666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">
                        <span>Bikin<span class="pink">Liga</span></span>
                    </div>
                    <h1>Halo${name ? `, ${name}` : ''}! 👋</h1>
                    <p>Berikut adalah kode verifikasi untuk akun BikinLiga Anda:</p>
                    <div class="otp-box">
                        <p class="otp-code">${otp}</p>
                    </div>
                    <p class="info">
                        Kode ini berlaku selama <strong>10 menit</strong>.<br>
                        Jangan bagikan kode ini kepada siapapun.
                    </p>
                    <div class="footer">
                        <p>© 2024 BikinLiga. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    await transporter.sendMail(mailOptions);
}

export async function verifyMailConnection() {
    try {
        await transporter.verify();
        console.log('✅ Mail server connected');
        return true;
    } catch (error) {
        console.error('❌ Mail server connection failed:', error.message);
        return false;
    }
}

export default transporter;

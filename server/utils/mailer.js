import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.hostinger.com',
    port: process.env.MAIL_PORT || 465,
    secure: process.env.MAIL_PORT == 465 || process.env.MAIL_PORT == undefined, // true for 465
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

export const sendInvoiceEmail = async (toEmail, invoiceDetails) => {
    try {
        const { invoiceNumber, amount, coins, packageName, date, customerName } = invoiceDetails;
        
        const mailOptions = {
            from: `"BikinLiga" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: toEmail,
            subject: `Menunggu Pembayaran: Invoice Top Up - ${invoiceNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #121212; padding: 20px; text-align: center;">
                        <h1 style="color: #02FE02; margin: 0;">BikinLiga</h1>
                    </div>
                    <div style="padding: 20px;">
                        <h2 style="color: #121212;">Halo, ${customerName || 'Pelanggan'}!</h2>
                        <p>Terima kasih telah melakukan pemesanan Top Up Coin di <strong>BikinLiga</strong>. Status pesanan Anda saat ini adalah <strong>Menunggu Pembayaran</strong>.</p>
                        
                        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #121212;">Detail Tagihan (Invoice):</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>No. Invoice</strong></td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right; font-family: monospace;">${invoiceNumber}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Tanggal</strong></td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right;">${date}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Paket Top Up</strong></td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right;">${packageName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Koin yang akan diterima</strong></td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right; color: #02FE02; font-weight: bold;">+${coins} Coins</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0 0; font-size: 16px;"><strong>Total Tagihan</strong></td>
                                    <td style="padding: 12px 0 0; font-size: 16px; text-align: right; color: #E91E63;"><strong>Rp ${Number(amount).toLocaleString('id-ID')}</strong></td>
                                </tr>
                            </table>
                        </div>
                        
                        <p>Silakan selesaikan pembayaran Anda melalui metode pembayaran yang telah dipilih di aplikasi/website BikinLiga. Setelah pembayaran berhasil diverifikasi, koin akan otomatis ditambahkan ke akun Anda.</p>
                        <p>Abaikan email ini jika Anda sudah menyelesaikan pembayaran.</p>
                        <br>
                        <p style="margin-bottom: 0;">Salam hangat,</p>
                        <p style="margin-top: 5px; font-weight: bold;">Tim BikinLiga</p>
                    </div>
                    <div style="background-color: #121212; padding: 15px; text-align: center; color: #888; font-size: 12px;">
                        &copy; ${new Date().getFullYear()} BikinLiga. All rights reserved.
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Invoice email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending invoice email:', error);
        return false;
    }
};


import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify connection
transporter.verify(function (error, success) {
    if (error) {
        console.error('SMTP Bağlantı Hatası:', error);
    } else {
        console.log('SMTP Bağlantısı Başarılı');
    }
});

interface BookingDetails {
    propertyName: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    startDate: Date;
    endDate: Date;
    totalPrice: number;
    nights: number;
    recipientEmail?: string;
}

export const sendBookingNotification = async (booking: BookingDetails) => {
    try {
        let recipient = booking.recipientEmail;

        if (!recipient) {
            // Fallback if not provided by controller
            const settings = await prisma.settings.findFirst();
            recipient = settings?.notificationEmail || settings?.contactEmail || process.env.SMTP_USER;
        }

        if (!recipient) {
            console.error('No notification email configured (Check DB Settings or SMTP_USER env).');
            return;
        }

        // 2. Prepare Template
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f7; }
                .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
                .header { background: #1d1d1f; padding: 40px; text-align: center; color: white; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px; }
                .content { padding: 40px; }
                .section { margin-bottom: 30px; }
                .section-title { font-size: 13px; font-weight: 600; color: #86868b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
                .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f5f5f7; }
                .info-label { font-size: 15px; color: #1d1d1f; font-weight: 500; }
                .info-value { font-size: 15px; color: #1d1d1f; font-weight: 400; text-align: right; }
                .total-row { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5; }
                .total-label { font-size: 17px; font-weight: 600; color: #1d1d1f; }
                .total-value { font-size: 24px; font-weight: 700; color: #0071e3; }
                .footer { background: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5; }
                .footer p { margin: 0; font-size: 13px; color: #86868b; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Yeni Rezervasyon Bildirimi</h1>
                </div>
                <div class="content">
                    <div class="section">
                        <div class="section-title">Mülk Bilgileri</div>
                        <div class="info-row">
                            <span class="info-label">Mülk Adı</span>
                            <span class="info-value">${booking.propertyName}</span>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Müşteri Detayları</div>
                        <div class="info-row">
                            <span class="info-label">Ad Soyad</span>
                            <span class="info-value">${booking.customerName}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">E-posta</span>
                            <span class="info-value text-link">${booking.customerEmail}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Telefon</span>
                            <span class="info-value">${booking.customerPhone}</span>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Konaklama Detayları</div>
                        <div class="info-row">
                            <span class="info-label">Giriş Tarihi</span>
                            <span class="info-value">${new Date(booking.startDate).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Çıkış Tarihi</span>
                            <span class="info-value">${new Date(booking.endDate).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Süre</span>
                            <span class="info-value">${booking.nights} Gece</span>
                        </div>
                        
                        <div class="total-row">
                            <span class="total-label">Toplam Tutar</span>
                            <span class="total-value">${booking.totalPrice.toLocaleString('tr-TR')} ₺</span>
                        </div>
                    </div>
                </div>
                <div class="footer">
                    <p>Bu mail Şenay Villa & Yat rezervasyon sistemi tarafından otomatik gönderilmiştir.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // 3. Send Mail
        await transporter.sendMail({
            from: `"Şenay Villa & Yat" <${process.env.SMTP_USER}>`,
            to: recipient,
            subject: `Yeni Rezervasyon: ${booking.propertyName} - ${booking.customerName}`,
            html: html,
        });

        console.log(`Booking notification sent to ${recipient}`);

    } catch (error) {
        console.error('Mail Gönderim Hatası Detayı:', error);
    }
};

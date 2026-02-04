import 'dotenv/config';
import nodemailer from 'nodemailer';
import fs from 'fs';
import util from 'util';

const logFile = fs.createWriteStream('email_test.log', { flags: 'a' });
const logStdout = process.stdout;

console.log = function (d) {
    logFile.write(util.format(d) + '\n');
    logStdout.write(util.format(d) + '\n');
};

console.error = function (d) {
    logFile.write(util.format(d) + '\n');
    logStdout.write(util.format(d) + '\n');
};

console.log('--- Email Configuration Test ---');
console.log('Host: ' + process.env.MAIL_HOST);
console.log('User: ' + process.env.MAIL_USERNAME);
console.log('From: ' + process.env.MAIL_FROM_ADDRESS);

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    },
    debug: true,
    logger: {
        debug(str) { console.log('[DEBUG] ' + str); },
        info(str) { console.log('[INFO] ' + str); },
        error(str) { console.error('[ERROR] ' + str); },
        warn(str) { console.log('[WARN] ' + str); }
    }
});

async function testEmail() {
    try {
        console.log('\n1. Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection verified successfully.');

        console.log('\n2. Sending test email...');
        const info = await transporter.sendMail({
            from: `"Test Script" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: process.env.MAIL_USERNAME, // Send to self
            subject: 'Test Email form Debug Script',
            text: 'If you receive this, the email configuration is correct.',
            html: '<b>If you receive this, the email configuration is correct.</b>'
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID: ' + info.messageId);
        console.log('Response: ' + info.response);

    } catch (error) {
        console.error('\n❌ Error occurred:');
        console.error('Code: ' + error.code);
        console.error('Message: ' + error.message);
        if (error.command) console.error('Command: ' + error.command);
    }
}

testEmail();

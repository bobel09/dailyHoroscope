require('dotenv').config();
const nodemailer = require('nodemailer');
const https = require('https');

// Function to fetch horoscope data
function fetchHoroscope(sign) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            hostname: 'horoscope-astrology.p.rapidapi.com',
            port: null,
            path: `/horoscope?day=today&sunsign=${sign}`,
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': 'horoscope-astrology.p.rapidapi.com'
            }
        };

        const req = https.request(options, (res) => {
            const chunks = [];

            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const body = Buffer.concat(chunks).toString();
                try {
                    const horoscope = JSON.parse(body);
                    resolve(horoscope);
                } catch (e) {
                    reject(new Error('Error parsing horoscope data'));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

// Function to send an email
function sendEmail(to, subject, text) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: text
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject('Error sending email: ' + error);
            } else {
                resolve('Email sent: ' + info.response);
            }
        });
    });
}

// Main function to fetch horoscope and send email
async function fetchHoroscopeAndSendEmail(sign, email) {
    try {
        // Fetch the horoscope data
        const horoscope = await fetchHoroscope(sign);
        const horoscopeText = horoscope.horoscope;
        const luckyNumber = horoscope.lucky_number;

        // Create the email content
        const subject = `Today's Horoscope for ${sign.charAt(0).toUpperCase() + sign.slice(1)}`;
        const htmlContent = `
            <p>Your daily horoscope says this:</p>
            <blockquote>
                <p>${horoscopeText}</p>
                <p>Your lucky number for today is: ${luckyNumber}</p>
            </blockquote>
            <p>Have a great day!</p>
        `;

        // Send the email
        const result = await sendEmail(email, subject, htmlContent);
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}
const users = {
    'deian.dreghici03@e-uvt.ro': 'taurus',
    'david.oprisan04@e-uvt.ro': 'capricorn',
    'bogdan.ugron03@e-uvt.ro': 'leo',
    'vlad.alexiuc03@e-uvt.ro': 'cancer',
    'tudor.todea03@e-uvt.ro' : 'libra',
    'angelko.mitrici03@e-uvt.ro' : 'leo',
    'david.gorbe04@e-uvt.ro' : 'aries'
}

for (const [email, sign] of Object.entries(users)) {
    fetchHoroscopeAndSendEmail(sign, email);
}

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

// Function to translate text
function translateText(text, targetLanguage) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            hostname: 'deep-translate1.p.rapidapi.com',
            port: null,
            path: '/language/translate/v2',
            headers: {
                'content-type': 'application/json',
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': 'deep-translate1.p.rapidapi.com'
            }
        };

        const req = https.request(options, (res) => {
            const chunks = [];

            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const body = Buffer.concat(chunks).toString();
                try {
                    const translationResult = JSON.parse(body);
                    resolve(translationResult.data.translations.translatedText);
                } catch (e) {
                    reject(new Error('Error parsing translation data'));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(JSON.stringify({
            q: text,
            source: 'en',
            target: targetLanguage
        }));
        req.end();
    });
}

// Function to send an email
function sendEmail(to, subject, html) {
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
        html: html
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
async function fetchHoroscopeAndSendEmail(sign, email, targetLanguage) {
    try {
        // Fetch the horoscope data
        const horoscope = await fetchHoroscope(sign);
        const horoscopeText = horoscope.horoscope;
        const luckyNumber = horoscope.lucky_number;

        // Fetch the user's name from the email
        const userName = email.split('.')[0];
        const capitalizedUserName = userName.charAt(0).toUpperCase() + userName.slice(1);

        // Translate the horoscope text if the target language is not 'en'
        let translatedText = horoscopeText;
        if (targetLanguage !== 'en') {
            translatedText = await translateText(horoscopeText, targetLanguage);
        }
        let translatedSign = sign;
        if (sign === 'aries') {
            translatedSign = 'berbec'
        }
        if (sign === 'taurus') {
            translatedSign = 'taur';
        }
        if (sign === 'gemini') {
            translatedSign = 'gemeni';
        }
        if (sign === 'cancer') {
            translatedSign = 'rac';
        }
        if (sign === 'leo') {
            translatedSign = 'leu';
        }
        if (sign === 'virgo') {
            translatedSign = 'fecioara';
        }
        if (sign === 'libra') {
            translatedSign = 'balanta';
        }
        if (sign === 'scorpio') {
            translatedSign = 'scorpion';
        }
        if (sign === 'sagittarius') {
            translatedSign = 'sagetator';
        }
        if (sign === 'capricorn') {
            translatedSign = 'capricorn';
        }
        if (sign === 'aquarius') {
            translatedSign = 'varsator';
        }
        if (sign === 'pisces') {
            translatedSign = 'pesti';
        }

        // Create the email content
        const subject = `Horoscopul de azi pentru zodia ${translatedSign}`;
        const htmlContent = `
            <p>Horoscopul zilnic spune urmatoarele:</p>
            <blockquote>
                <p>${translatedText}</p>
                <p>Numarul tau norocos de azi este: ${luckyNumber}</p>
            </blockquote>
            <p>Sa ai o zi frumoasa ${capitalizedUserName} !</p>
        `;

        // Send the email
        const result = await sendEmail(email, subject, htmlContent);
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}

// User emails and signs
const users = {
    'deian.dreghici03@e-uvt.ro': 'taurus',
    'david.oprisan04@e-uvt.ro': 'capricorn',
    'bogdan.ugron03@e-uvt.ro': 'leo',
    'vlad.alexiuc03@e-uvt.ro': 'cancer',
    'tudor.todea03@e-uvt.ro': 'libra',
    'angelko.mitrici03@e-uvt.ro': 'leo',
    'david.gorbe04@e-uvt.ro': 'aries',
    'gabrielaignuta@gmail.com': 'pisces'
};

//Loop through users and send horoscopes
for (const [email, sign] of Object.entries(users)) {
    fetchHoroscopeAndSendEmail(sign, email, 'ro');
}


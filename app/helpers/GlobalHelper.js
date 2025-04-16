const fs = require('fs');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
let smtpData = JSON.parse(process.env.config);
const sharp = require("sharp");
const HTMLtoDOCX = require('html-to-docx');
const ExcelJS = require('exceljs');

global.__env = function () {
    return JSON.parse(process.env.config)
}

global.__response = function (res, status, data) {
    res.status(status).json(data)
}

global.__imageToBase64 = function (filePath) {
    try {
        const imageBuffer = fs.readFileSync(filePath);
        const base64String = imageBuffer.toString('base64');
        return base64String;
    } catch (err) {
        return '';
    }

}

global.__sendMail = function (mailOptions, smtpDetails) {
    let smtp = smtpData.smtp;
    try {
        if (smtpDetails) {
            smtp = {
                host: smtpDetails.host,
                port: smtpDetails.port,
                secure: smtpDetails.encryption == 'SSL',
                auth: {
                    user: smtpDetails.username,
                    pass: smtpDetails.password
                }
            }
        }
        const transporter = nodemailer.createTransport(smtp);

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log("__err__", err)
                return process.exit(1);
            }

        });

    } catch (err) {
        return '';
    }

}

// global.__generatePDFBase64 = async function (htmlContent, config) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     let waterMark = config.watermark;
//     await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
//     await page.evaluate((wm) => {
//         const div = document.createElement('div');
//         div.innerHTML = wm || 'hiredeveloper.dev';
//         div.style.cssText = `
//             position: fixed;
//             bottom: 50%;  /* Center vertically */
//             right: 50%;   /* Center horizontally */
//             z-index: 10000;
//             transform: translate(50%, 50%) rotate(-45deg);  /* Tilted at a 45-degree angle */
//             transform-origin: 0% 0%;  /* Set the origin for rotation */
//             color:rgb(244 244 244 / 80%);
//             z-index:-1;
//             font-size:100px;
//         `;
//         document.body.appendChild(div);
//         // wm ? (watermarkDiv = document.createElement('div'), watermarkDiv.innerHTML = wm, watermarkDiv.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; opacity: 0.5; font-size: 100px; transform: rotate(-45deg);', document.body.appendChild(watermarkDiv)) : null;
//     },waterMark);
//     const pdfBuffer = await page.pdf(config);
//     await browser.close();
//     const pdfBase64 = pdfBuffer.toString('base64');
//     return pdfBase64;
// }


global.__generatePDFBase64 = async function (htmlContent, config) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let waterMark = config.watermark;
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    await page.evaluate((wm) => {
        const div = document.createElement('div');
        div.innerHTML = wm || 'hiredeveloper.dev';
        div.style.cssText = `
           position:fixed;font-size: 100px;z-index: -1;transform: rotate(-45deg);top: 250px;left:50px;color:rgb(244 244 244 / 80%);text-align:center;width:100%;
        `;
        document.body.appendChild(div);
        // wm ? (watermarkDiv = document.createElement('div'), watermarkDiv.innerHTML = wm, watermarkDiv.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; opacity: 0.5; font-size: 100px; transform: rotate(-45deg);', document.body.appendChild(watermarkDiv)) : null;
    }, waterMark);
    const pdfBuffer = await page.pdf(config);
    await browser.close();
    const pdfBase64 = pdfBuffer.toString('base64');
    return pdfBase64;
}

global.__generatePDFforJobOpenings = async function (htmlContent, config) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
        const div = document.createElement('div');
        div.innerHTML = 'hiredeveloper.dev';
        div.style.cssText = `
            position: fixed;
            bottom: 15%;  /* Center vertically */
            right: 40%;   /* Center horizontally */
            z-index: 10000;
            transform: translate(50%, 50%) rotate(-45deg);  /* Tilted at a 45-degree angle */
            transform-origin: 0% 0%;  /* Set the origin for rotation */
            color: rgb(255 65 3 / 16%);  /* Text color */
            font-size:100px;
        `;
        document.body.appendChild(div);
    });
    const pdfBuffer = await page.pdf(config);
    await browser.close();
    const pdfBase64 = pdfBuffer.toString('base64');
    return pdfBase64;
}

global.__imageToBase64 = function (filePath) {
    try {
        const imageBuffer = fs.readFileSync(filePath);
        const base64String = imageBuffer.toString('base64');
        return base64String;
    } catch (error) {
        console.error(`Error converting image to base64: ${error.message}`);
        return '';
    }
}


global.__addWaterMark = async function (inputPath, outputPath, WaterMarkPath) {
    try {
        const { width, height } = await sharp(inputPath).metadata();

        // Calculate the center position
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);
        await sharp(inputPath)
            .composite([
                {
                    input: WaterMarkPath,
                    top: 20,
                    left: 20,
                },
            ])
            .toFile(outputPath);
    } catch (error) {
        console.log(error);
    }
}


global.__exportDoc = async function (htmlString, headerHTMLString, documentOptions, footerHTMLString) {
    try {
        return await HTMLtoDOCX(htmlString, headerHTMLString, documentOptions, footerHTMLString)
    } catch (err) {
        return false;
    }
}

global.__generateExcelFile = async (data, columns, filePath) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    worksheet.columns = columns;
    worksheet.addRows(data);

    await workbook.xlsx.writeFile(filePath);
    return filePath;
};



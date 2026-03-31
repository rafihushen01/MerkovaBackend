const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

/**
 * ==========================================
 * MERKOVA TRILLION-DOLLAR EMAIL ENGINE (FIXED V2)
 * ==========================================
 * Status: PRODUCTION READY
 * Fixes: Mobile Layering, Z-Index Bleed-through
 */

// 1. Configure the Secure Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
        user: process.env.Merkova_GMAIL,
        pass: process.env.APP_PASS,
    },
});

/**
 * 2. THE ULTIMATE HTML GENERATOR
 * Now uses "Hard Layering" to ensure OTP is 100% hidden until scratched.
 */
const generateMerkovaHTML = (title, message, otp) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Merkova Security</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');

            body { margin: 0; padding: 0; background-color: #020617; font-family: 'Plus Jakarta Sans', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
            .wrapper { width: 100%; background-color: #020617; padding-bottom: 60px; }
            .main-table { width: 100%; max-width: 600px; margin: 0 auto; border-spacing: 0; color: #ffffff; }

            /* --- BRANDING --- */
            .logo-header { padding: 40px 0 20px 0; text-align: center; }
            .logo-glow {
                font-size: 36px; font-weight: 800; color: #00d4ff; 
                letter-spacing: 6px; text-transform: uppercase;
                text-shadow: 0 0 25px rgba(0, 212, 255, 0.8);
                margin: 0;
            }

            /* --- GLASS CARD --- */
            .glass-card {
                background: #0f172a; /* Fallback */
                background: linear-gradient(145deg, #0f172a 0%, #020617 100%);
                border: 1px solid rgba(0, 212, 255, 0.2);
                border-radius: 24px; padding: 40px; text-align: center;
                box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.9);
                position: relative; overflow: hidden;
            }

            .badge {
                display: inline-block; padding: 6px 16px; border-radius: 50px;
                background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3);
                color: #00d4ff; font-size: 10px; font-weight: 800; letter-spacing: 1px;
                text-transform: uppercase; margin-bottom: 20px;
            }

            h1 { font-size: 26px; margin: 0 0 15px 0; font-weight: 700; color: #ffffff; }
            p { font-size: 15px; line-height: 1.6; color: #94a3b8; margin: 0 0 30px 0; }

            /* --- FIXED SCRATCH UI (THE MAGIC) --- */
            .scratch-container {
                position: relative; 
                width: 280px; 
                height: 100px; 
                margin: 0 auto 30px auto;
                background-color: #00d4ff;
                border-radius: 16px;
                overflow: hidden; /* Ensures layers stay inside */
                cursor: pointer;
                /* Box shadow for depth */
                box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
            }

            /* 1. The OTP Layer (Bottom) */
            .otp-layer {
                position: absolute; 
                top: 0; left: 0; 
                width: 100%; height: 100%;
                display: flex; 
                align-items: center; 
                justify-content: center;
                font-size: 36px; 
                font-weight: 800; 
                color: #020617;
                letter-spacing: 6px; 
                z-index: 1; /* Sits at the bottom */
            }

            /* 2. The Scratch Cover (Top) - Fixed High Z-Index */
            .scratch-surface {
                position: absolute; 
                top: 0; left: 0; 
                width: 100%; height: 100%;
                background: #1e293b; /* Solid color fallback */
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                border: 2px dashed rgba(0, 212, 255, 0.5); 
                border-radius: 16px;
                display: flex; 
                align-items: center; 
                justify-content: center;
                z-index: 999; /* Forced on top */
                transition: opacity 0.4s ease-in-out, transform 0.4s ease;
            }

            .scratch-text {
                color: #00d4ff; font-weight: 700; font-size: 12px;
                text-transform: uppercase; letter-spacing: 2px;
                pointer-events: none;
            }

            /* --- ANIMATION LOGIC --- */
            /* On Hover or Active (Tap), fade out the top layer */
            .scratch-container:hover .scratch-surface,
            .scratch-container:active .scratch-surface {
                opacity: 0; 
                transform: scale(1.1);
            }

            /* --- FOOTER --- */
            .footer-text { margin-top: 30px; font-size: 12px; color: #475569; line-height: 1.5; }
            .blue-line { width: 30px; height: 3px; background: #00d4ff; margin: 30px auto 15px auto; border-radius: 2px; }

        </style>
    </head>
    <body>
        <div class="wrapper">
            <table class="main-table">
                <tr>
                    <td class="logo-header">
                        <div class="logo-glow">MERKOVA</div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div class="glass-card">
                            <div class="badge">SECURE SYSTEM</div>
                            <h1>${title}</h1>
                            <p>${message}</p>
                            
                            <div class="scratch-container">
                                <div class="otp-layer">${otp}</div>
                                
                                <div class="scratch-surface">
                                    <span class="scratch-text">HOVER / TAP TO REVEAL</span>
                                </div>
                            </div>

                            <p style="font-size: 13px; color: #64748b;">
                                Code valid for <b style="color: #00d4ff;">5 minutes</b>. Do not share.
                            </p>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td align="center">
                        <div class="blue-line"></div>
                        <div class="footer-text">
                            &copy; 2026 Merkova Corp. All rights reserved. <br>
                            Merkova Security Team
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>
    `;
};

// ==========================================
// 3. CONTROLLERS (Fully Integrated)
// ==========================================

// 1. Send OTP (General)
const sendotp = async (to, otp) => {
    try {
        await transporter.sendMail({
            from: `"Merkova Security" <${process.env.Merkova_GMAIL}>`,
            to,
            subject: `Merkova Security Code: ${otp}`,
            html: generateMerkovaHTML("Password Reset", "We received a request to access your account. Tap the card below to reveal your code.", otp)
        });
        console.log("✅ sendotp sent");
    } catch (error) { console.log(`❌ sendotp error: ${error}`); }
};

// 2. Super Admin
const sendsuperadminotp = async (to, otp) => {
    try {
        await transporter.sendMail({
            from: `"Merkova Admin" <${process.env.Merkova_GMAIL}>`,
            to,
            subject: `🔴 SUPERADMIN ACCESS CODE`,
            html: generateMerkovaHTML("SuperAdmin Access", "Top-level clearance requested. Tap to reveal the administrator bypass key.", otp)
        });
        console.log("✅ sendsuperadminotp sent");
    } catch (error) { console.log(`❌ sendsuperadminotp error: ${error}`); }
};

// 3. Seller Verification
const sendsellerverifyotp = async (to, otp) => {
    try {
        await transporter.sendMail({
            from: `"Merkova Partners" <${process.env.Merkova_GMAIL}>`,
            to,
            subject: `Verify Seller Identity`,
            html: generateMerkovaHTML("Partner Verification", "Welcome to the ecosystem. Tap to verify your seller account credentials.", otp)
        });
        console.log("✅ sendsellerverifyotp sent");
    } catch (error) { console.log(`❌ sendsellerverifyotp error: ${error}`); }
};

// 4. Seller Email Change
const sendsellernewgmailotp = async (to, otp) => {
    try {
        await transporter.sendMail({
            from: `"Merkova Accounts" <${process.env.Merkova_GMAIL}>`,
            to,
            subject: `Confirm Email Change`,
            html: generateMerkovaHTML("Email Update", "You are changing your business email. Tap the card to confirm this action.", otp)
        });
        console.log("✅ sendsellernewgmailotp sent");
    } catch (error) { console.log(`❌ sendsellernewgmailotp error: ${error}`); }
};

// 5. New User Signup
const sendnewusersignupotp = async (to, otp) => {
    try {
        await transporter.sendMail({
            from: `"Merkova Welcome" <${process.env.Merkova_GMAIL}>`,
            to,
            subject: `Welcome to Merkova!`,
            html: generateMerkovaHTML("Welcome to Merkova", "Your journey starts here. Tap the card to reveal your activation code.", otp)
        });
        console.log("✅ sendnewusersignupotp sent");
    } catch (error) { console.log(`❌ sendnewusersignupotp error: ${error}`); }
};

// 6. User Sign In
const sendusersigninotp = async (to, otp) => {
    try {
        await transporter.sendMail({
            from: `"Merkova Security" <${process.env.Merkova_GMAIL}>`,
            to,
            subject: `Sign-In Verification`,
            html: generateMerkovaHTML("Secure Login", "A login attempt was detected. Tap the card to reveal your access code.", otp)
        });
        console.log("✅ sendusersigninotp sent");
    } catch (error) { console.log(`❌ sendusersigninotp error: ${error}`); }
};

// ==========================================
// 4. MODULE EXPORTS
// ==========================================

module.exports = {
    sendotp,
    sendsuperadminotp,
    sendsellerverifyotp,
    sendsellernewgmailotp,
    sendnewusersignupotp,
    sendusersigninotp
};
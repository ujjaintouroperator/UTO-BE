const AuthModel = require("../models/AuthModel");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const pathJoin = require('path');
class AuthController {


    async verifyJWT(req, res, next) {
        try {
            let token = req.headers.authorization;
            token = token.replace('Bearer ', '');
            if (!token) {
                return __response(res, 401, {
                    status: false,
                    data: [],
                    message: "Unauthorized: No token provided"
                });
            }

            jwt.verify(token, __env().SSH_KEY, (err, decoded) => {
                if (err) {
                    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
                }

                // Attach the decoded user information to the request object
                req.user = decoded;
                next();
            });
        } catch (err) {
            return __response(res, 200, {
                status: false,
                data: [],
                message: "Internal server error"
            });
        }
    }

    async login(req, res) {
        try {
            let body = req.body;
            if (!(body.user_name || ' ').trim()) {
                return __response(res, 200, {
                    status: false,
                    data: [],
                    message: "User name required"
                });
            }

            let user = await AuthModel.checkUserName(body.user_name);

            if (user && user.length == 0) {
                return __response(res, 200, {
                    status: false,
                    data: [],
                    message: "Invalid user name"
                });
            }

            user = user[0];

            if (user.role_id == 3 && user.is_verified == 1) {
                return __response(res, 200, {
                    status: false,
                    data: [],
                    message: "Your account has been deactivated. Please contact the admin for further assistance."
                });
            }

            if (!await bcrypt.compare(body.password, user.password)) {
                return __response(res, 200, {
                    status: false,
                    data: [],
                    message: "Invalid password"
                });
            }
            const expirationTime = 8 * 60 * 60;
            user.token = jwt.sign(user, __env().SSH_KEY, { expiresIn: expirationTime });

            user.masters = await AuthModel.getAccessMasters(user.role_id);

            if (user.profile_image) {
                user.profile_image = __imageToBase64(user.profile_image);
            }

            if (user.role_slug == 'agency') {
                user.agency = await AuthModel.getAgency(user.agency_id);
            }

            delete user.password;

            return __response(res, 200, {
                status: true,
                data: user,
                message: "Login success"
            });

        } catch (err) {
            return __response(res, 200, {
                status: false,
                data: [],
                message: "Internal server error"
            });
        }
    }

    async forgot(req, res) {
        try {
            let username = req.body.username;
            let otp = await generateRandomFourDigitNumber();

            let checkUser = await AuthModel.checkUserName(username);

            if (!checkUser?.length) {
                return __response(res, 200, {
                    status: false,
                    data: [],
                    message: "Username not found"
                });
            }

            let obj = {
                user_name: username,
                otp: otp,
                is_deleted: 0,
                created_at: new Date(),
                updated_at: new Date()
            };
            let user = await AuthModel.save(obj, 'otp_verification');

            var htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            
            <head>
                <title>HIRE DEVELOPER</title>
                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <!-- <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" /> -->
                <meta name="description" content="" />
                <link rel="shortcut icon" type="image/icon" href="assets/images/favicon.png">
                <!-- <link href="assets/css/style.css?ver=1.1" rel="stylesheet"> -->
                <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
                <!--[if lt IE 9]>
                  <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
                  <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
                <![endif]-->
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
            </head>
            
            <body style="margin:0;">
                <div class="temp_mainwrap" style="padding: 0px 0px;word-wrap: break-word;word-break: break-word;color: #000000;background: #f4f4f4;font-size: 15px;font-weight: 400;font-family: 'Outfit', sans-serif;">
                    <div class="pdf_container" style="max-width: 550px; margin: 0 auto;padding:0px;font-size: 15px;font-weight: 400;font-family: 'Outfit', sans-serif;background: #fff;">
                        <table style="border: none; border-collapse: collapse; width: 100%;margin: 0px;">
                            <tr>
                                <td style="padding: 0px;border:none;">
                                    <table style="border: none; border-collapse: collapse; width: 100%;margin: 0px;">
                                        <tr>
                                            <td style="padding: 0px;border:none;">
                                                <table style="border: none; border-collapse: collapse; width: 100%;margin: 0px;">
                                                    <tr>
                                                        <td style="padding: 25px 10px 10px;border:none;vertical-align: top;text-align:center;border-bottom: 1px solid #E7E7E5;">
                                                            <div >
                                                                <img src="https://hiredeveloper.dev/uploads/hire_logo.svg" alt="logo" style="width:180px">
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>	
                                    </table>
                                    <table style="border: none; border-collapse: collapse; width: 100%;margin: 0px;">
                                        <tr>
                                            <td style="padding:15px 15px;border:none;"></td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 0px 30px;border:none;">
                                                <h3 style="font-size:42px;font-weight:400;line-height: 52px;margin-top:0;margin-bottom:20px;text-align:center;">Forgot your password ?</h3>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 0px 30px;border:none;">
                                                <div style="background-image:url(bgimage.jpg);background-size: cover;height: 172px;width: 100%;background-position: center;text-align: center;padding: 10px 0;">
                                                    <img src="https://hiredeveloper.dev/uploads/checkgif.gif" alt="logo" style="width:120px;margin-top: 26px;">
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 0px 0px;border:none;height:20px;"></td>
                                        </tr>	
                                        <tr>
                                            <td style="padding: 0px 60px;border:none;">
                                                <p style="font-size:16px; line-height:21px;color:#495057;margin-top:0;margin-bottom:30px;text-align:left;">We received a request to reset the password for your account, Check the below <a style="color:#FF4103;text-decoration:none;">OTP</a> to reset your password.</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 0px 60px;border:none;text-align:center;">
                                                <a style="display: inline-block;background: #FF4103;text-decoration:none;padding: 13px 10px;border-radius: 2em;color: #fff;width: 140px;font-size: 16px;">Your OTP is: ${otp}</a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 0px 0px;border:none;height:20px;"></td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 0px 60px;border:none;">
                                                <p style="font-size:16px; line-height:21px;color:#495057;margin-top:0;margin-bottom:10px;text-align:left;">
                                                if you have any questions, please email us at <a href="mailto:info@consultantsfromasia.com" style="color:#FF4103;text-decoration:none;">info@consultantsfromasia.com</a> or visit our FAQS. you can also chat with a real live human during our operating hours. They can answer questions about your account.
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding:15px 15px;border:none;"></td>
                                        </tr>				
                                    </table>
                                    <table style="border: none; border-collapse: collapse; width: 100%;margin: 0px;">
                                        <tr>
                                            <td style="padding: 20px 60px;border-top: 1px solid #E7E7E5;border-bottom: 1px solid #E7E7E5;">
                                                <p style="font-size:16px; line-height:21px;color:#495057;margin-top:0;margin-bottom:0px;text-align:left;">
                                                “This message contains confidential information and is intended only for the individual named. If you are not the named addressee you should not disseminate, distribute or copy this e-mail. Please notify the sender immediately by e-mail if you have received this e-mail by mistake and delete this e-mail from your system.”
                                                </p>
                                            </td>
                                        </tr>			
                                    </table>
                                    <table style="border: none; border-collapse: collapse; width: 100%;margin: 0px;">
                                        <tr>
                                            <td style="padding: 0px 0px;border:none;height:20px;"></td>
                                        </tr>
                                        <tr>
                                            <td style="padding:0px 30px;border:none;text-align: center;">
                                                <table style="border: none;border-collapse: collapse;width: 400px;margin: 0 auto;">
                                                    <tr>
                                                        <td style="padding:0px 10px;border:none;text-align: center;">
                                                            <a href="#" style="color:#495057;text-decoration:none;">
                                                                <img src="https://hiredeveloper.dev/uploads/facebook.png" alt="logo" style="width:32px;height: 32px;">
                                                            </a>
                                                        </td>
                                                        <td style="padding:0px 10px;border:none;text-align: center;">
                                                            <a href="#" style="color:#495057;text-decoration:none;">
                                                                <img src="https://hiredeveloper.dev/uploads/twitter.png" alt="logo" style="width:32px;height: 32px;">
                                                            </a>
                                                        </td>
                                                        <td style="padding:0px 10px;border:none;text-align: center;">
                                                            <a href="#" style="color:#495057;text-decoration:none;">
                                                                <img src="https://hiredeveloper.dev/uploads/instagram.png" alt="logo" style="width:32px;height: 32px;">
                                                            </a>
                                                        </td>
                                                        <td style="padding:0px 10px;border:none;text-align: center;">
                                                            <a href="#" style="color:#495057;text-decoration:none;">
                                                                <img src="https://hiredeveloper.dev/uploads/linkedin.png" alt="logo" style="width:32px;height: 32px;">
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 0px 0px;border:none;height:20px;"></td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 30px;border:none;">
                                                <p style="font-size:16px; line-height:21px;color:#495057;margin-top:0;margin-bottom:0px;text-align:center;">
                                                    Sent by <a href="#" style="color:#495057;text-decoration:none;">Hire Developer.dev</a>, India
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding:0px 30px;border:none;text-align: center;">
                                                <table style="border: none; border-collapse: collapse; width: 100%;margin: 0px;">
                                                    <tr>
                                                        <td style="padding:0px 10px;border:none;text-align: center;"><a href="#" style="color:#495057;text-decoration:underline;font-size:16px; line-height:21px;">Help Center</a></td>
                                                        <td style="padding:0px 10px;border:none;text-align: center;"><a href="#" style="color:#495057;text-decoration:underline;font-size:16px; line-height:21px;">Privacy Policy</a></td>
                                                        <td style="padding:0px 10px;border:none;text-align: center;"><a href="#" style="color:#495057;text-decoration:underline;font-size:16px; line-height:21px;">Terms of Service</a></td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding:15px 15px;border:none;"></td>
                                        </tr>			
                                    </table>
                                </td>
                            </tr>				
                        </table>
                    </div>
                </div>
            </body>
            
            </html>
            `;

            let mailOptions = {
                from: 'Hire Developer <no-reply@hiredeveloper.dev>',
                to: `${checkUser[0].user_name} <${checkUser[0].email}>`,
                subject: 'Forgot Password OTP',
                html: htmlContent
            };
            await __sendMail(mailOptions);

            return __response(res, 200, {
                status: true,
                data: [otp],
                message: "OTP sent successfully"
            });
        } catch (err) {
            return __response(res, 200, {
                status: false,
                data: [],
                message: "Internal server error"
            });
        }
    }

    async forgotOtp(req, res) {
        try {
            let body = req.body;

            let otp = await AuthModel.getOtp(body.username);
            let checkUser = await AuthModel.checkUserName(body.username);

            if (!otp?.length || !checkUser?.length) {
                return __response(res, 200, {
                    status: false,
                    message: "Something went wrong please try again"
                });
            }
            if (otp[0].otp != body.otp) {
                return __response(res, 200, {
                    status: false,
                    message: "Incorrect OTP"
                });
            }

            bcrypt.hash(body.password, 10, function (err, hash) {
                if (err) {
                    console.log(err);
                }
                hash;
                let userData = {
                    password: hash
                };
                AuthModel.update(userData, checkUser[0].id, 'users');
            });

            return __response(res, 200, {
                status: true,
                message: "Password reset successfully"
            });
        } catch (err) {
            return __response(res, 200, {
                status: false,
                message: "Internal server error"
            });
        }
    }

    async getUser(req, res) {
        try {
            let body = req.body;
            let user = req.user;

            let userData = await AuthModel.checkUserId(user.id);
            if (userData[0].profile_image) {
                userData[0].profile_image = await __imageToBase64(userData[0].profile_image);
            }

            return __response(res, 200, {
                status: true,
                data: userData,
                message: "User data"
            });
        } catch (err) {
            return __response(res, 200, {
                status: false,
                message: "Internal server error"
            });
        }
    }

    async updateUser(req, res) {
        try {
            let id = req.user.id;
            let body = req.body;
            let user = JSON.parse(body.info);
            let pass = user?.password;

            if (req.file) {
                var { filename, path } = req.file;
            }
            if (filename) {
                const newPath = pathJoin.join("uploads", "profile_image", String(id), `${new Date().getTime()}_${filename}`);
                const folderPath = pathJoin.join("uploads", "profile_image", String(id));
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath, { recursive: true });
                }
                fs.renameSync(path, newPath);
                await AuthModel.update({ profile_image: newPath }, id, 'users');
            }
            // if (user.host && user.port && user.username) {
            // console.log("insidee")
            let obj2 = {
                user_id: id,
                host: user.host,
                port: user.port,
                username: user.username,
                password: user.smtppassword,//new 
                is_deleted: 0,
                created_at: new Date(),
                updated_at: new Date()
            };
            // if (user.smtppassword) {
            //     const encryptedPass = await bcrypt.hash(user.smtppassword, 10);
            //     obj2.password = encryptedPass;
            // }

            let checkUpdate = await AuthModel.checksmtpexist(id);
            // console.log("ram", checkUpdate);
            if (checkUpdate.length > 0) {
                // console.log("smtp with update", checkUpdate);
                AuthModel.updateSmtp(obj2, id, 'user_smtp_servers');
            }
            else {
                const smtp = await AuthModel.save(obj2, 'user_smtp_servers');
                // console.log("smtp without update", smtp);
            }

            // }

            let obj = {};
            if (user?.first_name) {
                obj.first_name = user?.first_name;
            }
            if (user?.last_name) {
                obj.last_name = user?.last_name;
            }
            if (user?.user_name) {
                obj.user_name = user?.user_name;
            }
            if (user?.smtp) {
                obj.smtp_server = user?.smtp;
            }
            if (user?.number) {
                obj.mobile_number = user?.number;
            }
            if (pass) {
                if (Object.keys(obj).length == 0) {
                    return __response(res, 200, {
                        status: false,
                        message: "Nothing to update"
                    });
                }
                bcrypt.hash(pass, 10, function (err, hash) {
                    if (err) {
                        console.log(err);
                    }
                    var encryptedPass = hash;
                    obj.password = encryptedPass;
                    AuthModel.update(obj, id, 'users');
                });
            } else {
                if (Object.keys(obj).length == 0) {
                    return __response(res, 200, {
                        status: false,
                        message: "Nothing to update"
                    });
                }
                AuthModel.update(obj, id, 'users');
            }

            let userData = await AuthModel.checkUserId(id);
            userData = userData[0];

            userData.masters = await AuthModel.getAccessMasters(req.user.role_id);

            if (userData.profile_image) {
                userData.profile_image = __imageToBase64(userData.profile_image);
            }

            delete userData.password;

            return __response(res, 200, {
                status: true,
                data: userData,
                message: "Profile updated successfully"
            });
        } catch (err) {
            return __response(res, 200, {
                status: false,
                message: "Internal server error"
            });
        }
    }

}

async function generateRandomFourDigitNumber() {
    let number = '';
    for (let i = 0; i < 4; i++) {
        number += Math.floor(Math.random() * 10);
    }
    return number;
}

module.exports = new AuthController();
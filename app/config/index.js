const config = {
    DEVELOPMENT: {
        port: 3000,
        saltRounds: 10,
        // SSH_KEY: "STAFF_AUGUMENTATION_APP_KEY",
        database: {
            host:"localhost",
            user:"root",
            password:"root",
            database:"test"
        },
        // smtp: {
        //     host: "smtp.ethereal.email",
        //     port: 465,
        //     secure: true, // use TLS
        //     auth: {
        //       user: "desmond67@ethereal.email",
        //       pass: "X5JG13aDkySfpwUEk3"
        //     }
        // },
    },
    STAGING: {
        port: 3001,
    },
    TEST: {
        port: 3002,
    },
    PRODUCTION: {
        port: 3001,
        saltRounds: 10,
        // SSH_KEY: "STAFF_AUGUMENTATION_APP_KEY",
        database: {
            host:"myutodb.c3cmg0eisx41.eu-north-1.rds.amazonaws.com",
            user:"admin",
            password:"qazwsxedc",
            database:"test"
        },
        // smtp: {
        //     host: "smtp.ethereal.email",
        //     port: 465,
        //     secure: true, // use TLS
        //     auth: {
        //       user: "desmond67@ethereal.email",
        //       pass: "X5JG13aDkySfpwUEk3"
        //     }
        // },
    }
}

process.env.config = JSON.stringify(config[process.env.MODE]);
module.exports = config[process.env.MODE];
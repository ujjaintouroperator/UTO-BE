const mysql = require('mysql2');

class BaseModel {
    constructor() {
        try {
            this.connection = mysql.createConnection(__env().database);
            this.mysql = mysql;
        } catch (err) {

        }
    }

    async query(query) {
        try {
            return new Promise((resolve, reject) => {
                this.connection.query(query, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(data);
                })
            })
        } catch (err) {

        }
    }

    async doSelect(query) {
        try {
            let data = await this.query(query);
            return data;
        } catch (err) {
            console.log("___err__", err);
        }
    }

    async doInsert(query) {
        try {
            let data = await this.query(query);
            return data;
        } catch (err) {

        }
    }

    async doUpdate(query) {
        try {
            let data = await this.query(query);
            return data;
        } catch (err) {

        }
    }

    async save(obj, table) {
        let query = `INSERT INTO ?? SET ?`;
        query = this.mysql.format(query, [table, obj]);
        let data = await this.query(query);
        return data.insertId;
    }

    async update(obj, id, table) {
        let query = `UPDATE ?? SET ? WHERE id = ?`;
        query = this.mysql.format(query, [table, obj, id]);

        let data = await this.query(query);
        return data.insertId;
    }

    async getCoreConfig(name) {
        let query = `SELECT value FROM core_configs WHERE name = ? and is_deleted = 0`;
        query = this.mysql.format(query, [name]);

        let data = await this.query(query);
        if (data && data.length) {
            return data[0].value;
        } else {
            return null;
        }
    }

    async updateOfArray(obj, column, id, ids, table) {
        let query = `UPDATE ?? SET ? WHERE ${column} = ? AND id NOT IN(?)`;
        query = this.mysql.format(query, [table, obj, id, ids]);


        let data = await this.query(query);
        return data.insertId;
    }

}

module.exports = BaseModel;
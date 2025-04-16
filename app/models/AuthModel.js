const BaseModel = require("./BaseModel");


class AuthModel extends BaseModel {
  constructor() {
    super();
  }

  async checkUserName(userName) {
    let query = `SELECT u.*, r.name as role_name, r.slug as role_slug FROM users as u
     INNER JOIN roles as r ON r.id = u.role_id
    WHERE u.user_name = ? AND u.is_deleted = 0`;
    query = this.mysql.format(query, [userName]);
    let user = await this.doSelect(query);
    return user;
  }

  async checkUserId(id) {
    let query = `SELECT u.*, r.name as role_name, r.slug as role_slug,smtp.* FROM users as u
     INNER JOIN roles as r ON r.id = u.role_id
     LEFT JOIN user_smtp_servers as smtp ON smtp.user_id=u.id
    WHERE u.id = ? AND u.is_deleted = 0`;
    query = this.mysql.format(query, [id]);
    let user = await this.doSelect(query);
    return user;
  }

  async getAccessMasters(roleId) {
    let query = `SELECT m.id, m.slug, m.name, m.icon
     FROM role_wise_master_permissions AS rm
     INNER JOIN masters AS m ON m.id = rm.master_id
     WHERE rm.role_id = ? AND m.is_deleted = 0 AND rm.is_deleted = 0;
     `;
    query = this.mysql.format(query, [roleId]);
    let masters = await this.doSelect(query);
    return masters;
  }
  async getsubmodule() {
    let query = `SELECT m.id, m.slug, m.name, m.icon, m.parent_id
    FROM masters AS m
    WHERE m.parent_id IS NOT NULL;
     `;
    let submodule = await this.doSelect(query);
    return submodule;
  }
  async getAgency(id) {
    let query = `SELECT ca.*,cac.phone_number from client_agencies ca INNER JOIN client_agencie_contacts cac ON (ca.id = cac.client_agencie_id) WHERE ca.is_deleted = 0 AND ca.id = ?`;
    query = this.mysql.format(query, [id]);
    let agency = await this.doSelect(query);
    if (agency && agency.length) {
      return agency[0];
    }
    return {};
  }

  async getOtp(username) {
    let query = `SELECT * from otp_verification WHERE is_deleted = 0 AND user_name = ? ORDER BY created_at DESC LIMIT 1`;
    query = this.mysql.format(query, [username]);
    let otp = await this.doSelect(query);
    return otp;
  }

  async checkValidDomain(agencyId, origin) {
    let chunk = ``;
    if (agencyId) {
      chunk = this.mysql.format(` AND id = ?`, [agencyId]);
    }
    let query = `SELECT domain from client_agencies WHERE is_deleted = 0 AND type = 'A' AND domain = ? ${chunk}`;
    query = this.mysql.format(query, [origin]);
    let domain = await this.doSelect(query);
    return domain;
  }
  async checksmtpexist(id) {
    let query = `select * from user_smtp_servers where is_deleted=0 and user_id=?`;
    query = this.mysql.format(query, [id]);
    let data = await this.doSelect(query);
    if (data) {
      return data;
    }
    else {
      return 0;
    }
  }


  async updateSmtp(obj, id, table) {
    let query = `UPDATE ?? SET ? WHERE user_id = ?`;
    query = this.mysql.format(query, [table, obj, id]);

    let data = await this.query(query);
    return data.insertId;
  }
}

module.exports = new AuthModel();
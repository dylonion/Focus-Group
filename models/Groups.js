const db = require('../db/config');

const Groups = {};

Groups.createGroup = (name, id) => {
  return db.one(`
    INSERT INTO groups
    (group_name, user_id, biz_id)
    VALUES($1,$2,$3)
    RETURNING *
  `,  [name, id, id])
}

module.exports = Groups;
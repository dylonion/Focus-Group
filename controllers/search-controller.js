const Search = require('../models/Search');

const searchController = {};

searchController.index = (req, res, next) => {
  Search.search(filters)
    .then(filters => {
      res.json({
        message: 'ok',
        filters: { filters }
      });
    }).catch(next)
};

module.exports = searchController;
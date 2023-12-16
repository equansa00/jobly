const { BadRequestError } = require("./expressError");

/**
 * Generate a SQL part for updating a set of columns.
 * 
 * This function creates a partial SQL string to be used in an UPDATE statement
 * and an array of values corresponding to the columns to be updated.
 * 
 * The function takes two arguments:
 * - dataToUpdate: an object where keys represent column names and values represent
 *   the new values for those columns. Column names can be in JavaScript's camelCase
 *   which will be converted to snake_case if provided in the jsToSql mapping.
 * - jsToSql: an optional object that maps JavaScript style camelCased variables to
 *   SQL style snake_cased columns.
 * 
 * Returns an object containing:
 * - setCols: String, columns and placeholders for an SQL UPDATE statement 
 *   (e.g., '"first_name"=$1, "age"=$2').
 * - values: Array, values corresponding to the placeholders in setCols.
 * 
 * Throws BadRequestError if dataToUpdate is empty.
 * 
 * Example usage:
 * sqlForPartialUpdate({ firstName: 'Aliya', age: 32 }, { firstName: "first_name" })
 * returns:
 * { setCols: '"first_name"=$1, "age"=$2', values: ['Aliya', 32] }
 * 
 * @param {Object} dataToUpdate - Object containing data to update
 * @param {Object} [jsToSql] - Optional mapping from JS style to SQL style column names
 * @returns {Object} Object containing SQL string and value array
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql = {}) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };

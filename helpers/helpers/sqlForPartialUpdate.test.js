const { sqlForPartialUpdate } = require("../sql");
const { BadRequestError } = require("../../expressError");

describe("sqlForPartialUpdate", () => {
  test("works: valid data and jsToSql mapping", () => {
    const dataToUpdate = { firstName: 'Aliya', age: 32 };
    const jsToSql = { firstName: "first_name" };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ['Aliya', 32]
    });
  });

  test("works: valid data without jsToSql mapping", () => {
    const dataToUpdate = { firstName: 'Aliya', age: 32 };
    const result = sqlForPartialUpdate(dataToUpdate);

    expect(result).toEqual({
      setCols: '"firstName"=$1, "age"=$2',
      values: ['Aliya', 32]
    });
  });

  test("throws BadRequestError with no data", () => {
    expect(() => {
      sqlForPartialUpdate({}, {});
    }).toThrow(BadRequestError);
  });
});

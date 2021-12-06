var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
const cors = require("cors")
const mysql = require('mysql');
const jwt = require('./jwtConfig')
const bcrypt = require("bcrypt");


const schema = buildSchema(`
  type Employee {    
    id_employee: Int
    name: String
    last_name: String
    email: String
    nationality: String
    phone: String
    civil_status: String
    birthday: String 
  }

  type LengthTable{
    length: Int
  }

  type Auth{
    token: String
    message: String
    full_name: String
  }

  type Query {
    getEmployees(page: Int!, pageSize: Int!): [Employee]
    getEmployeesByMatch(page: Int!, pageSize: Int!, match: String!): [Employee]
    getCountEmployees(page: Int!, pageSize: Int!): [LengthTable]
    getCountEmployeesByMatch(match: String): [LengthTable]
  }
  
  type Mutation {
    updateEmployee(id_employee: Int!,name: String ,last_name: String ,email: String ,nationality: String ,phone: String ,civil_status: String ,birthday: String ): Employee
    login(email: String!, password: String!): Auth
  }
`);

const queryDB = (req, sql, args) => new Promise((resolve, reject) => {
  req.mysqlDb.query(sql, args, (err, rows) => {
    if (err)
      return reject(err);
    rows.changedRows || rows.affectedRows || rows.insertId ? resolve(true) : resolve(rows);
  });
});



const root = {
  getCountEmployees: (args, req) => queryDB(req, "select count(*) as length from employees", [args.page, args.pageSize]).then(data => data),
  getEmployees: (args, req) => queryDB(req, "select *from employees limit ?,?", [args.page, args.pageSize]).then(data => data),
  updateEmployee: (args, req) => queryDB(req, "update employees SET ? where id_employee = ?", [args, args.id_employee]).then(data => args),
  getEmployeesByMatch: (args, req) => queryDB(req, `select *from employees where id_employee LIKE '%${args.match}%' OR name LIKE '%${args.match}%' OR last_name LIKE '%${args.match}%' OR email LIKE '%${args.match}%' OR nationality LIKE '%${args.match}%' OR phone LIKE '%${args.match}%' OR civil_status LIKE '%${args.match}%' OR birthday LIKE '%${args.match}%' limit ?,?`, [args.page, args.pageSize]).then(data => data),
  getCountEmployeesByMatch: (args, req) => queryDB(req, `select count(*) as length from (select *from employees where id_employee LIKE '%${args.match}%' OR name LIKE '%${args.match}%' OR last_name LIKE '%${args.match}%' OR email LIKE '%${args.match}%' OR nationality LIKE '%${args.match}%' OR phone LIKE '%${args.match}%' OR civil_status LIKE '%${args.match}%' OR birthday LIKE '%${args.match}%') as selectmatch`).then(data => data),
  
};

const rootPublic = {
  login: (args, req) => queryDB(req, "select *from users where email = ?", [args.email]).then((data) => {
    let { email, password, full_name } = data[0]
    let res = {
      token: null,
      message: 'invalid access',
      full_name: null
    }
    let valid = bcrypt.compareSync(args.password, password)
    if (valid) {
      res.token = jwt.generateToken(email)
      res.message = "valid access"
      res.full_name = full_name
    }
    return res
  })
}

var app = express();
app.use(cors())

app.use((req, res, next) => {
  req.mysqlDb = mysql.createConnection({
    host: 'us-cdbr-east-04.cleardb.com',
    user: 'b0785817b57ce9',
    password: 'd9dddeb8',
    database: 'heroku_7662354e71f5b0b'
  });
  req.mysqlDb.connect();
  next();
});

app.use('/public', graphqlHTTP({
  schema: schema,
  rootValue: rootPublic,
}));

app.use('/graphql', jwt.authenticationsJWT, graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.use(express.static(__dirname +'/public'))

app.listen(3000, () => console.log('Now browse to localhost:3000/graphql'));


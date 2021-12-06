const mysql=require("mysql")
const mysqlconection=mysql.createConnection({
    host: 'us-cdbr-east-04.cleardb.com',
    user: 'b0785817b57ce9',
    password: 'd9dddeb8',
    database: 'heroku_7662354e71f5b0b'
})
mysqlconection.connect(function (error){
    if(error){
        console.log(error)
        return
    }else{
        console.log("Conexion exitosa")
    }
    
})

module.exports=mysqlconection
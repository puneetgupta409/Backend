const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const underscore = require('underscore');
const hat = require('hat');
const saltRounds = 10;
const app = express();

app.use(express.json())

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'book'
});

connection.connect();

//connection.end();


// GET THE DATA FROM BOOKS TABLE
app.get('/get_books_data', (req, res) => {
    connection.query("select * from books", [], (error, results) => {
        if (error) {
            return res.send(error)
        } else {
            return res.send(results);
        }
    });
});


// GET THE DATA FROM LIMITED BOOKS TABLE
app.get('/get_books_data_limited', (req, res) => {
    connection.query("select * from limitedAddtionBooks", [], (error, results) => {
        if (error) {
            return res.send(error)
        } else {
            return res.send(results);
        }
    });
});

// INSERT THE DATA INTO LIMITED BOOK TABLE
app.post('/add_books_data_limited', (req, res) => {
    let values = [req.body.name_limited, req.body.count_limited, req.body.discription_limited];
    connection.query("INSERT INTO `limitedAddtionBooks` (name_limited , count_limited , discription_limited) VALUES(? , ? , ?)", values, (error, results) => {
        if (error) {
            return res.send(error)
        } else {
            if (results.affectedRows > 0) {
                return res.send({
                    status: 200,
                    message: "Limited Book data is Added Successfully",
                    data: {}
                });
            } else {
                return res.send({
                    status: 400,
                    message: "Limited Book  ID is not matched",
                    data: {}
                });
            }
        }
    });
});

// UPDATE  AND DELETE THE DATA OF LIMITED BOOK TABLE
app.post('/update_books_data_limited', (req, res) => {
    let values;
    let querry;
    if (req.body.value == 1) {
        values = [req.body.name_limited, req.body.count_limited, req.body.discription_limited, req.body.id, req.body.value];
        querry = "UPDATE limitedAddtionBooks SET name_limited = ? , count_limited = ? , discription_limited = ? WHERE id = ?";
    } else {
        values = [req.body.id, req.body.value];
        querry = "DELETE FROM limitedAddtionBooks WHERE id = ?"
    }

    connection.query(querry, values, (error, results) => {
        if (error) {
            return res.send(error)
        } else {
            if (results.affectedRows > 0) {
                if (req.body.value == 1) {
                    return res.send({
                        status: 200,
                        message: "Limited Book data is Updated Successfully",
                        data: {}
                    });
                } else {
                    return res.send({
                        status: 200,
                        message: "Limited Book data is Deleted Successfully",
                        data: {}
                    });
                }
            } else {
                return res.send({
                    status: 400,
                    message: "Limited Book  ID is not matched Successfully",
                    data: {}
                });
            }
        }
    });
});

// INSERT THE DATA INTO  BOOK TABLE
app.post('/add_books_data', (req, res) => {
    let values = [req.body.name, req.body.count, req.body.discription];
    connection.query("INSERT INTO `books` (name , count , discription) VALUES(? , ? , ?)", values, (error, results) => {
        if (error) {
            return res.send(error)
        } else {
            if (results.affectedRows > 0) {
                return res.send({
                    status: 200,
                    message: "Book data is Added Successfully",
                    data: {}
                });
            } else {
                return res.send({
                    status: 400,
                    message: "Book  ID is not matched",
                    data: {}
                });
            }
        }
    });
});

// UPDATE AND DELETE  THE DATA OF  BOOK TABLE
app.post('/update_books_data', (req, res) => {
    let values;
    let querry;
    if (req.body.value == 1) {
        values = [req.body.name, req.body.count, req.body.discription, req.body.id, req.body.value];
        querry = "UPDATE books SET name = ? , count = ? , discription = ? WHERE id = ?"
    } else {
        values = [req.body.id, req.body.value];
        querry = "DELETE FROM books WHERE id = ?";
    }
    connection.query(querry, values, (error, results) => {
        if (error) {
            return res.send(error)
        } else {
            if (results.affectedRows > 0) {
                if (req.body.value == 1) {
                    return res.send({
                        status: 200,
                        message: "Book data is Updated Successfully",
                        data: {}
                    });
                } else {
                    return res.send({
                        status: 200,
                        message: "Book data is Deleted Successfully",
                        data: {}
                    });
                }
            } else {
                return res.send({
                    status: 400,
                    message: "Limited Book  ID is not matched Successfully",
                    data: {}
                });
            }
        }
    });
});


// INSERT DATA INTO ADMIN LOGIN TABLE
app.post('/add_admin_user', (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        let sql = "INSERT INTO `admin_login` (name, email, password) VALUES (? , ? , ?)";
        let values = [req.body.name, req.body.email, hash];
        connection.query(sql, values, (error, results) => {
            if (error) {
                if (error.code == "ER_DUP_ENTRY") {
                    return res.send({
                        status: 400,
                        message: "User alerady exixts",
                        data: {}
                    });
                } else {
                    return res.send({
                        status: 400,
                        message: "Something Went Wrong",
                        data: {}
                    });
                }
            } else {
                if (results.affectedRows > 0) {
                    return res.send({
                        status: 200,
                        message: "User Added Successfully",
                        data: {}
                    });
                } else {
                    return res.send({
                        status: 400,
                        message: "ERROR FLEID NOT MATCHED",
                        data: {}
                    });
                }
            }
        });
    });
});


// USER LOGIN API
app.post('/login_admin_user', (req, res) => {
    let sql = "select * From admin_login where email = ?";
    let values = [req.body.email];
    let access_token_key = hat();
    connection.query(sql, values, (error, results) => {
        if (error) {
            return res.send(error)
        } else if (results && results.length > 0) {
            bcrypt.compare(req.body.password, results[0].password, (err, data) => {
                if (data) {
                     updateAccessToken(access_token_key,results);
                    return res.send({
                        status: 200,
                        message: "User Login Successfully",
                        data: {
                            access_token : access_token_key
                        }
                    });
                } else {
                    return res.send({
                        status: 400,
                        message: "Email or password not matched",
                        data: {}
                    });
                }
            });
        } else {
            return res.send({
                status: 400,
                message: "Email not registered",
                data: {}
            });
        }
    });
});

// FUNCTION TO UPDATE THE ACCESS TOKEN FOR USER IN DB//
function updateAccessToken(access_token_key,results) {
    let updatesql = "UPDATE admin_login SET access_token =" + JSON.stringify(access_token_key) + "WHERE email = "+ JSON.stringify(results[0].email) +"";
    connection.query(updatesql, (error, results) => {
        if(error){
            return (error);
        }  else if (results && results.length > 0) {
            return true;
        } else{
            return error;
        }
    });
}

/// ADMIN USER LOGOUT
app.post('/logout_admin_user', (req, res) => {
    let sql = "select * From admin_login where email = ?";
    let values = [req.body.email];
    connection.query(sql, values, (error, results) => {
        if(error){
            return res.send(error);
        } else  if (results && results.length > 0) {
            updateAccessTokenRemove(results);
            return res.send({
                status: 200,
                message: "User logout Successfully",
                data:{}
            });
        } else {
            return res.send({
                status: 400,
                message: "Email not registered",
                data: {}
            });
        }
    })
});

// FUNCTION TO REMOVE THE ACCESS TOKEN FROM DB
 function  updateAccessTokenRemove(results) {
     let updatesql = "UPDATE admin_login SET access_token =" + JSON.stringify(null) + " WHERE email = "+ JSON.stringify(results[0].email) +"";
     connection.query(updatesql, (error, results) => {
         if(error){
             return (error);
         }  else if (results && results.length > 0) {
             return true;
         } else{
             return error;
         }
     });
 }


// API TO GET THE DATA OF BOOKS AND LIMITED BOOKS COMBINE
app.get('/get_books_data_of_both', (req, res) => {
    var arrayToSend = [];
    var sql = "SELECT lmb.id, lmb.name_limited, lmb.count_limited, lmb.discription_limited, bks.name, bks.count, bks.discription FROM limitedAddtionBooks lmb LEFT JOIN books bks ON bks.id = lmb.id";
    connection.query(sql, [], (error, results) => {
        if (error) {
            return res.send(error)
        } else {
            for(let i =0 ; i < results.length ; i++) {
                if(results[i].name != null){
                    arrayToSend.push((results[i]));
                }
            }
            return res.send(arrayToSend);
        }
    });
});

app.listen(8000);
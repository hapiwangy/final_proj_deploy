import express from "express";
import bcrypt from "bcrypt-nodejs";
import cors from "cors";
import knex from "knex";


const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      port : 5432,
      password : 'mich890428',
      database : "'smart-brain'"
    }
});



const app = express();
app.use(express.json())
app.use(cors())


app.get('/', (req, res) => {
    res.send(database.users);
})

app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
        const isvalid = bcrypt.compareSync(req.body.password, data[0].hash)
        if (isvalid){
            return db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then ( user => {
                res.json(user[0])
            })
            .catch (err => res.status(400).json('unable to get user'))
        }
        else {
            res.status(400).json("wrong GG")
        }
    })
    .catch(err => res.status(400).json("wrong credentials"))
})

app.post('/register', (req, res) => {
    const {email, name, password} = req.body;
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash : hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
                .returning('*')// 這個代表回傳所有的東西
                .insert({
                    email: loginEmail[0].email,
                    name: name,
                    joined: new Date()
                })
                .then(user => {
                    res.json(user[0])
                })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })

})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users').where({
        id: id
    }).then(user => {
        if (user.length){
            res.json(user[0])
        } else{
            throw err;
        }
    })
    .catch(err => res.status(400).json("not so good"))
    // 沒找到人的話會回傳empty array
    

})

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id','=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('unable to get entries'))
})

app.listen(3000, () => {
    console.log('app is running on 3000');
})


// 下面是架構
/*
route --> http request = 回傳的東東
/ --> res = this is working
/signin --> post = success/ fail
/register --> post = user
/profile/:userId --> get = user  
/image --> put --> user
*/
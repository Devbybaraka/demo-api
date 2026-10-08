const express = require('express');
const cors = require('cors');
require('dotnev ').config();
const {prismaClient} = require ('@prisma/client');

const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/markets');

const app = express();
app.use(cors())
app.use(express.json())

app.get('/',(req, res) => {
    res.json({message: 'slime fish API running on postgress', db: 'postgreSQL + Prisma'});
});

app.use('/api/auth', authRoutes);
app.use('/api/markets', marketRoutes);

const PORT = process.env.PORT || 10000 ;

app.listen(PORT,() => console.log('server runin on ${port}'));
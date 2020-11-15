const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        if(process.env.NODE_ENV == 'production') {
            const conn = await mongoose.connect(process.env.MONGO_URI_PROD, {
                useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false,
            })
        } else {
            const conn = await mongoose.connect(process.env.MONGO_URI_DEV, {
                useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false,
            })
        }
        
    } catch (err) {
        console.log(err)
        process.exit(1)
    }
}

module.exports = connectDB

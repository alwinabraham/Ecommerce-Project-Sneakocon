const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}
module,exports.connect=function(done){
    const url='mongodb+srv://alwin:alwin123@cluster0.gor2ao8.mongodb.net/test'
    const dbname='shopping'

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })

    
}

module.exports.get=function(){
    return state.db
}
const { mongoose } = require('../config/db');

const leadSchema = new mongoose.Schema({

    leadId:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    pageId:{
        type:String,
    },
    formId:{
        type:String,
    },
    name:{
        type:String,
    },
    email:{
        type:String,
    },  
    phone:{
        type:String,
    },
    interest:{
        type:String,
    },
    createdTime:{
        type:Date,
    },  
    fieldData:{
        type:Array,
    },
    status:{
        type:String,
        default:'new'
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model('Lead', leadSchema);
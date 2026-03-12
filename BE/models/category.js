
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OjectId = Schema.Types.ObjectId;
const category = new Schema(
    {
        id: {type: OjectId}, // ko co _=> mongoose la _id
        name: {type: String, required: true},
        parentId: {type: OjectId, default: null, ref: 'category'},
    }
);


module.exports = mongoose.model('category', category);
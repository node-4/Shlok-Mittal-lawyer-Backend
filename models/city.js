const mongoose = require('mongoose');
const schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const DocumentSchema = schema({
        city: {
                type: String
        },
        image: {
                type: String
        },
        popular: {
                type: Number,
                default: 0
        },
        legalCategoryId: [{
                type: mongoose.SchemaTypes.ObjectId,
                ref: "category",
        }],
        governmentCategoryId: [{
                type: mongoose.SchemaTypes.ObjectId,
                ref: "category",
        }],
        status: {
                type: String,
                enum: ["ACTIVE", "BLOCKED"],
                default: "ACTIVE"
        }
}, { timestamps: true })
DocumentSchema.plugin(mongoosePaginate);
DocumentSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("city", DocumentSchema);
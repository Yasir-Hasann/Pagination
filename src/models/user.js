const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female'] },
    isEmailVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    status: { type: String, enum: ['alive', 'dead', 'deceased', 'lifeless', 'no more'] },
  },
  {
    timestamps: true
  }
);

UserSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('user', UserSchema);
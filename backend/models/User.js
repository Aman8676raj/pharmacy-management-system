const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userRoles = ['admin', 'pharmacist', 'cashier', 'inventory_manager'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: userRoles,
        message: '{VALUE} is not a valid user role',
      },
      default: 'pharmacist',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with stored hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Transform output to safely strip sensitive data
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : undefined;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.userRoles = userRoles;


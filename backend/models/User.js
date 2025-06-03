import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["candidate", "company"],
      required: [true, "User role is required"],
    },
    // Fields for company users
    companyName: {
      type: String,
      required: function () {
        return this.role === "company";
      },
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    // Fields for candidate users
    skills: [String],
    experience: [
      {
        title: String,
        company: String,
        location: String,
        from: Date,
        to: Date,
        current: Boolean,
        description: String,
      },
    ],
    education: [
      {
        school: String,
        degree: String,
        fieldOfStudy: String,
        from: Date,
        to: Date,
        current: Boolean,
        description: String,
      },
    ],
    notifications: [
      {
        type: {
          type: String,
          enum: ["message", "application", "status", "match", "system"],
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        data: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
        isRead: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
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

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;

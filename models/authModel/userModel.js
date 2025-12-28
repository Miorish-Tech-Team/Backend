const { DataTypes } = require("sequelize");
const { sequelize } = require("../../mysqlConnection/dbConnection");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("active", "suspended", "deleted"),
      defaultValue: "active",
    },
    canReview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    authProvider: {
      type: DataTypes.ENUM("local", "google"),
      defaultValue: "local",
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
    type: DataTypes.STRING,
    allowNull: true,
     },
    state: {
    type: DataTypes.STRING,
    allowNull: true,
    },
    country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
    zipCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
    role: {
      type: DataTypes.ENUM("user", "admin", "admin+", "superadmin", "seller"),
      defaultValue: "user",
    },
    profilePhoto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
     isTwoFactorAuthEnable: {
     type: DataTypes.BOOLEAN,
      defaultValue: false, 
  },
    verificationCode: {
      type: DataTypes.STRING,
    },
    verificationCodeExpiresAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    indexes: [
      // Index on email for faster lookups during login
      {
        name: 'idx_users_email',
        fields: ['email']
      },
      // Index on googleId for OAuth logins
      {
        name: 'idx_users_google_id',
        fields: ['googleId']
      },
      // Index on status for filtering active/suspended/deleted users
      {
        name: 'idx_users_status',
        fields: ['status']
      },
      // Index on role for role-based queries
      {
        name: 'idx_users_role',
        fields: ['role']
      },
      // Index on isVerified for filtering verified users
      {
        name: 'idx_users_is_verified',
        fields: ['isVerified']
      },
      // Index on authProvider for filtering login methods
      {
        name: 'idx_users_auth_provider',
        fields: ['authProvider']
      },
      // Composite index for status and role queries
      {
        name: 'idx_users_status_role',
        fields: ['status', 'role']
      },
      // Index on createdAt for sorting by registration date
      {
        name: 'idx_users_created_at',
        fields: ['createdAt']
      },
      // Index on phone for phone-based lookups
      {
        name: 'idx_users_phone',
        fields: ['phone']
      },
      // Composite index for location-based queries
      {
        name: 'idx_users_location',
        fields: ['country', 'state', 'city']
      }
    ]
  }
);

module.exports = User;

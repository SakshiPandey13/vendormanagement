const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

const seedData = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📡 Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Vendor.deleteMany();
    await Product.deleteMany();
    await Inventory.deleteMany();
    console.log('🗑️  Existing data cleared.');

    // 1. Create Admin User (let the model's pre-save hook hash the password)
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@vendorlink.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '9876543210',
    });
    console.log('✅ Admin user created.');

    // 2. Create Vendor User (let the model's pre-save hook hash the password)
    const vendorUser = await User.create({
      name: 'John Doe',
      email: 'vendor@vendorlink.com',
      password: 'Vendor@123',
      role: 'vendor',
      phone: '8765432109',
    });

    // 3. Create Vendor Profile linked to the User
    const vendorProfile = await Vendor.create({
      user: vendorUser._id,
      companyName: 'Apex Tech Solutions',
      ownerName: 'John Doe',
      email: 'vendor@vendorlink.com',
      phone: '8765432109',
      category: 'Electronics',
      address: '101, Technology Park, Phase 2',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411057',
      country: 'India',
      status: 'active',
      gstNumber: '27AAAAA1111A1Z1',
      panNumber: 'AAAAA1111A',
      rating: {
        delivery: 4.5,
        quality: 4.8,
        communication: 4.6,
        support: 4.4,
        overall: 4.6,
      },
      completionRate: 95,
      totalOrders: 20,
      completedOrders: 19,
      bankDetails: {
        accountName: 'Apex Tech Solutions',
        accountNumber: '123456789012',
        bankName: 'HDFC Bank',
        ifscCode: 'HDFC0000104',
        upiId: 'apextech@upi',
      },
    });

    // Update Vendor User with profile reference
    vendorUser.vendorProfile = vendorProfile._id;
    await vendorUser.save();
    console.log('✅ Vendor user and profile created.');

    // 4. Create Products
    const products = await Product.create([
      {
        name: 'Wireless Mouse Pro',
        sku: 'MS-WLS-PRO-01',
        category: 'Electronics',
        price: 850,
        unit: 'piece',
        stock: 50,
        minimumStock: 10,
        description: 'High precision ergonomic wireless mouse.',
        status: 'active',
      },
      {
        name: 'Mechanical Keyboard RGB',
        sku: 'KB-MEC-RGB-02',
        category: 'Electronics',
        price: 2400,
        unit: 'piece',
        stock: 30,
        minimumStock: 5,
        description: 'Tactile mechanical keyboard with customizable backlighting.',
        status: 'active',
      },
      {
        name: 'USB-C Hub 8-in-1',
        sku: 'HB-USBC-8IN1',
        category: 'Electronics',
        price: 1800,
        unit: 'piece',
        stock: 8,
        minimumStock: 10, // Will trigger a low stock alert
        description: 'Multi-port USB-C adapter for laptops.',
        status: 'active',
      },
    ]);
    console.log('✅ Products created.');

    // 5. Create Inventory records for the products
    for (const prod of products) {
      await Inventory.create({
        product: prod._id,
        currentStock: prod.stock,
        reservedStock: 0,
        availableStock: prod.stock,
        minimumStock: prod.minimumStock,
        reorderQuantity: 20,
        stockStatus: prod.stock === 0 ? 'out_of_stock' : prod.stock <= prod.minimumStock ? 'low_stock' : 'in_stock',
        warehouseLocation: 'Aisle B - Shelf 3',
      });
    }
    console.log('✅ Inventory records created.');

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedData();

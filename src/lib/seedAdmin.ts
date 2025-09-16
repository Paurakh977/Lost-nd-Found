import connectDB from './mongodb';
import User, { IUser } from '../models/User';
import { hashPassword } from './password';

export async function seedAdminUser() {
  try {
    await connectDB();
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gotus.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return existingAdmin;
    }
    
    // Create admin user
    const hashedPassword = await hashPassword(adminPassword);
    
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
      permissions: [
        'create_users',
        'edit_users',
        'delete_users',
        'view_all_users',
        'manage_system',
        'view_analytics',
        'export_data'
      ]
    });
    
    await adminUser.save();
    
    console.log('Admin user created successfully:', {
      email: adminEmail,
      password: adminPassword // In production, don't log passwords
    });
    
    return adminUser;
  } catch (error) {
    console.error('Error seeding admin user:', error);
    throw error;
  }
}

// Auto-seed on server startup
export async function initializeDatabase() {
  try {
    await seedAdminUser();
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

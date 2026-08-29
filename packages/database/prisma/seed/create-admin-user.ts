import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');

dotenv.config({ path: path.join(rootDir, '.env') });

import { UserRole } from '@prisma/client';
import { createAuthAdminClient } from '../../../auth/src/server/server-client';
import { prisma } from '../../src/client';

async function createAdmin() {
  const email = process.argv[2] || 'admin@elsesourav.com';
  const password = process.argv[3] || 'Admin@123456';
  const displayName = process.argv[4] || 'Sourav (Admin)';
  const username = process.argv[5] || 'elsesourav_admin';

  console.info(`🔑 Creating or promoting Admin account: ${email}`);

  const supabase = createAuthAdminClient();

  // 1. Create or get Supabase Auth user
  let supabaseAuthId = '';

  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Failed to list Supabase users:', listError.message);
  }

  const existingAuthUser = usersData?.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (existingAuthUser) {
    console.info(`  ✓ Found existing Supabase Auth user (ID: ${existingAuthUser.id})`);
    supabaseAuthId = existingAuthUser.id;

    // Update password & confirm email
    const { error: updateError } = await supabase.auth.admin.updateUserById(supabaseAuthId, {
      password,
      email_confirm: true,
      user_metadata: {
        displayName,
        username,
        role: 'ADMIN',
      },
    });

    if (updateError) {
      console.warn(`  ⚠ Could not update password in Supabase: ${updateError.message}`);
    } else {
      console.info('  ✓ Updated password and confirmed email in Supabase Auth');
    }
  } else {
    // Create new Supabase Auth user with confirmed email
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        displayName,
        username,
        role: 'ADMIN',
      },
    });

    if (createError || !createData.user) {
      console.error(`❌ Failed to create user in Supabase Auth: ${createError?.message}`);
      process.exit(1);
    }

    supabaseAuthId = createData.user.id;
    console.info(`  ✓ Created Supabase Auth user with confirmed email (ID: ${supabaseAuthId})`);
  }

  // 2. Upsert user in PostgreSQL database as ADMIN
  const dbUser = await prisma.user.upsert({
    where: { email },
    update: {
      supabaseAuthId,
      role: UserRole.ADMIN,
      displayName,
      username,
    },
    create: {
      supabaseAuthId,
      email,
      displayName,
      username,
      photoUrl: 'https://res.cloudinary.com/diqw2sjl8/image/upload/v1/avatars/elsesourav.png',
      bio: 'Platform Creator & Principal Architect.',
      role: UserRole.ADMIN,
      preferences: { theme: 'dark', emailNotifications: true, reduceMotion: false },
    },
  });

  console.info('\n===========================================================');
  console.info('✅ ADMIN ACCOUNT READY FOR LOGIN');
  console.info('===========================================================');
  console.info(`  Email:       ${dbUser.email}`);
  console.info(`  Password:    ${password}`);
  console.info(`  Role:        ${dbUser.role}`);
  console.info(`  Database ID: ${dbUser.id}`);
  console.info(`  Supabase ID: ${supabaseAuthId}`);
  console.info('===========================================================');
  console.info('👉 1. Sign In at:   http://localhost:3000/login');
  console.info('👉 2. Open Admin:   http://localhost:3000/admin');
  console.info('===========================================================\n');
}

createAdmin()
  .catch((err) => {
    console.error('❌ Error creating admin user:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

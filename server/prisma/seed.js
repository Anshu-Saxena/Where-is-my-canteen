import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { indiaDateString } from '../../src/utils/dates.js';
import {
  CANTEENS,
  MENU_ITEMS,
  PICKUP_SLOTS,
  REVIEWS,
  UNIVERSITIES
} from '../../src/data/mockData.js';

const prisma = new PrismaClient();
const DEFAULT_INSTRUCTIONS =
  'Walk up to the pickup shelf area and collect the bag matching your token number. If staff are present at the counter, show your order token.';
const DEFAULT_SHELVES = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'];
const DEMO_USERS = [
  {
    id: 'usr-student-01',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@dtu.ac.in',
    phone: '+91 98765 43210',
    role: 'student',
    rollNumber: '2023/CS/104',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    foodPreference: 'Vegetarian'
  },
  {
    id: 'usr-staff-01',
    name: 'Dr. Meenakshi Sundaram',
    email: 'meenakshi.s@dtu.ac.in',
    phone: '+91 98111 22334',
    role: 'staff',
    employeeId: 'EMP-DTU-4412',
    department: 'Electronics & Communication',
    designation: 'Associate Professor',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    foodPreference: 'Vegetarian'
  },
  {
    id: 'usr-guest-01',
    name: 'Guest Campus Visitor',
    email: 'visitor@guest.campus.in',
    phone: '+91 98000 00000',
    role: 'guest',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    foodPreference: 'All'
  },
  {
    id: 'usr-owner-01',
    name: 'Ramesh Sharma',
    email: 'ramesh.nescafe@campus.in',
    phone: '+91 98712 34567',
    role: 'canteen_owner',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    canteenId: 'canteen-1'
  },
  {
    id: 'usr-uni-admin-01',
    name: 'Prof. Alok Gupta',
    email: 'campus.admin@dtu.ac.in',
    phone: '+91 98100 99887',
    role: 'university_admin',
    designation: 'Dean of Student Affairs',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-platform-01',
    name: 'Aditi Deshmukh',
    email: 'superadmin@whereismycanteen.in',
    phone: '+91 99999 88888',
    role: 'platform_admin',
    designation: 'Central Operations Head',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  }
];

function toMinutes(value) {
  const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) throw new Error(`Invalid pickup-slot time: ${value}`);

  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return hour * 60 + Number(match[2]);
}

async function seedUniversities() {
  for (const university of UNIVERSITIES) {
    await prisma.university.upsert({
      where: { id: university.id },
      update: {
        name: university.name,
        shortName: university.shortName,
        city: university.city,
        state: university.state,
        verified: university.verified,
        verificationStatus: university.verified ? 'APPROVED' : 'PENDING',
        logo: university.logo,
        banner: university.banner
      },
      create: {
        id: university.id,
        name: university.name,
        shortName: university.shortName,
        city: university.city,
        state: university.state,
        verified: university.verified,
        verificationStatus: university.verified ? 'APPROVED' : 'PENDING',
        logo: university.logo,
        banner: university.banner
      }
    });

    for (const campus of university.campuses) {
      await prisma.campus.upsert({
        where: { id: campus.id },
        update: {
          universityId: university.id,
          name: campus.name,
          location: campus.location,
          isPopular: campus.isPopular
        },
        create: {
          id: campus.id,
          universityId: university.id,
          name: campus.name,
          location: campus.location,
          isPopular: campus.isPopular
        }
      });
    }
  }
}

async function seedCanteensAndMenus() {
  for (const canteen of CANTEENS) {
    const data = {
      campusId: canteen.campusId,
      name: canteen.name,
      tagline: canteen.tagline,
      coverImage: canteen.coverImage,
      logo: canteen.logo,
      rating: canteen.rating,
      reviewsCount: canteen.reviewsCount,
      priceRange: canteen.priceRange,
      priceCategory: canteen.priceCategory,
      location: canteen.location,
      openingHours: canteen.openingHours,
      isOpen: canteen.isOpen,
      estimatedPrepTime: canteen.estimatedPrepTime,
      categories: canteen.categories,
      pureVeg: canteen.pureVeg,
      hasVegOnly: canteen.hasVegOnly,
      acceptsPayAtCounter: canteen.acceptsPayAtCounter,
      featured: canteen.featured,
      ownerName: canteen.ownerName,
      ownerEmail: canteen.ownerEmail,
      contactNumber: canteen.contactNumber,
      description: canteen.description
    };

    await prisma.canteen.upsert({
      where: { id: canteen.id },
      update: data,
      create: { id: canteen.id, ...data }
    });
  }

  for (const item of MENU_ITEMS) {
    const data = {
      canteenId: item.canteenId,
      name: item.name,
      category: item.category,
      price: item.price,
      isVeg: item.isVeg,
      isSpecial: item.isSpecial ?? false,
      isRecommended: item.isRecommended ?? false,
      image: item.image,
      description: item.description,
      rating: item.rating,
      preparationTime: item.preparationTime,
      available: item.available,
      customizations: item.customizations ?? []
    };

    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: data,
      create: { id: item.id, ...data }
    });
  }
}

async function seedSlots() {
  const today = indiaDateString();
  const serviceDate = new Date(`${today}T00:00:00.000Z`);

  for (const canteen of CANTEENS) {
    for (const slot of PICKUP_SLOTS) {
      const startMinute = toMinutes(slot.time);
      const endMinute = toMinutes(slot.time.split(' - ')[1]);
      const id = `${canteen.id}-${slot.id}-${today}`;
      const data = {
        canteenId: canteen.id,
        serviceDate,
        timeLabel: slot.time,
        startMinute,
        endMinute,
        capacity: slot.capacity,
        isAvailable: slot.isAvailable
      };

      await prisma.pickupSlot.upsert({
        where: { id },
        update: {},
        create: { id, ...data }
      });
    }
  }
}

async function seedCanteenFeatures() {
  for (const canteen of CANTEENS) {
    const eligibleItems = MENU_ITEMS.filter(
      item =>
        item.canteenId === canteen.id &&
        ['Beverages', 'Snacks'].includes(item.category)
    );

    const expressConfig = await prisma.expressConfig.upsert({
      where: { canteenId: canteen.id },
      update: {},
      create: {
        canteenId: canteen.id,
        enabled: eligibleItems.length > 0,
        counterName: 'Express Counter',
        prepTimeMinutes: 5
      }
    });

    if (eligibleItems.length > 0) {
      await prisma.expressEligibleItem.createMany({
        data: eligibleItems.map(item => ({
          expressConfigId: expressConfig.id,
          menuItemId: item.id
        })),
        skipDuplicates: true
      });
    }

    const enabled = ['canteen-1', 'canteen-2'].includes(canteen.id);
    const pickupConfig = await prisma.pickupConfig.upsert({
      where: { canteenId: canteen.id },
      update: {},
      create: {
        canteenId: canteen.id,
        enabled,
        autoAssign: enabled,
        instructions: DEFAULT_INSTRUCTIONS
      }
    });

    if (enabled) {
      await prisma.pickupShelf.createMany({
        data: DEFAULT_SHELVES.map(label => ({
          pickupConfigId: pickupConfig.id,
          label
        })),
        skipDuplicates: true
      });
    }
  }
}

async function seedReviews() {
  for (const review of REVIEWS) {
    await prisma.review.upsert({
      where: { id: review.id },
      update: {
        canteenId: review.canteenId,
        userName: review.userName,
        userRole: review.userRole,
        userAvatar: review.userAvatar,
        rating: review.rating,
        comment: review.comment,
        canteenResponse: review.canteenResponse
      },
      create: {
        id: review.id,
        canteenId: review.canteenId,
        userName: review.userName,
        userRole: review.userRole,
        userAvatar: review.userAvatar,
        rating: review.rating,
        comment: review.comment,
        canteenResponse: review.canteenResponse
      }
    });
  }
}

async function seedDemoUsers() {
  if (process.env.SEED_DEMO_USERS !== 'true') return;
  const password = process.env.SEED_DEMO_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error('SEED_DEMO_PASSWORD must contain at least 12 characters when SEED_DEMO_USERS=true.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  for (const { canteenId, ...userData } of DEMO_USERS) {
    await prisma.user.upsert({
      where: { id: userData.id },
      update: { ...userData, passwordHash },
      create: { ...userData, passwordHash }
    });

    if (userData.id === 'usr-student-01') {
      for (const favoriteCanteenId of ['canteen-1', 'canteen-2']) {
        await prisma.userFavorite.upsert({
          where: {
            userId_canteenId: {
              userId: userData.id,
              canteenId: favoriteCanteenId
            }
          },
          update: {},
          create: { userId: userData.id, canteenId: favoriteCanteenId }
        });
      }
    }

    if (canteenId) {
      await prisma.canteenStaff.upsert({
        where: { userId_canteenId: { userId: userData.id, canteenId } },
        update: { role: 'OWNER' },
        create: { userId: userData.id, canteenId, role: 'OWNER' }
      });
    }
  }
}

try {
  await seedUniversities();
  await seedCanteensAndMenus();
  await seedSlots();
  await seedCanteenFeatures();
  await seedReviews();
  await seedDemoUsers();
  console.log('Seeded university, canteen, menu, slot, review, and optional demo-user data.');
} finally {
  await prisma.$disconnect();
}

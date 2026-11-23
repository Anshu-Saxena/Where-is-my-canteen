import {
  UNIVERSITIES,
  CANTEENS,
  MENU_ITEMS,
  PICKUP_SLOTS,
  REVIEWS,
  OWNER_ANALYTICS,
  UNIVERSITY_ADMIN_DATA,
  PLATFORM_ADMIN_DATA
} from '../data/mockData';

// Simulated latency helper for realistic API behavior
const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

export const universityService = {
  async getUniversities(search = '') {
    await delay();
    if (!search.trim()) return UNIVERSITIES;
    const q = search.toLowerCase();
    return UNIVERSITIES.filter(
      u => u.name.toLowerCase().includes(q) ||
           u.city.toLowerCase().includes(q) ||
           u.state.toLowerCase().includes(q)
    );
  },

  async getUniversityById(id) {
    await delay();
    return UNIVERSITIES.find(u => u.id === id) || null;
  }
};

export const canteenService = {
  async getCanteens({ campusId = 'dtu-main', category, search, vegOnly, sortBy } = {}) {
    await delay();
    let result = CANTEENS.filter(c => !campusId || c.campusId === campusId);

    if (search && search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.categories.some(cat => cat.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'All') {
      result = result.filter(c => c.categories.includes(category));
    }

    if (vegOnly) {
      result = result.filter(c => c.pureVeg);
    }

    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'popularity') {
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return result;
  },

  async getCanteenById(id) {
    await delay();
    return CANTEENS.find(c => c.id === id) || null;
  },

  async getMenuItems(canteenId, category = 'All') {
    await delay();
    let items = MENU_ITEMS.filter(item => item.canteenId === canteenId);
    if (category && category !== 'All') {
      items = items.filter(item => item.category === category);
    }
    return items;
  },

  async getPickupSlots(canteenId) {
    await delay();
    return PICKUP_SLOTS;
  }
};

export const reviewService = {
  async getCanteenReviews(canteenId) {
    await delay();
    return REVIEWS.filter(r => r.canteenId === canteenId);
  },

  async submitReview({ canteenId, rating, comment, userName, userRole, verifiedOrder = true }) {
    await delay(300);
    const newReview = {
      id: `rev-${Date.now()}`,
      canteenId,
      userName: userName || 'Student',
      userRole: userRole || 'Student',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      rating,
      date: 'Just now',
      comment,
      verifiedOrder
    };
    return newReview;
  }
};

export const ownerService = {
  async getAnalytics(canteenId) {
    await delay();
    return OWNER_ANALYTICS;
  },

  async verifyToken(token) {
    await delay(200);
    const trimmed = token.trim().toUpperCase();
    return {
      isValid: trimmed.startsWith('T-'),
      token: trimmed,
      message: trimmed.startsWith('T-') ? 'Valid token format' : 'Invalid token prefix'
    };
  }
};

export const adminService = {
  async getUniversityAdminData() {
    await delay();
    return UNIVERSITY_ADMIN_DATA;
  },

  async getPlatformAdminData() {
    await delay();
    return PLATFORM_ADMIN_DATA;
  }
};

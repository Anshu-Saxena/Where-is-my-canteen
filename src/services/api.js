import { apiRequest } from './apiClient';
import { indiaDateString } from '../utils/dates';
import {
  UNIVERSITIES,
  CANTEENS,
  MENU_ITEMS,
  PICKUP_SLOTS,
  REVIEWS
} from '../data/mockData';

function shouldUseLocalFallback(error) {
  return error.status === 500 || error.status === 503 || error.message?.includes('Cannot reach');
}

export const universityService = {
  async getUniversities(search = '') {
    try {
      const query = new URLSearchParams();
      if (search.trim()) query.set('search', search.trim());
      const suffix = query.size ? `?${query}` : '';
      const result = await apiRequest(`/universities${suffix}`);
      return result.universities;
    } catch (error) {
      if (shouldUseLocalFallback(error)) {
        const term = search.trim().toLowerCase();
        if (!term) return UNIVERSITIES;
        return UNIVERSITIES.filter(university =>
          university.name.toLowerCase().includes(term) ||
          university.city.toLowerCase().includes(term) ||
          university.state.toLowerCase().includes(term) ||
          university.shortName.toLowerCase().includes(term)
        );
      }
      throw error;
    }
  },

  async getUniversityById(id) {
    try {
      const result = await apiRequest(`/universities/${encodeURIComponent(id)}`);
      return result.university;
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }
};

export const canteenService = {
  async getCanteens({ campusId = 'dtu-main', category, search, vegOnly, sortBy } = {}) {
    try {
      const query = new URLSearchParams();
      if (category && category !== 'All') query.set('category', category);
      if (search?.trim()) query.set('search', search.trim());
      if (vegOnly) query.set('vegOnly', 'true');
      if (sortBy) query.set('sortBy', sortBy);
      const suffix = query.size ? `?${query}` : '';
      const result = await apiRequest(
        `/campuses/${encodeURIComponent(campusId)}/canteens${suffix}`
      );
      return result.canteens;
    } catch (error) {
      if (!shouldUseLocalFallback(error)) throw error;
      return CANTEENS.filter(canteen => canteen.campusId === campusId);
    }
  },

  async getCanteenById(id) {
    try {
      const result = await apiRequest(`/canteens/${encodeURIComponent(id)}`);
      return result.canteen;
    } catch (error) {
      if (error.status === 404) return null;
      if (shouldUseLocalFallback(error)) return CANTEENS.find(canteen => canteen.id === id) || null;
      throw error;
    }
  },

  async getMenuItems(canteenId, category = 'All') {
    try {
      const query = new URLSearchParams();
      if (category && category !== 'All') query.set('category', category);
      const suffix = query.size ? `?${query}` : '';
      const result = await apiRequest(
        `/canteens/${encodeURIComponent(canteenId)}/menu${suffix}`
      );
      return result.items;
    } catch (error) {
      if (!shouldUseLocalFallback(error)) throw error;
      return MENU_ITEMS.filter(item => item.canteenId === canteenId);
    }
  },

  async getPickupSlots(canteenId) {
    try {
      const query = new URLSearchParams({ date: indiaDateString() });
      const result = await apiRequest(
        `/canteens/${encodeURIComponent(canteenId)}/slots?${query}`
      );
      return result.slots;
    } catch (error) {
      if (!shouldUseLocalFallback(error)) throw error;
      return PICKUP_SLOTS;
    }
  }
};

export const reviewService = {
  async getCanteenReviews(canteenId) {
    try {
      const result = await apiRequest(`/canteens/${encodeURIComponent(canteenId)}/reviews`);
      return result.reviews;
    } catch (error) {
      if (!shouldUseLocalFallback(error)) throw error;
      return REVIEWS.filter(review => review.canteenId === canteenId);
    }
  },

  async submitReview({ canteenId, rating, comment }) {
    const result = await apiRequest(`/canteens/${encodeURIComponent(canteenId)}/reviews`, {
      method: 'POST',
      body: { rating, comment }
    });
    return result.review;
  },

  async respondToReview(reviewId, response) {
    const result = await apiRequest(
      `/owner/reviews/${encodeURIComponent(reviewId)}/response`,
      { method: 'PATCH', body: { response } }
    );
    return result.review;
  }
};

export const queueService = {
  async getCanteenQueue(canteenId) {
    const result = await apiRequest(`/canteens/${encodeURIComponent(canteenId)}/queue`);
    return result.queue;
  },

  async getOrderQueuePosition(orderId) {
    const result = await apiRequest(`/orders/${encodeURIComponent(orderId)}/queue`);
    return result;
  }
};

export const ownerService = {
  async getAnalytics(canteenId) {
    const result = await apiRequest(
      `/owner/canteens/${encodeURIComponent(canteenId)}/analytics`
    );
    return result.analytics;
  }
};

export const adminService = {
  async getUniversityAdminData() {
    const result = await apiRequest('/admin/university/dashboard');
    return result.data;
  },

  async getPlatformAdminData() {
    const result = await apiRequest('/admin/platform/dashboard');
    return result.data;
  },

  async updateApplicationStatus(applicationId, status) {
    const result = await apiRequest(
      `/admin/applications/${encodeURIComponent(applicationId)}`,
      { method: 'PATCH', body: { status } }
    );
    return result.application;
  },

  async updateUniversityVerification(universityId, status) {
    const result = await apiRequest(
      `/admin/universities/${encodeURIComponent(universityId)}/verification`,
      { method: 'PATCH', body: { status } }
    );
    return result.university;
  },

  async getUniversityCampuses() {
    const result = await apiRequest('/admin/campuses');
    return result;
  },

  async createCampus(data) {
    const result = await apiRequest('/admin/campuses', {
      method: 'POST',
      body: data
    });
    return result.campus;
  }
};

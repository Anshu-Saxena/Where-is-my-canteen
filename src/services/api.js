import { apiRequest } from './apiClient';
import { indiaDateString } from '../utils/dates';

export const universityService = {
  async getUniversities(search = '') {
    const query = new URLSearchParams();
    if (search.trim()) query.set('search', search.trim());
    const suffix = query.size ? `?${query}` : '';
    const result = await apiRequest(`/universities${suffix}`);
    return result.universities;
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
  },

  async getCanteenById(id) {
    try {
      const result = await apiRequest(`/canteens/${encodeURIComponent(id)}`);
      return result.canteen;
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  },

  async getMenuItems(canteenId, category = 'All') {
    const query = new URLSearchParams();
    if (category && category !== 'All') query.set('category', category);
    const suffix = query.size ? `?${query}` : '';
    const result = await apiRequest(
      `/canteens/${encodeURIComponent(canteenId)}/menu${suffix}`
    );
    return result.items;
  },

  async getPickupSlots(canteenId) {
    const query = new URLSearchParams({ date: indiaDateString() });
    const result = await apiRequest(
      `/canteens/${encodeURIComponent(canteenId)}/slots?${query}`
    );
    return result.slots;
  }
};

export const reviewService = {
  async getCanteenReviews(canteenId) {
    const result = await apiRequest(`/canteens/${encodeURIComponent(canteenId)}/reviews`);
    return result.reviews;
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

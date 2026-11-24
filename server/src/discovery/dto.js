export function toUniversityDto(university) {
  return {
    id: university.id,
    name: university.name,
    shortName: university.shortName,
    city: university.city,
    state: university.state,
    verified: university.verified,
    verificationStatus: university.verificationStatus,
    logo: university.logo,
    banner: university.banner,
    totalCampuses: university.campuses?.length,
    campuses: university.campuses?.map(campus => ({
      id: campus.id,
      name: campus.name,
      location: campus.location,
      canteensCount: campus._count?.canteens ?? 0,
      isPopular: campus.isPopular
    }))
  };
}

export function toCanteenDto(canteen) {
  return {
    id: canteen.id,
    universityId: canteen.campus?.universityId,
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
}

export function toMenuItemDto(item) {
  return {
    id: item.id,
    canteenId: item.canteenId,
    name: item.name,
    category: item.category,
    price: Number(item.price),
    isVeg: item.isVeg,
    isSpecial: item.isSpecial,
    isRecommended: item.isRecommended,
    image: item.image,
    description: item.description,
    rating: item.rating,
    preparationTime: item.preparationTime,
    available: item.available,
    customizations: item.customizations
  };
}

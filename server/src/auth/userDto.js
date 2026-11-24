export function toUserDto(user) {
  const ownerAssignment = user.canteenStaff?.find(item => item.role === 'OWNER');
  const favoriteIds = user.favorites?.map(favorite => favorite.canteenId) ?? [];

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    universityId: user.universityId,
    campusId: user.campusId,
    rollNumber: user.rollNumber,
    employeeId: user.employeeId,
    department: user.department,
    year: user.year,
    designation: user.designation,
    userCategory: user.userCategory,
    foodPreference: user.foodPreference,
    canteenId: ownerAssignment?.canteenId,
    canteenName: ownerAssignment?.canteen.name,
    favourites: favoriteIds
  };
}

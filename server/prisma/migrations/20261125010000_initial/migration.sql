-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('student', 'staff', 'guest', 'canteen_owner', 'university_admin', 'platform_admin');

-- CreateEnum
CREATE TYPE "CanteenStaffRole" AS ENUM ('OWNER', 'STAFF');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('standard', 'express', 'kiosk');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUND_INITIATED', 'REFUNDED', 'PAY_AT_COUNTER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "logo" TEXT,
    "banner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campus" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Canteen" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "coverImage" TEXT,
    "logo" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "priceRange" TEXT NOT NULL DEFAULT '₹',
    "priceCategory" TEXT,
    "location" TEXT NOT NULL,
    "openingHours" TEXT,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "estimatedPrepTime" TEXT NOT NULL DEFAULT '10-15 mins',
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pureVeg" BOOLEAN NOT NULL DEFAULT false,
    "hasVegOnly" BOOLEAN NOT NULL DEFAULT false,
    "acceptsPayAtCounter" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "ownerName" TEXT,
    "ownerEmail" TEXT,
    "contactNumber" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Canteen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'student',
    "avatar" TEXT,
    "universityId" TEXT,
    "campusId" TEXT,
    "rollNumber" TEXT,
    "employeeId" TEXT,
    "department" TEXT,
    "year" TEXT,
    "designation" TEXT,
    "userCategory" TEXT,
    "foodPreference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanteenStaff" (
    "userId" TEXT NOT NULL,
    "canteenId" TEXT NOT NULL,
    "role" "CanteenStaffRole" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CanteenStaff_pkey" PRIMARY KEY ("userId","canteenId")
);

-- CreateTable
CREATE TABLE "UserFavorite" (
    "userId" TEXT NOT NULL,
    "canteenId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFavorite_pkey" PRIMARY KEY ("userId","canteenId")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "canteenId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isVeg" BOOLEAN NOT NULL DEFAULT true,
    "isSpecial" BOOLEAN NOT NULL DEFAULT false,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "description" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "preparationTime" INTEGER NOT NULL DEFAULT 10,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "customizations" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupSlot" (
    "id" TEXT NOT NULL,
    "canteenId" TEXT NOT NULL,
    "serviceDate" DATE NOT NULL,
    "timeLabel" TEXT NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "currentBookings" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickupSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComboMeal" (
    "id" TEXT NOT NULL,
    "canteenId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComboMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComboItem" (
    "id" TEXT NOT NULL,
    "comboMealId" TEXT NOT NULL,
    "menuItemId" TEXT,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "ComboItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpressConfig" (
    "id" TEXT NOT NULL,
    "canteenId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "counterName" TEXT NOT NULL DEFAULT 'Express Counter',
    "prepTimeMinutes" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpressConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpressEligibleItem" (
    "expressConfigId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,

    CONSTRAINT "ExpressEligibleItem_pkey" PRIMARY KEY ("expressConfigId","menuItemId")
);

-- CreateTable
CREATE TABLE "PickupConfig" (
    "id" TEXT NOT NULL,
    "canteenId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "autoAssign" BOOLEAN NOT NULL DEFAULT false,
    "instructions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickupConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupShelf" (
    "id" TEXT NOT NULL,
    "pickupConfigId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PickupShelf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "displayId" TEXT NOT NULL,
    "tokenNumber" TEXT NOT NULL,
    "userId" TEXT,
    "universityId" TEXT,
    "campusId" TEXT,
    "canteenId" TEXT NOT NULL,
    "pickupSlotId" TEXT,
    "pickupShelfId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "orderType" "OrderType" NOT NULL DEFAULT 'standard',
    "pickupSlotLabel" TEXT,
    "itemSubtotal" DECIMAL(10,2) NOT NULL,
    "taxes" DECIMAL(10,2) NOT NULL,
    "convenienceFee" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "paymentIsTest" BOOLEAN NOT NULL DEFAULT false,
    "customerName" TEXT NOT NULL,
    "customerRoll" TEXT,
    "customerPhone" TEXT,
    "cancellationReason" TEXT,
    "readyAt" TIMESTAMP(3),
    "collectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT,
    "comboMealId" TEXT,
    "name" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "customization" TEXT NOT NULL DEFAULT 'Standard',

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "canteenId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" TEXT NOT NULL,
    "gateway" TEXT NOT NULL,
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'CREATED',
    "isTest" BOOLEAN NOT NULL DEFAULT false,
    "gatewayOrderId" TEXT,
    "gatewayPaymentId" TEXT,
    "idempotencyKey" TEXT,
    "signature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "gatewayEventId" TEXT,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "canteenId" TEXT NOT NULL,
    "userId" TEXT,
    "orderId" TEXT,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "userAvatar" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "canteenResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanteenApplication" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "canteenId" TEXT,
    "canteenName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanteenApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "University_city_state_idx" ON "University"("city", "state");

-- CreateIndex
CREATE INDEX "Campus_universityId_idx" ON "Campus"("universityId");

-- CreateIndex
CREATE UNIQUE INDEX "Campus_universityId_name_key" ON "Campus"("universityId", "name");

-- CreateIndex
CREATE INDEX "Canteen_campusId_isOpen_idx" ON "Canteen"("campusId", "isOpen");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_campusId_idx" ON "User"("role", "campusId");

-- CreateIndex
CREATE INDEX "CanteenStaff_canteenId_role_idx" ON "CanteenStaff"("canteenId", "role");

-- CreateIndex
CREATE INDEX "MenuItem_canteenId_category_available_idx" ON "MenuItem"("canteenId", "category", "available");

-- CreateIndex
CREATE INDEX "PickupSlot_canteenId_serviceDate_isAvailable_idx" ON "PickupSlot"("canteenId", "serviceDate", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "PickupSlot_canteenId_serviceDate_startMinute_key" ON "PickupSlot"("canteenId", "serviceDate", "startMinute");

-- CreateIndex
CREATE INDEX "ComboMeal_canteenId_available_idx" ON "ComboMeal"("canteenId", "available");

-- CreateIndex
CREATE INDEX "ComboItem_menuItemId_idx" ON "ComboItem"("menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ComboItem_comboMealId_menuItemId_key" ON "ComboItem"("comboMealId", "menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpressConfig_canteenId_key" ON "ExpressConfig"("canteenId");

-- CreateIndex
CREATE INDEX "ExpressEligibleItem_menuItemId_idx" ON "ExpressEligibleItem"("menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PickupConfig_canteenId_key" ON "PickupConfig"("canteenId");

-- CreateIndex
CREATE UNIQUE INDEX "PickupShelf_pickupConfigId_label_key" ON "PickupShelf"("pickupConfigId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "Order_displayId_key" ON "Order"("displayId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_tokenNumber_key" ON "Order"("tokenNumber");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_canteenId_status_createdAt_idx" ON "Order"("canteenId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_pickupSlotId_idx" ON "Order"("pickupSlotId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_gatewayOrderId_key" ON "PaymentTransaction"("gatewayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_gatewayPaymentId_key" ON "PaymentTransaction"("gatewayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_idempotencyKey_key" ON "PaymentTransaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PaymentTransaction_orderId_createdAt_idx" ON "PaymentTransaction"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentTransaction_canteenId_status_createdAt_idx" ON "PaymentTransaction"("canteenId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEvent_gatewayEventId_key" ON "PaymentEvent"("gatewayEventId");

-- CreateIndex
CREATE INDEX "PaymentEvent_paymentId_createdAt_idx" ON "PaymentEvent"("paymentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderId_key" ON "Review"("orderId");

-- CreateIndex
CREATE INDEX "Review_canteenId_createdAt_idx" ON "Review"("canteenId", "createdAt");

-- CreateIndex
CREATE INDEX "CanteenApplication_universityId_status_createdAt_idx" ON "CanteenApplication"("universityId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "Campus" ADD CONSTRAINT "Campus_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Canteen" ADD CONSTRAINT "Canteen_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanteenStaff" ADD CONSTRAINT "CanteenStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanteenStaff" ADD CONSTRAINT "CanteenStaff_canteenId_fkey" FOREIGN KEY ("canteenId") REFERENCES "Canteen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_canteenId_fkey" FOREIGN KEY ("canteenId") REFERENCES "Canteen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_canteenId_fkey" FOREIGN KEY ("canteenId") REFERENCES "Canteen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupSlot" ADD CONSTRAINT "PickupSlot_canteenId_fkey" FOREIGN KEY ("canteenId") REFERENCES "Canteen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboMeal" ADD CONSTRAINT "ComboMeal_canteenId_fkey" FOREIGN KEY ("canteenId") REFERENCES "Canteen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_comboMealId_fkey" FOREIGN KEY ("comboMealId") REFERENCES "ComboMeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpressConfig" ADD CONSTRAINT "ExpressConfig_canteenId_fkey" FOREIGN KEY ("canteenId") REFERENCES "Canteen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpressEligibleItem" ADD CONSTRAINT "ExpressEligibleItem_expressConfigId_fkey" FOREIGN KEY ("expressConfigId") REFERENCES "ExpressConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpressEligibleItem" ADD CONSTRAINT "ExpressEligibleItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupConfig" ADD CONSTRAINT "PickupConfig_canteenId_fkey" FOREIGN KEY ("canteenId") REFERENCES "Canteen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupShelf" ADD CONSTRAINT "PickupShelf_pickupConfigId_fkey" FOREIGN KEY ("pickupConfigId") REFERENCES "PickupConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_canteenId_fkey" FOREIGN KEY ("canteenId") REFERENCES "Canteen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_pickupSlotId_fkey" FOREIGN KEY ("pickupSlotId") REFERENCES "PickupSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_pickupShelfId_fkey" FOREIGN KEY ("pickupShelfId") REFERENCES "PickupShelf"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_comboMealId_fkey" FOREIGN KEY ("comboMealId") REFERENCES "ComboMeal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_canteenId_fkey" FOREIGN KEY ("canteenId") REFERENCES "Canteen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PaymentTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_canteenId_fkey" FOREIGN KEY ("canteenId") REFERENCES "Canteen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanteenApplication" ADD CONSTRAINT "CanteenApplication_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanteenApplication" ADD CONSTRAINT "CanteenApplication_canteenId_fkey" FOREIGN KEY ("canteenId") REFERENCES "Canteen"("id") ON DELETE SET NULL ON UPDATE CASCADE;


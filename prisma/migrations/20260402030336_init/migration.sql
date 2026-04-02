-- CreateEnum
CREATE TYPE "BusStatus" AS ENUM ('active', 'maintenance');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bus" (
    "id" SERIAL NOT NULL,
    "busNumber" TEXT NOT NULL,
    "totalSeats" INTEGER NOT NULL DEFAULT 40,
    "type" TEXT NOT NULL DEFAULT 'มาตรฐาน',
    "status" "BusStatus" NOT NULL DEFAULT 'active',
    "layout" JSONB,

    CONSTRAINT "Bus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "routeName" TEXT NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStation" (
    "id" SERIAL NOT NULL,
    "routeId" INTEGER NOT NULL,
    "stationName" TEXT NOT NULL,
    "stopOrder" INTEGER NOT NULL,

    CONSTRAINT "RouteStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" SERIAL NOT NULL,
    "busId" INTEGER NOT NULL,
    "routeId" INTEGER NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "departureTime" TEXT NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "passengerName" TEXT,
    "passengerPhone" TEXT,
    "pickupStationId" INTEGER NOT NULL,
    "dropoffStationId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_busNumber_key" ON "Bus"("busNumber");

-- CreateIndex
CREATE INDEX "Bus_status_idx" ON "Bus"("status");

-- CreateIndex
CREATE INDEX "Bus_type_idx" ON "Bus"("type");

-- CreateIndex
CREATE INDEX "Route_routeName_idx" ON "Route"("routeName");

-- CreateIndex
CREATE UNIQUE INDEX "RouteStation_routeId_stopOrder_key" ON "RouteStation"("routeId", "stopOrder");

-- CreateIndex
CREATE INDEX "Schedule_departureDate_departureTime_idx" ON "Schedule"("departureDate", "departureTime");

-- CreateIndex
CREATE INDEX "Schedule_routeId_departureDate_idx" ON "Schedule"("routeId", "departureDate");

-- CreateIndex
CREATE INDEX "Schedule_busId_departureDate_idx" ON "Schedule"("busId", "departureDate");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_busId_departureDate_departureTime_key" ON "Schedule"("busId", "departureDate", "departureTime");

-- CreateIndex
CREATE INDEX "Booking_scheduleId_createdAt_idx" ON "Booking"("scheduleId", "createdAt");

-- CreateIndex
CREATE INDEX "Booking_passengerPhone_idx" ON "Booking"("passengerPhone");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_scheduleId_seatNumber_key" ON "Booking"("scheduleId", "seatNumber");

-- AddForeignKey
ALTER TABLE "RouteStation" ADD CONSTRAINT "RouteStation_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_pickupStationId_fkey" FOREIGN KEY ("pickupStationId") REFERENCES "RouteStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_dropoffStationId_fkey" FOREIGN KEY ("dropoffStationId") REFERENCES "RouteStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

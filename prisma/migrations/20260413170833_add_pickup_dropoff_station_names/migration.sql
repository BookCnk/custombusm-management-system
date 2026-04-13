-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "dropoffStationName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "pickupStationName" TEXT NOT NULL DEFAULT '';

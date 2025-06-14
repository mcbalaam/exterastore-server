-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "title" TEXT,
    "timeoutDue" INTEGER,
    "profilePicture" TEXT NOT NULL,
    "isSupporter" BOOLEAN NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exteraPlugin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "exteraPlugin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pluginRelease" (
    "id" TEXT NOT NULL,
    "releaseNotes" TEXT,
    "file" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,

    CONSTRAINT "pluginRelease_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- AddForeignKey
ALTER TABLE "pluginRelease" ADD CONSTRAINT "pluginRelease_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "exteraPlugin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

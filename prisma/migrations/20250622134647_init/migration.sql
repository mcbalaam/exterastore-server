-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "timeoutDue" INTEGER,
    "profilePicture" TEXT NOT NULL,
    "isSupporter" BOOLEAN NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "preferences" JSONB,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exteraPlugin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "license" TEXT NOT NULL,
    "description" TEXT,
    "forkOriginId" TEXT,
    "reactions" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "targetPlatform" TEXT[],
    "tags" JSONB DEFAULT '{}',
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "hiddenReason" TEXT,

    CONSTRAINT "exteraPlugin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pluginRelease" (
    "id" TEXT NOT NULL,
    "releaseNotes" TEXT,
    "file" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "reactions" JSONB NOT NULL DEFAULT '{}',
    "downloads" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "releaseHash" TEXT NOT NULL,

    CONSTRAINT "pluginRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pluginStars" (
    "userId" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,

    CONSTRAINT "pluginStars_pkey" PRIMARY KEY ("userId","pluginId")
);

-- CreateTable
CREATE TABLE "activeSessions" (
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,

    CONSTRAINT "activeSessions_pkey" PRIMARY KEY ("userId","sessionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_telegramId_key" ON "user"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "pluginRelease_releaseHash_key" ON "pluginRelease"("releaseHash");

-- CreateIndex
CREATE UNIQUE INDEX "activeSessions_userId_key" ON "activeSessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "activeSessions_sessionId_key" ON "activeSessions"("sessionId");

-- AddForeignKey
ALTER TABLE "exteraPlugin" ADD CONSTRAINT "exteraPlugin_forkOriginId_fkey" FOREIGN KEY ("forkOriginId") REFERENCES "exteraPlugin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pluginRelease" ADD CONSTRAINT "pluginRelease_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "exteraPlugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pluginStars" ADD CONSTRAINT "pluginStars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pluginStars" ADD CONSTRAINT "pluginStars_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "exteraPlugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

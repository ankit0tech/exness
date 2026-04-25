-- CreateTable
CREATE TABLE "userinfo" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "googleId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'email',

    CONSTRAINT "userinfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "userinfo_email_key" ON "userinfo"("email");

-- CreateIndex
CREATE UNIQUE INDEX "userinfo_googleId_key" ON "userinfo"("googleId");

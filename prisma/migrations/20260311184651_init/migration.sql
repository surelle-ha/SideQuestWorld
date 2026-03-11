-- CreateTable
CREATE TABLE "sos_quests" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "map" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "issue" TEXT,
    "urgency" TEXT NOT NULL DEFAULT 'medium',
    "is_boss" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'open',
    "helpers" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sos_quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_heroes" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "quest_id" TEXT NOT NULL,
    "committed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quest_heroes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sos_quests_ticket_id_key" ON "sos_quests"("ticket_id");

-- AddForeignKey
ALTER TABLE "quest_heroes" ADD CONSTRAINT "quest_heroes_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "sos_quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

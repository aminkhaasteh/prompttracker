-- CreateTable
CREATE TABLE "public"."LLMResponse" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LLMResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Mention" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "llmResponseId" INTEGER NOT NULL,

    CONSTRAINT "Mention_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Mention" ADD CONSTRAINT "Mention_llmResponseId_fkey" FOREIGN KEY ("llmResponseId") REFERENCES "public"."LLMResponse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

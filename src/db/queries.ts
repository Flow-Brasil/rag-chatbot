import { PrismaClient, Prisma } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export async function saveChat({
  id,
  messages,
}: {
  id: string;
  messages: any;
}) {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id },
    });

    const messagesJson = messages as Prisma.InputJsonValue[];

    if (chat) {
      return await prisma.chat.update({
        where: { id },
        data: {
          messages: messagesJson,
        },
      });
    }

    return await prisma.chat.create({
      data: {
        id,
        messages: messagesJson,
      },
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await prisma.chat.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChats() {
  try {
    return await prisma.chat.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error("Failed to get chats from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    return await prisma.chat.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

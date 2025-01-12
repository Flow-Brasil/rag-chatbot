import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getMessages(chatId: string) {
  return prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function saveMessage(chatId: string, message: any) {
  return prisma.message.create({
    data: {
      chatId,
      ...message,
    },
  });
}

export async function getChats() {
  return prisma.chat.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getChat(id: string) {
  return prisma.chat.findUnique({
    where: { id },
  });
}

export async function createChat() {
  return prisma.chat.create({
    data: {},
  });
}

export async function deleteChat(id: string) {
  return prisma.chat.delete({
    where: { id },
  });
}

export async function getChatById(id: string) {
  return prisma.chat.findUnique({
    where: { id },
    include: {
      messages: true,
    },
  });
}

export async function getChatsByUserId(userId: string) {
  return prisma.chat.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      messages: true,
    },
  });
} 
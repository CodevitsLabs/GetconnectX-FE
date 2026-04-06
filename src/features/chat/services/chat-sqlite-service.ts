import * as SQLite from 'expo-sqlite';

import type { ChatConversation, ChatConversationKind, ChatMessage, ChatMessageStatus } from '../types/chat.types';

const CHAT_DATABASE_NAME = 'connectx-chat.db';
const LOCAL_MESSAGE_LIMIT = 30;

const seededConversations = [
  {
    id: 'maya-chen',
    kind: 'direct',
    name: 'Maya Chen',
    unreadCount: 2,
  },
  {
    id: 'ops-squad',
    kind: 'group',
    name: 'Ops Squad',
    unreadCount: 0,
  },
  {
    id: 'jess-alvarez',
    kind: 'direct',
    name: 'Jess Alvarez',
    unreadCount: 0,
  },
] as const satisfies readonly {
  id: string;
  kind: ChatConversationKind;
  name: string;
  unreadCount: number;
}[];

const seededMessages = [
  {
    id: 'maya-1',
    conversationId: 'maya-chen',
    body: 'Love the direction. Want to jump into a quick intro tomorrow?',
    direction: 'incoming',
    status: 'read',
    createdAt: '2026-04-04T08:58:00.000Z',
  },
  {
    id: 'maya-2',
    conversationId: 'maya-chen',
    body: 'I can do a short call after lunch if that works on your side.',
    direction: 'incoming',
    status: 'read',
    createdAt: '2026-04-04T09:12:00.000Z',
  },
  {
    id: 'maya-3',
    conversationId: 'maya-chen',
    body: 'Perfect. I will send over a few questions before then.',
    direction: 'outgoing',
    status: 'sent',
    createdAt: '2026-04-04T09:14:00.000Z',
  },
  {
    id: 'ops-1',
    conversationId: 'ops-squad',
    body: 'We can cover onboarding copy once the OTP flow is real.',
    direction: 'incoming',
    status: 'read',
    createdAt: '2026-04-04T08:42:00.000Z',
  },
  {
    id: 'ops-2',
    conversationId: 'ops-squad',
    body: 'Agreed. I will keep the draft loose until auth is hooked to the backend.',
    direction: 'outgoing',
    status: 'sent',
    createdAt: '2026-04-04T08:50:00.000Z',
  },
  {
    id: 'jess-1',
    conversationId: 'jess-alvarez',
    body: 'I sent over the deck notes and a quick summary.',
    direction: 'incoming',
    status: 'read',
    createdAt: '2026-04-04T07:35:00.000Z',
  },
  {
    id: 'jess-2',
    conversationId: 'jess-alvarez',
    body: 'Thanks, reading now. I like how clearly you framed the first-time user journey.',
    direction: 'outgoing',
    status: 'sent',
    createdAt: '2026-04-04T07:39:00.000Z',
  },
] as const satisfies readonly ChatMessage[];

type ConversationRow = {
  id: string;
  kind: ChatConversationKind;
  messagesStored: number;
  name: string;
  previewText: string;
  unreadCount: number;
  updatedAt: string;
};

type MessageRow = {
  body: string;
  conversationId: string;
  createdAt: string;
  direction: ChatMessage['direction'];
  id: string;
  status: ChatMessageStatus;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function createMessageId(conversationId: string) {
  return `${conversationId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mapConversationRow(row: ConversationRow): ChatConversation {
  return {
    id: row.id,
    kind: row.kind,
    lastMessageAt: row.updatedAt,
    messagesStored: row.messagesStored,
    name: row.name,
    preview: row.previewText,
    unreadCount: row.unreadCount,
  };
}

function mapMessageRow(row: MessageRow): ChatMessage {
  return {
    body: row.body,
    conversationId: row.conversationId,
    createdAt: row.createdAt,
    direction: row.direction,
    id: row.id,
    status: row.status,
  };
}

async function pruneConversationMessages(
  database: SQLite.SQLiteDatabase,
  conversationId: string
) {
  await database.runAsync(
    `
      DELETE FROM messages
      WHERE conversation_id = ?
        AND id NOT IN (
          SELECT id
          FROM messages
          WHERE conversation_id = ?
          ORDER BY datetime(created_at) DESC
          LIMIT ?
        )
    `,
    conversationId,
    conversationId,
    LOCAL_MESSAGE_LIMIT
  );
}

async function seedMockChatData(database: SQLite.SQLiteDatabase) {
  const existingConversationCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM conversations'
  );

  if ((existingConversationCount?.count ?? 0) > 0) {
    return;
  }

  for (const conversation of seededConversations) {
    const conversationMessages = seededMessages
      .filter((message) => message.conversationId === conversation.id)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
    const lastMessage = conversationMessages.at(-1);

    await database.runAsync(
      `
        INSERT INTO conversations (id, name, kind, preview_text, unread_count, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      conversation.id,
      conversation.name,
      conversation.kind,
      lastMessage?.body ?? 'No messages yet',
      conversation.unreadCount,
      lastMessage?.createdAt ?? new Date().toISOString()
    );

    for (const message of conversationMessages) {
      await database.runAsync(
        `
          INSERT INTO messages (id, conversation_id, body, direction, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        message.id,
        message.conversationId,
        message.body,
        message.direction,
        message.status,
        message.createdAt
      );
    }

    await pruneConversationMessages(database, conversation.id);
  }
}

async function initializeDatabase() {
  const database = await SQLite.openDatabaseAsync(CHAT_DATABASE_NAME);

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      preview_text TEXT NOT NULL,
      unread_count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY NOT NULL,
      conversation_id TEXT NOT NULL,
      body TEXT NOT NULL,
      direction TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS messages_conversation_id_created_at_idx
      ON messages (conversation_id, created_at DESC);
  `);

  await seedMockChatData(database);

  return database;
}

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = initializeDatabase();
  }

  return databasePromise;
}

export async function listMockConversations() {
  const database = await getDatabase();
  const rows = await database.getAllAsync<ConversationRow>(
    `
      SELECT
        conversations.id,
        conversations.name,
        conversations.kind,
        conversations.preview_text AS previewText,
        conversations.unread_count AS unreadCount,
        conversations.updated_at AS updatedAt,
        COUNT(messages.id) AS messagesStored
      FROM conversations
      LEFT JOIN messages ON messages.conversation_id = conversations.id
      GROUP BY conversations.id
      ORDER BY datetime(conversations.updated_at) DESC
    `
  );

  return rows.map(mapConversationRow);
}

export async function listMockMessages(conversationId: string) {
  const database = await getDatabase();
  const rows = await database.getAllAsync<MessageRow>(
    `
      SELECT
        id,
        conversation_id AS conversationId,
        body,
        direction,
        status,
        created_at AS createdAt
      FROM messages
      WHERE conversation_id = ?
      ORDER BY datetime(created_at) DESC
      LIMIT ?
    `,
    conversationId,
    LOCAL_MESSAGE_LIMIT
  );

  return rows.reverse().map(mapMessageRow);
}

export async function appendMockMessage(conversationId: string, body: string) {
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    throw new Error('Message body cannot be empty.');
  }

  const database = await getDatabase();
  const createdAt = new Date().toISOString();
  const nextMessage: ChatMessage = {
    body: trimmedBody,
    conversationId,
    createdAt,
    direction: 'outgoing',
    id: createMessageId(conversationId),
    status: 'sent',
  };

  await database.runAsync(
    `
      INSERT INTO messages (id, conversation_id, body, direction, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    nextMessage.id,
    nextMessage.conversationId,
    nextMessage.body,
    nextMessage.direction,
    nextMessage.status,
    nextMessage.createdAt
  );

  await database.runAsync(
    `
      UPDATE conversations
      SET preview_text = ?, unread_count = 0, updated_at = ?
      WHERE id = ?
    `,
    nextMessage.body,
    nextMessage.createdAt,
    conversationId
  );

  await pruneConversationMessages(database, conversationId);

  return nextMessage;
}

export async function resetMockChatData() {
  const database = await getDatabase();

  await database.execAsync(`
    DELETE FROM messages;
    DELETE FROM conversations;
  `);

  await seedMockChatData(database);
}

export { LOCAL_MESSAGE_LIMIT };

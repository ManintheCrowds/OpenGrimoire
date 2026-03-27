import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const attendees = sqliteTable(
  'attendees',
  {
    id: text('id').primaryKey(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name'),
    email: text('email').unique(),
    isAnonymous: integer('is_anonymous', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [index('idx_attendees_email').on(t.email), index('idx_attendees_created_at').on(t.createdAt)]
);

export const surveyResponses = sqliteTable(
  'survey_responses',
  {
    id: text('id').primaryKey(),
    attendeeId: text('attendee_id')
      .notNull()
      .references(() => attendees.id, { onDelete: 'cascade' }),
    tenureYears: integer('tenure_years'),
    learningStyle: text('learning_style'),
    shapedBy: text('shaped_by'),
    peakPerformance: text('peak_performance'),
    motivation: text('motivation'),
    uniqueQuality: text('unique_quality'),
    status: text('status', { enum: ['pending', 'approved', 'rejected'] })
      .notNull()
      .default('pending'),
    moderatedAt: text('moderated_at'),
    testData: integer('test_data', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [
    index('idx_survey_responses_attendee_id').on(t.attendeeId),
    index('idx_survey_responses_created_at').on(t.createdAt),
  ]
);

export const peakPerformanceDefinitions = sqliteTable(
  'peak_performance_definitions',
  {
    id: text('id').primaryKey(),
    type: text('type').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [
    index('idx_peak_performance_definitions_type').on(t.type),
    uniqueIndex('peak_performance_definitions_type_title_unique').on(t.type, t.title),
  ]
);

export const moderation = sqliteTable(
  'moderation',
  {
    id: text('id').primaryKey(),
    responseId: text('response_id')
      .notNull()
      .references(() => surveyResponses.id, { onDelete: 'cascade' }),
    fieldName: text('field_name').notNull(),
    status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
    moderatorId: text('moderator_id').notNull(),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [
    index('idx_moderation_response_id').on(t.responseId),
    index('idx_moderation_status').on(t.status),
    uniqueIndex('moderation_response_field_unique').on(t.responseId, t.fieldName),
  ]
);

export const alignmentContextItems = sqliteTable(
  'alignment_context_items',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    body: text('body'),
    /** JSON array of strings */
    tags: text('tags').notNull().default('[]'),
    priority: integer('priority'),
    status: text('status', { enum: ['draft', 'active', 'archived'] }).notNull().default('draft'),
    linkedNodeId: text('linked_node_id'),
    attendeeId: text('attendee_id').references(() => attendees.id, { onDelete: 'set null' }),
    source: text('source', { enum: ['ui', 'import', 'api'] }).notNull(),
    createdBy: text('created_by'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [
    index('idx_alignment_context_items_status').on(t.status),
    index('idx_alignment_context_items_created_at').on(t.createdAt),
  ]
);
